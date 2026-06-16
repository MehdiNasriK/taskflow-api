import express from "express";
import taskController from "./taskController.js";
import authController from "../auth/authController.js";
import commentController from "../comments/commentController.js";

const router = express.Router();

router.use(authController.protect);

router
  .route("/")
  .post(taskController.createTask)
  .get(taskController.getAllTasks);

router
  .route("/:id")
  .get(taskController.getTask)
  .post(taskController.passTaskId, commentController.createComment)
  .delete(taskController.deleteTask)
  .patch(taskController.updateTask);

router
  .route("/:id/comments")
  .get(taskController.passTaskId, commentController.getAllComments)

router
  .route("/:id/comments/:commentId")
  .patch(commentController.updateComment)
  .delete(commentController.deleteComment);

export default router;
