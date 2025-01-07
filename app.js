import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { homeRouter } from "./routes/home.route.js";
import cors from "cors";
import { productRouter } from "./routes/product.route.js";
import { authRouter } from "./routes/auth.route.js";
import { STATUS_CODES } from "./util/StatusCodes.js";
import ConnectMongoDBSession from "connect-mongodb-session";
import session from "express-session";
import { cartRouter } from "./routes/cart.route.js";

dotenv.config();

const app = express();

const MongoDBStore = ConnectMongoDBSession(session);

const url = process.env.MONGO_URL;

mongoose.connect(url).then(() => {
  console.log("mongodb server started");
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(join(__dirname, "assets")));
app.use(express.static(join(__dirname, "public")));
app.use(express.static(join(__dirname, "images")));

// Configure session store
const store = new MongoDBStore({
  uri: url,
  collection: "sessions",
});

store.on("error", (error) => {
  console.error("Session store error:", error);
});

app.use(
  session({
    secret: process.env.SESSION_SECRET_KEY, // Replace with a strong secret key
    resave: false, // Avoid resaving session if unmodified
    saveUninitialized: false, // Don't save uninitialized sessions
    store, // Use the MongoDB session store
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      httpOnly: true, // For security, prevents client-side script access
      secure: false, // Set to true if using HTTPS
    },
  })
);

app.set("view engine", "ejs");
app.set("views", "views");

// Routers
app.use("/", homeRouter);
app.use("/", authRouter);
app.use("/product", productRouter);
app.use("/cart", cartRouter);

app.all("*", (req, res, next) => {
  return res.status(404).json({
    status: STATUS_CODES.FAIL,
    message: "this resource is not available",
  });
});

app.listen(process.env.PORT || 8000, () => {
  console.log("app is running");
});
