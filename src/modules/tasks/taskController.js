import factory from "../../shared/utils/handlerFactory.js";

const createTask = factory.createOne("task", [
  "title",
  "description",
  "priority",
  "project",
  "dueDate",
  "comments",
]);

const getTask = factory.getOne("task");

const deleteTask = factory.deleteOne("task");

const updateTask = factory.updateOne("task", [
  "title",
  "description",
  "priority",
  "project",
  "dueDate",
  "comments",
  "status",
]);

const deleteAllTask = factory.deleteAll("task");

const getAllTasks = factory.getAll("task");

export default {
  createTask,
  deleteAllTask,
  getAllTasks,
  deleteTask,
  updateTask,
  getTask,
};
