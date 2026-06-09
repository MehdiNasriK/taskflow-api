import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import catchAsync from "../../shared/utils/catchAsync.js";
import bcrypt from "bcrypt";
import Email from "../../shared/utils/email.js";
import { userInfo } from "node:os";
import crypto from "crypto";
import async from "../../shared/utils/catchAsync.js";

const prisma = new PrismaClient();

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

  // await new Email(url, user).sendEmail();

  res.status(200).json({
    status: "success",
    message: "please check your email and login",
  });
});

const login = catchAsync(async (req, res, next) => {
  // find user with username and password
  const { username, password } = req.body;
  if (!username || !password)
    return next(new Error("username and password required"));

  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  });

  // password check
  if (!user || !(await bcrypt.compare(password, user.password)))
    return next(new Error("invalid password or username"));

  // create access token and refresh token
  const accessToken = jwt.sign(
    {
      userInfo: {
        id: user.id,
        username: user.username,
      },
    },
    process.env.JWT_ACCESS_TOKEN_SECRET,
    { expiresIn: `${process.env.ACCESS_TOKEN_EXPIRES}` },
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_TOKEN_SECRET,
    { expiresIn: `${process.env.REFRESH_TOKEN_EXPIRES}` },
  );

  // set refresh token as cookie and send access token in json format
  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  const hashedToken = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  await prisma.user.update({
    where: {
      username,
    },
    data: {
      token: hashedToken,
    },
  });

  res.status(200).json({
    status: "success",
    accessToken,
  });
});

const protect = catchAsync(async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return next(new Error("please login"));

  const { userInfo } = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);

  const user = await prisma.user.findUnique({
    where: {
      id: userInfo.id,
    },
  });

  req.user = user;
  next();
});

const restrictTo = (role) => {
  return catchAsync(async (req, res, next) => {
    req.user.role === role
      ? next()
      : next(new Error("you are not access to this"));
  });
};

const resetPassword = catchAsync(async (req, res, next) => {
  const { password, newPassword } = req.body;

  const user = await prisma.user.findUnique({
    where: {
      id: req.user.id,
    },
  });

  if (!(await bcrypt.compare(password, user.password)))
    return next(new Error("password incorrect"));

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      password: hashedPassword,
    },
  });

  res.status(200).json({
    status: "success",
    message: "your password change successfully",
  });
});

const refresh = catchAsync(async (req, res, next) => {
  const refreshToken = req.cookies.jwt;
  if (!refreshToken) return next(new Error("please login"));

  const decoded = jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_TOKEN_SECRET,
  );

  const user = await prisma.user.findUnique({
    where: {
      id: decoded.id,
    },
  });

  const accessToken = jwt.sign(
    {
      userInfo: {
        id: user.id,
        username: user.username,
      },
    },
    process.env.JWT_REFRESH_TOKEN_SECRET,
  );

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
};
