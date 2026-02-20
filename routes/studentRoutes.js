import express from "express";
import {
  addStudent,
  deleteStudent,
  getAllStudents,
  updateStudent,
  getStudentById,
  toggleStudentStatus,
  searchStudent,
  publicSearchStudent
} from "../controllers/student.controller.js";
import protectRoute from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.js";

const router = express.Router();

// Student routes
router.get("/all", protectRoute, getAllStudents); // Get all students with pagination and filters
router.post("/create", protectRoute, upload.single("image"), addStudent); // Create new student
router.put("/update/:id", protectRoute, upload.single("image"), updateStudent); // Update student
router.patch("/toggle-status/:id", protectRoute, toggleStudentStatus); // Toggle active status
router.delete("/delete/:id", protectRoute, deleteStudent); // Delete student permanently



router.get("/search", protectRoute, searchStudent); // Admin search
router.get("/:id", getStudentById); // Get student by ID (public for QR code access)
router.get("/public/search", publicSearchStudent); 

export default router;