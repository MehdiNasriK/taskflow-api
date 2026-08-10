import factory from "../../shared/utils/handlerFactory.js";

const createComment = factory.createOne("comment", ["content"]);
const getAllComments = factory.getAll("comment");
const updateComment = factory.updateOne("comment", ["content"]);
const deleteComment = factory.deleteOne("comment");

export default {
  createComment,
  getAllComments,
  updateComment,
  deleteComment,
};
