import express from "express";
import {
  getLogin,
  getSignup,
  postLogin,
  postSignup,
} from "../controllers/auth.controller.js";
import multer from "multer";

const router = express.Router();

router.route("/signup").get(getSignup).post(multer().any(), postSignup);
router.route("/login").get(getLogin).post(multer().any(), postLogin);

export const authRouter = router;
