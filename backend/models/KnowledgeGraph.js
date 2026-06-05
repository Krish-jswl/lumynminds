// Tracked by Git
const mongoose = require('mongoose');

const learningBlockSchema = new mongoose.Schema({
  concept_id: { type: String, required: true, unique: true },
  concept: { type: String, required: true },
  difficulty: { type: Number, required: true },
  cognitive_load: { type: Number, required: true },
  abstraction_level: { type: Number, required: true },
  requires_visualization: { type: Boolean, default: false },
  learning_objectives: [{ type: String }],
  misconceptions: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('KnowledgeGraph', learningBlockSchema);
