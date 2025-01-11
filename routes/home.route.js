import express from "express";
import { getAllProducts } from "../controllers/home.controller.js";
import { checkoutCart } from "../controllers/checkout.controller.js";

const router = express.Router();

router.get("/", getAllProducts);
router.route("/checkout").get(checkoutCart);

export const homeRouter = router;
