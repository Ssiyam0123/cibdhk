import Student from "../models/student.js";
import Course from "../models/course.js";

export const getDashboardStats = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    const [
      totalStudents,
      activeStudents,
      completedStudents,
      totalCourses,
      monthlyRegistrations,
      courseDistribution,
      statusDistribution,
      competencyStats,
      batchDistribution,
      recentActivities,
    ] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({
        is_active: true,
        status: { $in: ["active", "on_leave"] },
      }),
      Student.countDocuments({ status: "completed" }),
      Course.countDocuments(),
      Student.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(currentYear, 0, 1),
              $lte: new Date(currentYear, 11, 31, 23, 59, 59),
            },
          },
        },
        {
          $group: {
            _id: { $month: "$createdAt" },
            students: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Student.aggregate([
        {
          $group: {
            _id: "$course_name",
            students: { $sum: 1 },
          },
        },
        { $sort: { students: -1 } },
        { $limit: 5 },
      ]),
      Student.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
      Student.aggregate([
        {
          $group: {
            _id: "$competency",
            count: { $sum: 1 },
          },
        },
      ]),
      // New: Batch Distribution (top 10 batches)
      Student.aggregate([
        {
          $match: {
            batch: { $exists: true, $ne: null, $ne: "" },
          },
        },
        {
          $group: {
            _id: "$batch",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Student.find()
        .select("student_name student_id status competency createdAt")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    // Format monthly data
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const monthlyData = months.map((month, index) => {
      const found = monthlyRegistrations.find((m) => m._id === index + 1);
      return {
        month: month,
        students: found ? found.students : 0,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        totals: {
          students: {
            total: totalStudents,
            active: activeStudents,
            completed: completedStudents,
          },
          courses: {
            total: totalCourses,
            active: await Course.countDocuments({ is_active: true }),
          },
        },
        monthlyData,
        courseDistribution,
        statusDistribution,
        competencyStats,
        batchDistribution,
        recentActivities,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard statistics",
      error: error.message,
    });
  }
};
