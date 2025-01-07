import express from "express";
import multer from "multer";
import {
  addToCart,
  editCartQuantity,
  getCart,
  removeFromCart,
} from "../controllers/cart.controller.js";
import { isAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router
  .route("/")
  .get(getCart)
  .post(multer().any(), addToCart)
  .delete(multer().any(), removeFromCart);

router.route("/edit_quantity").patch(multer().any(), editCartQuantity);

// router.route("/:userId").get(isAuth, getCart);

export const cartRouter = router;
