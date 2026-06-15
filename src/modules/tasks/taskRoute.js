import express from "express";
import taskController from "./taskController.js";
import authController from "../auth/authController.js";
import commentsController from "../comments/commentsController.js"

const router = express.Router();

router
  .route("/")
  .post(authController.protect, taskController.createTask)
  .get(authController.protect, taskController.getAllTasks)
  .delete(authController.protect, taskController.deleteAllTask);

router
  .route("/:id")
  .get(authController.protect, taskController.getTask)
  .post(commentsController.createComment)
  .delete(authController.protect, taskController.deleteTask)
  .patch(authController.protect, taskController.updateTask);

export default router;
