const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['teacher', 'student'],
    required: true
  },

  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  teacherId: {
    type: String,
    sparse: true,
    unique: true
  },

  institute: {
    type: String,
    required: true
  },

  grade: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
