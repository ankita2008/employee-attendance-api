
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Faculty = require("./models/Faculty");
const Attendance = require("./models/Attendance");
const auth = require("./middleware/auth");

const app = express();

app.use(express.json());

// Get today's date
const getToday = () => {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata"
  });
};

// 1. Faculty Registration API
app.post("/api/faculty/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const existingFaculty = await Faculty.findOne({ email });

    if (existingFaculty) {
      return res.status(409).json({
        message: "Faculty already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await Faculty.create({
      name,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      message: "Faculty registered successfully"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. Faculty Login API
app.post("/api/faculty/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const faculty = await Faculty.findOne({ email });

    if (
      !faculty ||
      !(await bcrypt.compare(password, faculty.password))
    ) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      { facultyId: faculty._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. Mark Attendance API (Protected)
app.post("/api/attendance/mark", auth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Present", "Absent"].includes(status)) {
      return res.status(400).json({
        message: "Status must be Present or Absent"
      });
    }

    const attendance = await Attendance.create({
      faculty: req.facultyId,
      date: getToday(),
      status
    });

    res.status(201).json({
      message: "Attendance marked successfully",
      attendance
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Attendance already marked today"
      });
    }

    res.status(500).json({ message: error.message });
  }
});

// 4. Get Today's Attendance API (Protected)
app.get("/api/attendance/today", auth, async (req, res) => {
  try {
    const attendance = await Attendance.findOne({
      faculty: req.facultyId,
      date: getToday()
    });

    if (!attendance) {
      return res.status(404).json({
        message: "No attendance found for today"
      });
    }

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 5. Get Attendance by Date API (Protected)
app.get("/api/attendance/date/:date", auth, async (req, res) => {
  try {
    const attendance = await Attendance.find({
      faculty: req.facultyId,
      date: req.params.date
    });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Connect MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(process.env.PORT || 5000, () => {
      console.log("Server running on port 5000");
    });
  })
  .catch((error) => {
    console.log("MongoDB connection error:", error.message);
  });
