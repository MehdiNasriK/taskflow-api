import AppError from "./error.js";

export const validation = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  const errorMessages = result.error?.issues
    .map((errObj) => errObj.message)
    .join(". ");
  if (!result.success) return next(new AppError(400, errorMessages));

  req.body = result.data;
  next();
};
