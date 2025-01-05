import express from "express";
import {
  authLogout,
  getLogin,
  getSignup,
  postLogin,
  postSignup,
} from "../controllers/auth.controller.js";
import multer from "multer";
import { isGuest } from "../middleware/auth.middleware.js";

const router = express.Router();

router
  .route("/signup")
  .get(isGuest, getSignup)
  .post(multer().any(), postSignup);
router.route("/login").get(isGuest, getLogin).post(multer().any(), postLogin);
router.route("/logout").all(authLogout);

export const authRouter = router;
