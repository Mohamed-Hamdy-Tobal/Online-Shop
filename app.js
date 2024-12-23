import dotenv from "dotenv";
import express from "express";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(join(__dirname, "assets")));
app.use(express.static(join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", "views");

app.get("/", (req, res) => {
  res.render("index");
});

app.listen(process.env.PORT || 8000, () => {
  console.log("app is running");
});
