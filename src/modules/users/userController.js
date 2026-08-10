import prisma from "../../shared/config/prisma.js";
import catchAsync from "../../shared/utils/catchAsync.js";
import AppError from "../../shared/utils/error.js";


const creatUser = catchAsync(async (req, res, next) => {
  const { username, email } = req.body;
  let { password } = req.body;

  if(!username) return next(new AppError(400, "please enter the username"))
  if(!email) return next(new AppError(400, "please enter the email"))
  if(!password) return next(new AppError(400, "please enter the password"))

  password = await bcrypt.hash(password, 12);
  
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
  if(!users) return next(new AppError(404, "no user exist"))

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

  if(!user) return next(new AppError(404, "no user exist"))

  res.status(200).json({
    status: "success",
    user,
  });
});

const updateUser = catchAsync(async (req, res, next) => {
  const queryObject = req.body;
  const queryKeys = Object.keys(queryObject);
  const expectedField = ["username", "email"];

  queryKeys.forEach((el) => {
    if (!expectedField.includes(el)) delete queryObject[el];
  });
  
  if(Object.keys(queryObject).length === 0) return next(new AppError(400, "there is nothing to update"))
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
