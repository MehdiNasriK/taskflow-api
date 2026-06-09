import express from "express";
import userController from "./modules/auth/userController.js";
import globalErrorHandeller from "./shared/utils/globalErrorHandeller.js";
import authController from "./modules/auth/authController.js";
import cookieParser from "cookie-parser";
const app = express();

app.use(express.json());
app.use(cookieParser());

app
  .route("/users")
  .get(userController.getAllUser)
  .post(userController.creatUser)
  .delete(userController.deleteAllUser);
app
  .route("/users/:id")
  .get(userController.getUser)
  .delete(authController.protect, authController.restrictTo("ADMIN"), userController.deleteUser)
  .patch(userController.updateUser);

app.route("/signup").post(authController.signUp);
app.route("/login").post(authController.login);

app.route("/resetpassword").post(authController.protect, authController.resetPassword);

app.route("/cookie").get(authController.refresh)

app.use(globalErrorHandeller);

export default app;
