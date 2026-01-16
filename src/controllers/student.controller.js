import Student from "../models/student.js";

import cloudinary from "../lib/cloudinary.js";

export const addStudent = async (req, res) => {
  try {
    const {
      student_name,
      student_id,
      reg_number,
      course_name,
      batch,
      issue_date,
      is_active,
    } = req.body;

    // upload image to cloudinary
    let photo_url = "";
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "students",
      });
      photo_url = result.secure_url;
    }

    const exists = await Student.findOne({
      $or: [{ student_id }, { reg_number }],
    });

    if (exists) {
      return res.status(400).json({ message: "Student already exists" });
    }

    const newStudent = await Student.create({
      student_name,
      student_id,
      reg_number,
      course_name,
      batch,
      issue_date,
      photo_url,
      is_active,
    });

    res.status(201).json({
      message: "Student created successfully",
      data: newStudent,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getALLStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const editStudent = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (req.file) {
      updateData.photo_url = req.file.path;
    }

    const updated = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({
      message: "Student updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const deleted = await Student.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({
      message: "Student deleted permanently",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const studentDetails = async (req, res) => {
  try {
    const id = req.params.id;
    const student = await Student.findById(id);
    console.log(student)
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
