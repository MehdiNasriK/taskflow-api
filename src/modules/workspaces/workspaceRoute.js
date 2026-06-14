import express from "express"
import authController from "../auth/authController.js";
import workspaceController from "./workspaceController.js";

const router = express.Router()

router.route("/createworkspace").post(authController.protect, workspaceController.creatWorkspace)



export default router;