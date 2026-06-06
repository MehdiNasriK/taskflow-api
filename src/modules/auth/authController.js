import { PrismaClient } from "../../generated/prisma/index.js";
import jwt from "jsonwebtoken";
import catchAsync from "../../shared/utils/catchAsync.js";
import bcrypt from "bcrypt";
import Email from "../../shared/utils/email.js";

const prisma = new PrismaClient();

const signUp = catchAsync(async (req, res, next) => {
  const { email, name } = req.body;
  let { password } = req.body;
  password = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password,
    },
  });

  const url = `${req.protocol}://${req.get("host")}/me`;

  await new Email(url, user).sendEmail();

  res.status(200).json({
    status: "success",
    message: "please check your email and login",
  });
});

export default {
  signUp,
};
