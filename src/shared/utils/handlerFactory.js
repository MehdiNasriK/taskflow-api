import catchAsync from "./catchAsync.js";
import prisma from "../config/prisma.js";
import AppError from "../../shared/utils/error.js";

const createOne = (model, allowedField) => {
  return catchAsync(async (req, res, next) => {
    const reqBody = req.body;
    const keyBody = Object.keys(reqBody);
    const includeKey = allowedField;

    keyBody.forEach((el) => {
      if (!includeKey.includes(el)) delete reqBody[el];
    });

    if (Object.keys(reqBody).length === 0)
      return next(new AppError(400, "no data for creating"));

    if (req.projectId) reqBody.projectId = req.projectId * 1;
    if (req.taskId) reqBody.taskId = req.taskId * 1;

    reqBody.creatorId = req.user.id;
    const data = await prisma[model].create({
      data: reqBody,
    });

    res.json({
      data,
    });
  });
};

const getOne = (model) => {
  return catchAsync(async (req, res, next) => {
    const id = req.params.id * 1;
    let data;
    if (model === "project") {
      data = await prisma[model].findUnique({
        where: {
          id,
          creatorId: req.user.id,
        },
        include: {
          tasks: true,
        },
      });
    } else {
      data = await prisma[model].findUnique({
        where: {
          id,
          creatorId: req.user.id,
        },
      });
    }

    if (!data) return next(new AppError(404, `${task} no longer exist`));

    res.json({
      data,
    });
  });
};

const deleteOne = (model) => {
  return catchAsync(async (req, res, next) => {
    const id = req.params.id * 1;
    await prisma[model].delete({
      where: {
        id,
        creatorId: req.user.id,
      },
    });

    res.json({
      data: null,
    });
  });
};

const updateOne = (model, allowedField) => {
  return catchAsync(async (req, res, next) => {
    const reqBody = req.body;
    const keyBody = Object.keys(reqBody);
    const allowedKey = allowedField;

    keyBody.forEach((el) => {
      if (!allowedKey.includes(el)) delete reqBody[el];
    });

    if (Object.keys(reqBody).length === 0)
      return next(new AppError(400, "there is nothing to update"));

    const id = req.params.id * 1;
    const data = await prisma[model].update({
      where: {
        id,
        creatorId: req.user.id,
      },
      data: reqBody,
    });

    res.json({
      data,
    });
  });
};

const getAll = (model) => {
  return catchAsync(async (req, res, next) => {
    const data = await prisma[model].findMany({
      where: {
        creatorId: req.user.id,
      },
    });

    res.json({
      data,
    });
  });
};

const deleteAll = (model) => {
  return catchAsync(async (req, res, next) => {
    await prisma[model].deleteMany({
      where: {
        creatorId: req.user.id,
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
