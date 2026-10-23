
const mongoose = require("mongoose");

// Attendance data structure
const attendanceSchema = new mongoose.Schema({
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Faculty",
    required: true
  },

  date: {
    type: String,
    required: true
  },

  status: {
    type: String,
    enum: ["Present", "Absent"],
    required: true
  }
});

// Prevent duplicate attendance for the same faculty on the same date
attendanceSchema.index(
  { faculty: 1, date: 1 },
  { unique: true }
);

// Export Attendance model
module.exports = mongoose.model("Attendance", attendanceSchema);
