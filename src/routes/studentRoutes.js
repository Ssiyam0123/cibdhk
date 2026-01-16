import express from "express";
import {
  addStudent,
  deleteStudent,
  editStudent,
  getALLStudents,
  studentDetails,
} from "../controllers/student.controller.js";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

router.post("/add-student", upload.single("photo"), addStudent);
router.get("/all-students", getALLStudents);
router.put("/edit-student/:id", upload.single("photo"), editStudent);
router.get("/:id", studentDetails);
router.delete("/delete-student/:id", deleteStudent);

export default router;
