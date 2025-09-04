import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import urlRoutes from "./routes/urlRoutes.js";
import { Log } from "../Logging-Middleware/index.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
app.locals.baseUrl = process.env.BASE_URL || `http://localhost:${port}`;

app.use(express.json());
app.use("/", urlRoutes);

// mongodb connection
mongoose
  .connect(process.env.MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
    Log("backend", "info", "db", "MongoDB connection established.");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    Log("backend", "fatal", "db", "Critical database connection failure.");
  });

// start server
app.listen(port, () => {
  console.log(`Server running at ${app.locals.baseUrl}`);
  Log("backend", "info", "config", `Server started at ${app.locals.baseUrl}`);
});
