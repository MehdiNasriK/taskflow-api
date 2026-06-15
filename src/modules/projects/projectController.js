import factory from "../../shared/utils/handlerFactory.js";
import catchAsync from "../../shared/utils/catchAsync.js";

const createProject = factory.createOne("project", ["title"]);
const getProject = factory.getOne("project");
const updateProject = factory.updateOne("project", ["title"]);
const deleteProject = factory.deleteOne("project");
const getAllProject = factory.getAll("project");
const deleteAllProject = factory.deleteAll("project");

const passProjectId = catchAsync(async (req, res, next) => {
  req.projectId = req.params.id;
  next();
});

export default {
  createProject,
  getProject,
  updateProject,
  deleteProject,
  getAllProject,
  deleteAllProject,
  passProjectId,
};
