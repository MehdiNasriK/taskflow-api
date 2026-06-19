import express from "express";
import authController from "../auth/authController.js";
import projectController from "./projectController.js";
import taskController from "../tasks/taskController.js";
import commentController from "../comments/commentController.js";

const router = express.Router();

router.use(authController.protect);

router
  .route("/")
  .get(projectController.getAllProject)
  .post(projectController.createProject)
  .patch(projectController.updateProject)
  .delete(projectController.deleteProject);

router
  .route("/:id")
  .post(projectController.passProjectId, taskController.createTask)
  .get(projectController.getProject)
  .patch(projectController.updateProject)
  .delete(projectController.deleteProject);

router
  .route("/:id/tasks")
  .get(projectController.passProjectId, taskController.getAllTasks);

router
  .route("/:id/tasks/:taskId")
  .get(taskController.getTask)
  .post(taskController.passTaskId, commentController.createComment)
  .patch(taskController.updateTask)
  .delete(taskController.deleteTask);

router
  .route("/:id/tasks/:taskId/comments")
  .get(taskController.passTaskId, commentController.getAllComments);

router
  .route("/:id/tasks/:taskId/comments/:commentId")
  .patch(commentController.updateComment)
  .delete(commentController.deleteComment);

export default router;
