import express from "express";
import { getAllProducts } from "../controllers/home.controller.js"; 

const router = express.Router();

export const homeRouter = router.get("/", getAllProducts);
