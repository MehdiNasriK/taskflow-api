import factory from "../../shared/utils/handlerFactory.js";
import catchAsync from "../../shared/utils/catchAsync.js"

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

const getAllTasks = factory.getAll("task");

const passTaskId = catchAsync(async(req, res, next) => {
  req.taskId = req.params.taskId || req.params.id 
  next()
})

export default {
  createTask,
  getAllTasks,
  deleteTask,
  updateTask,
  getTask,
  passTaskId,
};
