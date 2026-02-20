
import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    student_name: {
      type: String,
      required: true,
      trim: true,
    },
    fathers_name: {
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
    registration_number: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    course_name: {
      type: String,
      required: true,
      trim: true,
    },

    course_code: {
      type: String,
      required: true,
      trim: true,
    },

    course_duration: {
      value: {
        type: Number,
        required: true,
      },
      unit: {
        type: String,
        enum: ["months", "years"],
        default: "months",
      },
    },

    competency: {
      type: String,
      enum: ["competent", "incompetent", "not_assessed"], 
      required: true,
    },

    // Academic Information
    batch: {
      type: String,
      required: true,
      trim: true,
    },

    // Status and Dates
    status: {
      type: String,
      enum: ["active", "inactive", "completed", "discontinued", "on_leave"],
      default: "active",
      required: true,
    },
    // check: {
    //   type: String,
    //   enum: ["haccp&hygiene", "city&guild", "nsda"],
    //   default: "haccp&hygiene",
    // },

    is_active: {
      type: Boolean,
      default: true,
    },

    is_verified: {
      type: Boolean,
      default: false,
    },

    issue_date: {
      type: Date,
      required: true,
    },

    completion_date: {
      type: Date,
    },

    photo_url: {
      type: String,
      default: "",
    },

    photo_public_id: {
      type: String,
      default: "",
    },

    contact_number: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    address: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);


studentSchema.index({
  student_id: 1,
  registration_number: 1,
});

studentSchema.index({
  batch: 1,
  status: 1,
});

const Student = mongoose.model("Student", studentSchema);

export default Student;
