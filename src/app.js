import express from "express";
import userController from "./modules/auth/userController.js";
import globalErrorHandeller from "./shared/utils/globalErrorHandeller.js";
import authController from "./modules/auth/authController.js";

const app = express();

app.use(express.json());

app
  .route("/users")
  .get(userController.getAllUser)
  .post(userController.creatUser);
app
  .route("/users/:id")
  .get(userController.getUser)
  .delete(userController.deleteUser)
  .patch(userController.updateUser);

app.route("/signup").post(authController.signUp);

app.use(globalErrorHandeller);

export default app;
