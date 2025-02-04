import express from "express";
import {
  authLogout,
  getForgetPassword,
  getLogin,
  getResetPassword,
  getSignup,
  postForget,
  postLogin,
  postSignup,
  resetPassword,
} from "../controllers/auth.controller.js";
import multer from "multer";
import { isGuest } from "../middleware/auth.middleware.js";

const router = express.Router();

router
  .route("/signup")
  .get(isGuest, getSignup)
  .post(multer().any(), postSignup);
router.route("/login").get(isGuest, getLogin).post(multer().any(), postLogin);
router.route("/forget-password").get(getForgetPassword).post(multer().any(), postForget);
router.route("/reset-password/:userId/:refreshToken").get(getResetPassword).post(multer().any(), resetPassword);
router.route("/logout").all(authLogout);

export const authRouter = router;
