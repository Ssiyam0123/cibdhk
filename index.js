import express from "express";
import "dotenv/config";
import authRoute from "./routes/authRoutes.js";
import studentRoute from "./routes/studentRoutes.js";
import { connectDb } from "./lib/db.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoute from "./routes/userRoutes.js";
import courseRoutes from "./routes/courseRoute.js";
import { getStudentById } from "./controllers/student.controller.js";
import dashbordRoutes from "./routes/dashboard.routes.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Connect to Database
connectDb();

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS Configuration
app.use(
  cors({
    origin: [
    //   "http://localhost:5174",
      "https://verification.cibdhk.com",
    //   "https://cibdhk.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options('/:path*', cors());



app.use("/api/auth", authRoute);
app.use("/api/students", studentRoute);
app.use("/api/admin", userRoute);
app.use("/api/courses", courseRoutes);
app.use("/api/dashboard", dashbordRoutes);

const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
});

export default app;