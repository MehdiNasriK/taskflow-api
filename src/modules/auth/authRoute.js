import express from "express";
import authController from "./authController.js";

const router = express.Router();

router.route("/signup").post(authController.signUp);
router.route("/login").post(authController.login);
router.route("/logout").get(authController.protect, authController.logout);

router
  .route("/resetpassword")
  .post(authController.protect, authController.resetPassword);

router.route("/refreshtoken").get(authController.refresh);

export default router;
