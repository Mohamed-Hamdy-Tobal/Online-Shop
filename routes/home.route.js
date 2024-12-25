import express from "express";
import { getAllProducts } from "../controllers/home.controller.js";

const router = express.Router();

router.get("/", getAllProducts);

export const homeRouter = router;
