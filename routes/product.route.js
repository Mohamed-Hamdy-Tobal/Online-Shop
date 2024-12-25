import express from "express";
import { getProduct } from "../controllers/product.controller.js";
import { getAllProducts } from "../controllers/home.controller.js";

const router = express.Router();

router.get("/", getAllProducts);
router.route("/:id").get(getProduct);

export const productRouter = router;
