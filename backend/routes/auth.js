const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

const router = express.Router();

// =========================
// Teacher Register
// =========================
router.post('/teacher/register', async (req, res) => {
  try {
    const {
      name,
      email,
      teacherId,
      institute,
      password
    } = req.body;

    if (!name || !email || !teacherId || !institute || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    const existingTeacher = await User.findOne({
      $or: [
        { email },
        { teacherId }
      ]
    });

    if (existingTeacher) {
      return res.status(400).json({
        success: false,
        message: 'Teacher already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const teacher = await User.create({
      role: 'teacher',
      name,
      email,
      teacherId,
      institute,
      password: hashedPassword
    });

    res.status(201).json({
      success: true,
      teacher: {
        id: teacher._id,
        role: teacher.role,
        name: teacher.name,
        email: teacher.email,
        teacherId: teacher.teacherId,
        institute: teacher.institute
      }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// =========================
// Teacher Login
// =========================
router.post('/teacher/login', async (req, res) => {
  try {
    const { teacherId, password } = req.body;

    if (!teacherId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Teacher ID and password are required'
      });
    }

    const teacher = await User.findOne({
      teacherId,
      role: 'teacher'
    });

    if (!teacher) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      teacher.password
    );

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      {
        id: teacher._id,
        role: teacher.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: teacher._id,
        role: teacher.role,
        name: teacher.name,
        email: teacher.email,
        teacherId: teacher.teacherId,
        institute: teacher.institute
      }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// =========================
// Student Register
// =========================
router.post('/student/register', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      grade,
      institute
    } = req.body;

    if (!name || !email || !password || !grade || !institute) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    const existingStudent = await User.findOne({
      email
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Student already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = await User.create({
      role: 'student',
      name,
      email,
      password: hashedPassword,
      grade,
      institute
    });

    res.status(201).json({
      success: true,
      student: {
        id: student._id,
        role: student.role,
        name: student.name,
        email: student.email,
        grade: student.grade,
        institute: student.institute
      }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// =========================
// Student Login
// =========================
router.post('/student/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const student = await User.findOne({
      email,
      role: 'student'
    });

    if (!student) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      student.password
    );

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      {
        id: student._id,
        role: student.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: student._id,
        role: student.role,
        name: student.name,
        email: student.email,
        grade: student.grade,
        institute: student.institute
      }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// =========================
// Fetch Students by Institute
// =========================
router.get('/students', async (req, res) => {
  try {
    const { institute } = req.query;

    if (!institute) {
      return res.status(400).json({ success: false, message: 'Institute parameter is required' });
    }

    // Find all users who are students AND belong to the requested institute
    const students = await User.find({
      role: 'student',
      institute: { $regex: new RegExp(`^${institute}$`, 'i') } // Case-insensitive!
    }).select('-password');

    res.json({ success: true, students });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
