import { PrismaClient } from "@prisma/client";
import catchAsync from "../../shared/utils/catchAsync.js";

const prisma = new PrismaClient();

const creatUser = catchAsync(async (req, res, next) => {
  const { username, email, password } = req.body;
  const user = await prisma.user.create({
    data: {
      username,
      email,
      password,
    },
  });

  res.status(200).json({
    status: "success",
    user,
  });
});

const deleteUser = catchAsync(async (req, res, next) => {
  const id = req.params.id * 1;
  const user = await prisma.user.delete({
    where: {
      id,
    },
  });

  res.status(200).json({
    staus: "success",
    data: null,
  });
});

const getAllUser = catchAsync(async (req, res, next) => {
  const users = await prisma.user.findMany();

  res.status(200).json({
    staus: "success",
    users,
  });
});

const getUser = catchAsync(async (req, res, next) => {
  const id = req.params.id * 1;
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  res.status(200).json({
    status: "success",
    user,
  });
});

const updateUser = catchAsync(async (req, res, next) => {
  const queryObject = req.body;
  const queryKeys = Object.keys(queryObject);
  const expectedField = ["name", "email"];

  queryKeys.forEach((el) => {
    if (!expectedField.includes(el)) delete queryObject[el];
  });

  const id = req.params.id * 1;
  const user = await prisma.user.update({
    where: {
      id,
    },
    data: queryObject,
  });

  res.status(200).json({
    status: "success",
    user,
  });
});

export default {
  creatUser,
  deleteUser,
  getAllUser,
  getUser,
  updateUser,
};
