const mongoose = require('mongoose');

const LearningBlockSchema = new mongoose.Schema({
  block_id: { type: String, required: true },
  concept_id: { type: String, required: true },
  type: { type: String, required: true },
  content: { type: String, required: true },
  support_tags: [{ type: String }],
  learning_objectives: [{ type: String }],
  misconceptions: [{ type: String }],
  source_document: { type: String, default: 'Unknown Document' },
  subject: { type: String, default: 'General' },
  grade: { type: String, default: 'All' },
  metadata: {
    chunk_size: { type: String, default: 'medium' },
    visual_density: { type: String, default: 'medium' },
    audio_enabled: { type: Boolean, default: false },
    gamification: { type: String, default: 'low' },
    complexity: { type: Number, default: 0.5 }
  }
}, { timestamps: true });

LearningBlockSchema.index({ concept_id: 1 });
LearningBlockSchema.index({ type: 1 });
LearningBlockSchema.index({ support_tags: 1 });

module.exports = mongoose.model('LearningBlock', LearningBlockSchema);
