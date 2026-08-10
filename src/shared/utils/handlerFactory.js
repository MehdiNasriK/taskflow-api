import catchAsync from "./catchAsync.js";
import prisma from "../config/prisma.js";
import AppError from "../../shared/utils/error.js";
import ApiFeature from "./apiFeature.js";
import { redis } from "../config/redis.js";

const createOne = (model) => {
  return catchAsync(async (req, res, next) => {
    if (Object.keys(req.body).length === 0)
      return next(new AppError(400, "no data for creating"));

    if (req.projectId) req.body.projectId = req.projectId * 1;
    if (req.taskId) req.body.taskId = req.taskId * 1;

    req.body.creatorId = req.user.id;
    const data = await prisma[model].create({
      data: req.body,
    });

    const keys = await redis.keys(`*${model}*`);
    while (keys.length > 0) {
      await redis.del(keys[0]);
      keys.shift();
    }

    await prisma.activityLog.create({
      data: {
        action: `create_${model.toUpperCase()}`,
        entityType: model.toUpperCase(),
        entityId: data.id,
        userId: req.user.id,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      },
    });

    res.json({
      data,
    });
  });
};

const getOne = (model) => {
  return catchAsync(async (req, res, next) => {
    const id = req.params.taskId * 1 || req.params.id * 1;

    const redisKey = `${model}id:${id}`;
    let data;
    const redisData = await redis.get(redisKey);
    if(data) data = JSON.parse(redisData);
    if (model === "project" && !data) {
      data = await prisma[model].findUnique({
        where: {
          id,
          creatorId: req.user.id,
        },
        include: {
          tasks: true,
        },
      });
      redis.setEx(redisKey, 60, JSON.stringify(data));
    } else if (!data) {
      data = await prisma[model].findUnique({
        where: {
          id,
          creatorId: req.user.id,
        },
        include: {
          comments: true,
        },
      });
      redis.setEx(redisKey, 60, JSON.stringify(data));
    }

    if (!data) return next(new AppError(404, `${model} no longer exist`));

    res.json({
      data,
    });
  });
};

const deleteOne = (model) => {
  return catchAsync(async (req, res, next) => {
    const id =
      req.params.commentId * 1 || req.params.taskId * 1 || req.params.id * 1;

    const data = await prisma[model].delete({
      where: {
        id,
        creatorId: req.user.id,
      },
    });

    const keys = await redis.keys(`*${model}*`);
    while (keys.length > 0) {
      await redis.del(keys[0]);
      keys.shift();
    }

    await prisma.activityLog.create({
      data: {
        action: `DELETE_${model.toUpperCase()}`,
        entityType: model.toUpperCase(),
        entityId: data.id,
        ipAddress: req.ip,
        userAgent: req.headers["user_agent"],
        userId: req.user.id,
      },
    });

    res.json({
      data: null,
    });
  });
};

const updateOne = (model) => {
  return catchAsync(async (req, res, next) => {
    if (Object.keys(req.body).length === 0)
      return next(new AppError(400, "there is nothing to update"));

    const id =
      req.params.commentId * 1 || req.params.taskId * 1 || req.params.id * 1;
    const oldData = await prisma[model].findUnique({
      where: {
        id,
        creatorId: req.user.id,
      },
    });
    const data = await prisma[model].update({
      where: {
        id,
        creatorId: req.user.id,
      },
      data: req.body,
    });

    const keys = await redis.keys(`*${model}*`);
    while (keys.length > 0) {
      await redis.del(keys[0]);
      keys.shift();
    }

    await prisma.activityLog.create({
      data: {
        action: `UPDATE_${model.toUpperCase()}`,
        entityType: model.toUpperCase(),
        entityId: data.id,
        oldData,
        newData: data,
        ipAddress: req.ip,
        userAgent: req.headers["user_agent"],
        userId: req.user.id,
      },
    });

    res.json({
      data,
    });
  });
};

const getAll = (model) => {
  return catchAsync(async (req, res, next) => {
    const queryObject = new ApiFeature(req.query)
      .filter()
      .search()
      .sort()
      .pagination()
      .build();

    let data;
    const redisKey = `${Object.entries(req.query).join(":") || "all"}:${model}:${req.user.id}:${req.projectId || "none"}:${req.taskId || "none"}`;
    const redisData = await redis.get(redisKey);
    if (redisData) data = JSON.parse(redisData);

    if (!redisData) {
      queryObject.where.creatorId = req.user.id * 1;
      queryObject.where.projectId = req.projectId * 1 || undefined;
      queryObject.where.taskId = req.taskId * 1 || undefined;
      data = await prisma[model].findMany(queryObject);
      await redis.setEx(redisKey, 5 * 60, JSON.stringify(data));
    }

    res.json({
      data,
    });
  });
};

const deleteAll = (model) => {
  return catchAsync(async (req, res, next) => {
    const where = {};
    where.creatorId = req.user.id * 1;
    where.projectId = req.projectId * 1 || undefined;
    where.taskId = req.taskId * 1 || undefined;

    const data = await prisma[model].deleteMany({
      where,
    });

    await prisma.activityLog.create({
      data: {
        action: `DELETE_${model.toUpperCase()}`,
        entityType: model.toUpperCase(),
        ipAddress: req.ip,
        userAgent: req.headers["user_agent"],
        userId: req.user.id,
      },
    });

    res.json({
      data: null,
    });
  });
};

export default {
  createOne,
  getOne,
  deleteOne,
  updateOne,
  getAll,
  deleteAll,
};
