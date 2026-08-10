import prisma from "../../shared/config/prisma.js";
import jwt from "../../shared/utils/jwt.js";
import AppError from "../../shared/utils/error.js";
import catchAsync from "../../shared/utils/catchAsync.js";
import bcrypt from "bcrypt";
import emailQueue from "../../shared/utils/queueWorker.js"

const signUp = catchAsync(async (req, res, next) => {
  const { email, username } = req.body;
  let { password } = req.body;
  password = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      password,
    },
  });

  const url = `${req.protocol}://${req.get("host")}/me`;

  // await emailQueue.add("email", {
  //   url,
  //   user,
  // })

  res.status(200).json({
    status: "success",
    message: "please check your email and login",
  });
});

const login = catchAsync(async (req, res, next) => {

  const { username, password } = req.body;
  if (!username || !password)
    return next(new AppError(401, "username and password required"));

  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  });

  if (!user || !(await bcrypt.compare(password, user.password)))
    return next(new AppError(404, "invalid password or username"));

  const accessToken = jwt.createAccessToken(user.id, user.username);
  const refreshToken = jwt.createRefreshToken(user.id);

  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  const hashedToken = jwt.hashRefreshToken(refreshToken);

  await prisma.user.update({
    where: {
      username,
    },
    data: {
      refreshToken: hashedToken,
    },
  });

  res.status(200).json({
    status: "success",
    accessToken,
  });
});

const logout = catchAsync(async (req, res, next) => {
  await prisma.user.update({
    where: {
      id: req.user.id,
    },
    data: {
      refreshToken: null,
    },
  });

  res.clearCookie("jwt", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.json({
    status: "success",
    message: "bye for now. see you later",
  });
});

const protect = catchAsync(async (req, res, next) => {
  if (!req.headers.authorization?.startsWith("Bearer"))
    return next(new AppError(401, "invalid token"));

  const accessToken = req.headers.authorization?.split(" ")[1];
  if (!accessToken) return next(new AppError(401, "please login"));

  const { userInfo } = jwt.checkAccessToken(accessToken);

  const user = await prisma.user.findUnique({
    where: {
      id: userInfo.id,
    },
  });

  if (!user) return next(new AppError(404, "user no longer exist"));
  req.user = user;
  next();
});

const restrictTo = (...roles) => {
  return (req, res, next) => {
    return roles.includes(req.user.role)
      ? next()
      : next(new AppError(403, "you are not access to this"));
  };
};

const resetPassword = catchAsync(async (req, res, next) => {
  const { password, newPassword } = req.body;

  const user = await prisma.user.findUnique({
    where: {
      id: req.user.id,
    },
  });

  if (!(await bcrypt.compare(password, user.password)))
    return next(new AppError(401, "password incorrect"));

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      password: hashedPassword,
      refreshToken: null,
    },
  });

  res.clearCookie("jwt", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(200).json({
    status: "success",
    message: "your password change successfully",
  });
});

const refresh = catchAsync(async (req, res, next) => {
  let refreshToken = req.cookies.jwt;
  if (!refreshToken) return next(new AppError(401, "please login"));

  const decoded = jwt.checkRefreshToken(refreshToken);

  const user = await prisma.user.findUnique({
    where: {
      id: decoded.id,
    },
  });

  if (!user) return next(new AppError(404, "user no longer exist"));
  if (jwt.hashRefreshToken(refreshToken) !== user.refreshToken)
    return next(new AppError(401, "invalid token"));

  refreshToken = jwt.createRefreshToken(user.id);
  const accessToken = jwt.createAccessToken(user.id, user.username);
  const hashedToken = jwt.hashRefreshToken(refreshToken);

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      refreshToken: hashedToken,
    },
  });

  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    accessToken,
  });
});

export default {
  signUp,
  login,
  protect,
  restrictTo,
  resetPassword,
  refresh,
  logout,
};
