import express from "express";
import multer from "multer";
import { addToCart, getCart } from "../controllers/cart.controller.js";
import { isAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.route("/").post(multer().any(), addToCart);
// router.route("/:userId").get(isAuth, getCart);
router.route("/").get(getCart);

export const cartRouter = router;
