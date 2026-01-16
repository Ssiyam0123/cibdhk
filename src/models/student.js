import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    student_name: {
      type: String,
      required: true,
      trim: true,
    },

    student_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    reg_number: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    course_name: {
      type: String,
      required: true,
      trim: true,
    },

    batch: {
      type: String,
      required: true,
      trim: true,
    },

    issue_date: {
      type: Date,
      required: true,
    },

    photo_url: {
      type: String,
      default: "",
    },

    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

// Helpful indexes for fast lookup
studentSchema.index({
  student_id: 1,
  reg_number: 1,
});

const Student = mongoose.model("Student", studentSchema);

export default Student;
