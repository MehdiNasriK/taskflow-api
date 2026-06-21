import express from "express";
import authController from "./authController.js";
import {signUpSchema, loginSchema} from "./authValidation.js";
import { validation } from "../../shared/utils/validation.js";

const router = express.Router();

router.route("/signup").post(validation(signUpSchema), authController.signUp);
router.route("/login").post(validation(loginSchema), authController.login);
router.route("/logout").get(authController.protect, authController.logout);

router
  .route("/resetpassword")
  .post(authController.protect, authController.resetPassword);

router.route("/refreshtoken").get(authController.refresh);

export default router;
