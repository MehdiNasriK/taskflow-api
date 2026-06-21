import express from "express";
import authController from "../auth/authController.js";
import projectController from "./projectController.js";
import taskController from "../tasks/taskController.js";
import commentController from "../comments/commentController.js";
import { projectSchema } from "./projectSchema.js";
import { validation } from "../../shared/utils/validation.js";
import { taskSchema } from "../tasks/taskSchema.js";
import { commentSchema } from "../comments/commentSchema.js";

const router = express.Router();

router.use(authController.protect);

router
  .route("/")
  .get(projectController.getAllProject)
  .post(validation(projectSchema), projectController.createProject)
  .delete(projectController.deleteProject);

router
  .route("/:id")
  .post(
    projectController.passProjectId,
    validation(taskSchema),
    taskController.createTask,
  )
  .get(projectController.getProject)
  .patch(validation(projectSchema), projectController.updateProject)
  .delete(projectController.deleteProject);

router
  .route("/:id/tasks")
  .get(projectController.passProjectId, taskController.getAllTasks);

router
  .route("/:id/tasks/:taskId")
  .get(taskController.getTask)
  .post(
    taskController.passTaskId,
    validation(commentSchema),
    commentController.createComment,
  )
  .patch(validation(taskSchema), taskController.updateTask)
  .delete(taskController.deleteTask);

router
  .route("/:id/tasks/:taskId/comments")
  .get(taskController.passTaskId, commentController.getAllComments);

router
  .route("/:id/tasks/:taskId/comments/:commentId")
  .patch(validation(commentSchema), commentController.updateComment)
  .delete(commentController.deleteComment);

export default router;
