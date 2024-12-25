import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { homeRouter } from "./routes/home.route.js";
import cors from "cors";
import { productRouter } from "./routes/product.route.js";

dotenv.config();

const app = express();

const url = process.env.MONGO_URL;

mongoose.connect(url).then(() => {
  console.log("mongodb server started");
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(cors());
app.use(express.static(join(__dirname, "assets")));
app.use(express.static(join(__dirname, "public")));
app.use(express.static(join(__dirname, "images")));

app.set("view engine", "ejs");
app.set("views", "views");

// Routers
app.use("/", homeRouter);
app.use("/product", productRouter);

app.listen(process.env.PORT || 8000, () => {
  console.log("app is running");
});
