import express from "express";
import multer from "multer";
import { isAuth } from "../middleware/auth.middleware.js";
import {
  cancelOrder,
  createOrder,
  getOrders,
  updateOrderStatus,
} from "../controllers/order.controller.js";

const router = express.Router();

router.get("/", isAuth, getOrders);
router.post("/create", isAuth, multer().any(), createOrder);
router.post("/update_status", isAuth, multer().any(), updateOrderStatus);
router.post("/cancel_order", isAuth, multer().any(), cancelOrder);

export const ordersRouter = router;
