const mongoose = require('mongoose');

const CNVSchema = new mongoose.Schema(
  {
    value: {
      type: Number,
      default: 0.5,
      min: 0,
      max: 1
    },
    confidence: {
      type: Number,
      default: 0.1,
      min: 0,
      max: 1
    }
  },
  { _id: false }
);

const AssessmentHistorySchema = new mongoose.Schema(
  {
    validity: {
      type: Number,
      min: 0,
      max: 1
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    sessionEvidence: {
      attention_support: Number,
      reading_support: Number,
      sensory_support: Number,
      structure_support: Number,
      working_memory_support: Number,
      audio_support: Number,
      visual_support: Number,
      gamification_support: Number,
      chunking_support: Number,
      fatigue_sensitivity: Number,
      abstraction_support: Number,
      pace_support: Number
    }
  },
  { _id: false }
);

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    name: {
      type: String,
      default: ''
    },

    assessmentCount: {
      type: Number,
      default: 0
    },

    lastAssessmentDate: {
      type: Date
    },

    lastAssessmentValidity: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },

    assessmentHistory: {
      type: [AssessmentHistorySchema],
      default: []
    },

    cnv_profile: {
      attention_support: { type: CNVSchema, default: () => ({}) },
      reading_support: { type: CNVSchema, default: () => ({}) },
      sensory_support: { type: CNVSchema, default: () => ({}) },
      structure_support: { type: CNVSchema, default: () => ({}) },
      working_memory_support: { type: CNVSchema, default: () => ({}) },
      audio_support: { type: CNVSchema, default: () => ({}) },
      visual_support: { type: CNVSchema, default: () => ({}) },
      gamification_support: { type: CNVSchema, default: () => ({}) },
      chunking_support: { type: CNVSchema, default: () => ({}) },
      fatigue_sensitivity: { type: CNVSchema, default: () => ({}) },
      abstraction_support: { type: CNVSchema, default: () => ({}) },
      pace_support: { type: CNVSchema, default: () => ({}) }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Student', studentSchema);