import prisma from "../../shared/config/prisma.js";
import catchAsync from "../../shared/utils/catchAsync.js";


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

const deleteAllUser = catchAsync(async(req, res, next) => {
  await prisma.user.deleteMany()

  res.status(200).json({
    data: null
  })
})

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
  deleteAllUser,
};
