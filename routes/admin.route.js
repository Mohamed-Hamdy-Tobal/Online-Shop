import express from "express";
import {
  createProduct,
  getAddProduct,
} from "../controllers/admin.controller.js";
import { isAdmin } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multerMiddleware.middleware.js";

const router = express.Router();

router
  .route("/add-product")
  .get(getAddProduct)
  .post(isAdmin, upload.single("image"), createProduct);

export const adminRouter = router;
