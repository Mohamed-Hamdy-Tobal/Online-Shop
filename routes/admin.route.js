import express from "express";
import { getAddProduct } from "../controllers/admin.controller.js";

const router = express.Router();

router.route("/add-product").get(getAddProduct).post(getAddProduct);

export const adminRouter = router;
