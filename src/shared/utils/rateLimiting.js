import { redis } from "../config/redis.js";
import catchAsync from "./catchAsync.js";
import AppError from "./error.js";

export const rateLimiter = (limit, window) => {
  return catchAsync(async (req, res, next) => {
    const key = `rate-limit:${req.ip}`;
    const count = await redis.incr(key);

    if (count === 1) await redis.expire(key, window);
    if (count > limit) {
      return next(new AppError(429, "too many request"));
    }
    next();
  });
};

const slidingWindow = (limit, window) => {
  return catchAsync(async (req, res, next) => {
    const key = `rate-limit:${req.ip}`;
    await redis.zRemRangeByScore(key, 0, Date.now() - window * 1000);
    await redis.zAdd(key, {
      score: Date.now(),
      value: `${Date.now()}.${Math.random()}`,
    });
    const count = await redis.zCard(key);
    if (count > limit) {
      return next(new AppError(429, "too many request"));
    }

    next();
  });
};
