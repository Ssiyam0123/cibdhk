import express from "express";
import "dotenv/config";
import authRoute from "./routes/authRoutes.js";
import studentRoute from "./routes/studentRoutes.js";
import { connectDb } from "./lib/db.js";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "*"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }) v  
);

app.use("/api/auth", authRoute);
app.use("/api/student", studentRoute);

app.get("/", (req, res) => {
  res.send("hello");
});

// REMOVE app.listen() for Vercel
// Connect DB when the serverless function starts
connectDb();

// Export for Vercel
export default app;  // Use "export default" instead of "module.exports"