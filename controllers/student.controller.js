import Student from "../models/student.js";
import Course from "../models/course.js";
import cloudinary from "../lib/cloudinary.js";
import fs from "fs";
import uploadToCloudinary from "../lib/uploadToCloudinary.js";

export const getAllStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    const { search, status, batch, course, is_active, competency, date_from, date_to } = req.query;

    // Build filter object
    let filter = {};

    // Search across multiple fields
    if (search) {
      filter.$or = [
        { student_name: { $regex: search, $options: "i" } },
        { student_id: { $regex: search, $options: "i" } },
        { registration_number: { $regex: search, $options: "i" } },
        { fathers_name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { contact_number: { $regex: search, $options: "i" } },
      ];
    }

    // Status filter
    if (status && status !== "all") {
      filter.status = status;
    }

    // Batch filter
    if (batch && batch !== "all") {
      filter.batch = batch;
    }

    // Course filter
    if (course && course !== "all") {
      filter.course = course;
    }

    // Competency filter
    if (competency && competency !== "all") {
      filter.competency = competency;
    }

    // Active status filter
    if (is_active && is_active !== "all") {
      filter.is_active = is_active === "true";
    }

    // Date range filter for issue_date
    if (date_from || date_to) {
      filter.issue_date = {};
      if (date_from) {
        filter.issue_date.$gte = new Date(date_from);
      }
      if (date_to) {
        filter.issue_date.$lte = new Date(date_to);
      }
    }

    // Get distinct values for dropdowns (optional)
    const distinctBatches = await Student.distinct("batch");
    const distinctCourses = await Course.find().select("_id course_name");
    const distinctStatuses = await Student.distinct("status");
    const distinctCompetencies = await Student.distinct("competency");

    const [students, total] = await Promise.all([
      Student.find(filter)
        .populate("course", "course_name course_code duration fee")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Student.countDocuments(filter),
    ]);

    res.status(200).json({
      data: students,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        batches: distinctBatches.filter(b => b).sort(),
        courses: distinctCourses,
        statuses: distinctStatuses.filter(s => s).sort(),
        competencies: distinctCompetencies.filter(c => c).sort(),
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Delete photo from cloudinary if exists
    if (student.photo_public_id) {
      await cloudinary.uploader.destroy(student.photo_public_id);
    }

    await student.deleteOne();

    res.status(200).json({
      message: "Student deleted permanently",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate(
      "course",
      "course_name course_code duration description additional_info"
    );

    if (!student.is_active) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateStudent = async (req, res) => {
  let uploadedPublicId = null;

  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // console.log("Update request body:", req.body);
    // console.log("File:", req.file);


    if (req.file) {
      // delete old photo
      if (student.photo_public_id) {
        await cloudinary.uploader.destroy(student.photo_public_id);
      }

      const result = await uploadToCloudinary(req.file.buffer);

      student.photo_url = result.secure_url;
      student.photo_public_id = result.public_id;
      uploadedPublicId = result.public_id;
    }

    const {
      student_name,
      fathers_name,
      student_id,
      registration_number,
      course,
      competency,
      batch,
      status,
      issue_date,
      completion_date,
      is_active,
      is_verified,
      contact_number,
      email,
      address,
    } = req.body;

    if (student_id || registration_number) {
      const existingStudent = await Student.findOne({
        _id: { $ne: req.params.id },
        $or: [
          ...(student_id ? [{ student_id: student_id.trim() }] : []),
          ...(registration_number
            ? [{ registration_number: registration_number.trim() }]
            : []),
        ],
      });

      if (existingStudent) {
        if (student_id && existingStudent.student_id === student_id.trim()) {
          return res.status(400).json({
            message: "Student ID already exists",
          });
        }

        if (
          registration_number &&
          existingStudent.registration_number === registration_number.trim()
        ) {
          return res.status(400).json({
            message: "Registration Number already exists",
          });
        }
      }
    }

    /* ===================== UPDATE BASIC FIELDS ===================== */
    if (student_name !== undefined) student.student_name = student_name.trim();

    if (fathers_name !== undefined) student.fathers_name = fathers_name.trim();

    if (student_id !== undefined) student.student_id = student_id.trim();

    if (registration_number !== undefined)
      student.registration_number = registration_number.trim();

    if (competency !== undefined) student.competency = competency; // must match enum

    if (batch !== undefined) student.batch = batch.trim();

    if (status !== undefined) student.status = status;

    if (issue_date !== undefined) student.issue_date = issue_date;

    if (completion_date !== undefined)
      student.completion_date = completion_date || null;

    if (is_active !== undefined) {
      student.is_active = is_active === "true" || is_active === true;
    }
    if (is_verified !== undefined) {
      student.is_verified = is_verified === "true" || is_verified === true;
    }
    if (contact_number !== undefined)
      student.contact_number = contact_number?.trim() || "";

    if (email !== undefined) student.email = email?.trim().toLowerCase() || "";

    if (address !== undefined) student.address = address?.trim() || "";

    const oldCourseId = student.course?.toString();

    if (course !== undefined) {
      student.course = course;
    }

    if (course && course !== oldCourseId) {
      const courseData = await Course.findById(course);

      if (!courseData) {
        return res.status(400).json({ message: "Invalid course selected" });
      }

      student.course_name = courseData.course_name;
      student.course_code = courseData.course_code;

      student.course_duration = {
        value: courseData.duration?.value ?? courseData.duration ?? 0,
        unit: courseData.duration?.unit ?? "months",
      };
    }

    try {
      await student.validate();
    } catch (validationError) {
      console.error("VALIDATION ERROR:", validationError);

      if (uploadedPublicId) {
        await cloudinary.uploader.destroy(uploadedPublicId);
      }

      return res.status(400).json({
        message: validationError.message,
      });
    }

    await student.save();

    res.status(200).json({
      message: "Student updated successfully",
      data: student,
    });
  } catch (error) {
    console.error("Update error details:", error);

    if (uploadedPublicId) {
      await cloudinary.uploader.destroy(uploadedPublicId);
    }

    if (error.code === 11000) {
      return res.status(400).json({
        message: `Duplicate key error: ${JSON.stringify(error.keyValue)}`,
      });
    }

    res.status(500).json({
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }

};

export const addStudent = async (req, res) => {
  try {
    const {
      student_name,
      fathers_name,
      student_id,
      registration_number,
      course,
      competency,
      batch,
      status,
      issue_date,
      completion_date,
      is_active,
      is_verified,
      contact_number,
      email,
      address,
    } = req.body;

    const existingStudent = await Student.findOne({
      $or: [
        { student_id: { $regex: new RegExp(`^${student_id.trim()}$`, "i") } },
        {
          registration_number: {
            $regex: new RegExp(`^${registration_number.trim()}$`, "i"),
          },
        },
      ],
    });

    if (existingStudent) {
      // console.log("Duplicate check details:");
      // console.log(
      //   "Input student_id:",
      //   student_id,
      //   "Existing student_id:",
      //   existingStudent.student_id
      // );
      // // console.log(
      //   "Input registration_number:",
      //   registration_number,
      //   "Existing registration_number:",
      //   existingStudent.registration_number
      // );

      if (
        existingStudent.student_id.toLowerCase() ===
        student_id.toLowerCase().trim()
      ) {
        return res.status(400).json({
          message: `Student ID "${student_id}" already exists`,
        });
      }
      if (
        existingStudent.registration_number.toLowerCase() ===
        registration_number.toLowerCase().trim()
      ) {
        return res.status(400).json({
          message: `Registration Number "${registration_number}" already exists`,
        });
      }
    }

    if (
      !student_name ||
      !fathers_name ||
      !student_id ||
      !registration_number ||
      !course ||
      !competency ||
      !batch ||
      !status ||
      !issue_date
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be filled" });
    }

    const courseData = await Course.findById(course);
    if (!courseData) {
      return res.status(400).json({ message: "Invalid course selected" });
    }

    // console.log("Course data found:", courseData);


    let photo_url = "";
    let photo_public_id = "";

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      photo_url = result.secure_url;
      photo_public_id = result.public_id;
    }

    const isActiveBool = is_active === "true" || is_active === true;
    const isVerifiedBool = is_verified === "true" || is_verified === true;


    const studentData = {
      student_name: student_name.trim(),
      fathers_name: fathers_name.trim(),
      student_id: student_id.trim(),
      registration_number: registration_number.trim(),
      course,
      course_name: courseData.course_name,
      course_code: courseData.course_code,
      course_duration: courseData.duration,
      competency,
      batch: batch.trim(),
      status,
      issue_date,
      completion_date: completion_date || null,
      is_active: isActiveBool,
      is_verified: isVerifiedBool,
      contact_number: contact_number ? contact_number.trim() : "",
      email: email ? email.trim().toLowerCase() : "",
      address: address ? address.trim() : "",
      photo_url,
      photo_public_id,
    };

    // console.log("Creating student with data:", studentData);

    const student = await Student.create(studentData);
    // console.log("Student created successfully:", student._id);

    res.status(201).json({
      message: "Student created successfully",
      data: student,
    });
  } catch (error) {
    console.error("Error creating student:", error);
    if (error.code === 11000) {
      // console.log("MongoDB duplicate key error:", error.keyValue);
      return res.status(400).json({
        message: `Duplicate key error: ${JSON.stringify(error.keyValue)}`,
      });
    }
    res.status(500).json({
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
  // finally {
  //   // Clean up uploaded file
  //   if (req.file && req.file.path && fs.existsSync(req.file.path)) {
  //     fs.unlinkSync(req.file.path);
  //   }
  // }
};

export const removeStudentImage = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (student.photo_public_id) {
      const rest = await cloudinary.uploader.destroy(student.photo_public_id);
      // console.log(rest);
    }

    student.photo_url = "";
    student.photo_public_id = "";
    await student.save();

    res.status(200).json({
      message: "Image removed successfully",
      data: student,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Toggle student active status
export const toggleStudentStatus = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    student.is_active = !student.is_active;
    await student.save();

    res.status(200).json({
      message: `Student ${
        student.is_active ? "activated" : "deactivated"
      } successfully`,
      data: student,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// search student
export const searchStudent = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === "") {
      return res.status(400).json({ message: "Search query is required" });
    }

    // Search by student_id or registration_number (exact or partial match)
    const students = await Student.find({
      $or: [
        { student_id: { $regex: query.trim(), $options: "i" } },
        { registration_number: { $regex: query.trim(), $options: "i" } },
      ],
    })
      .populate("course", "course_name course_code duration")
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      message: "Search completed",
      data: students,
      count: students.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const publicSearchStudent = async (req, res) => {
  try {
    const { query } = req.query;
    // console.log(query);

    if (!query || query.trim() === "") {
      return res.status(400).json({ message: "Search query is required" });
    }
    const student = await Student.findOne({
      $or: [
        { student_id: query.trim() },
        { registration_number: query.trim() },
      ],
      is_active: true,
    })
      .populate("course", "course_name course_code duration")
      .select("-photo_public_id -__v"); 

    // console.log(student);
    if (!student) {
      return res.status(404).json({
        message: "Student not found or not active",
        data: null,
      });
    }

    res.status(200).json({
      message: "Student found",
      data: student,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


