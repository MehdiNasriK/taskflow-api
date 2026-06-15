import factory from "../../shared/utils/handlerFactory.js";

const createComment = factory.createOne("comment", ["content"])

export default {
    createComment,
}