import express from "express";
import userController from "./userController.js";
import authController from "../auth/authController.js";

const router = express.Router();

router
  .route("/")
  .get(userController.getAllUser)
  .post(userController.creatUser)
  .delete(userController.deleteAllUser);
router
  .route("/:id")
  .get(userController.getUser)
  .delete(
    authController.protect,
    authController.restrictTo("ADMIN"),
    userController.deleteUser,
  )
  .patch(userController.updateUser);

export default router;
