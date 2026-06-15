import express from "express";
import authController from "../auth/authController.js";
import projectController from "./projectController.js";
import taskController from "../tasks/taskController.js";

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

export default router;
