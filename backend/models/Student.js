// Tracked by Git
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cnv_state: {
    attention_span: { value: { type: Number, default: 0.5 }, confidence: { type: Number, default: 0.1 } },
    reading_support: { value: { type: Number, default: 0.5 }, confidence: { type: Number, default: 0.1 } },
    sensory_sensitivity: { value: { type: Number, default: 0.5 }, confidence: { type: Number, default: 0.1 } },
    predictability_need: { value: { type: Number, default: 0.5 }, confidence: { type: Number, default: 0.1 } },
    gamification_affinity: { value: { type: Number, default: 0.5 }, confidence: { type: Number, default: 0.1 } },
    audio_preference: { value: { type: Number, default: 0.5 }, confidence: { type: Number, default: 0.1 } },
    cognitive_fatigue_rate: { value: { type: Number, default: 0.5 }, confidence: { type: Number, default: 0.1 } },
    chunking_requirement: { value: { type: Number, default: 0.5 }, confidence: { type: Number, default: 0.1 } },
    visual_processing_load: { value: { type: Number, default: 0.5 }, confidence: { type: Number, default: 0.1 } }
  },
  is_baseline_valid: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
