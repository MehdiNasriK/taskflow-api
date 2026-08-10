import express from "express";
import taskController from "./taskController.js";
import authController from "../auth/authController.js";
import commentController from "../comments/commentController.js";
import { taskSchema } from "./taskSchema.js";
import { validation } from "../../shared/utils/validation.js";
import { commentSchema } from "../comments/commentSchema.js";

const router = express.Router();

router.use(authController.protect);

router
  .route("/")
  .post(validation(taskSchema), taskController.createTask)
  .get(taskController.getAllTasks);

router
  .route("/:id")
  .get(taskController.getTask)
  .post(
    taskController.passTaskId,
    validation(commentSchema),
    commentController.createComment,
  )
  .delete(taskController.deleteTask)
  .patch(validation(taskSchema), taskController.updateTask);

router
  .route("/:id/comments")
  .get(taskController.passTaskId, commentController.getAllComments);

router
  .route("/:id/comments/:commentId")
  .patch(validation(commentSchema), commentController.updateComment)
  .delete(commentController.deleteComment);

export default router;
