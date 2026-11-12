const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Student = require('../models/Student');
const User = require('../models/User');
const LearningBlock = require('../models/LearningBlock');
const KnowledgeGraph = require('../models/KnowledgeGraph');

const CONFIDENCE_THRESHOLD = 0.3;

const DEFAULT_RULES = {
  theme: 'default',
  chunking_level: 'standard',
  font_size: 'standard',
  show_checkpoints: false,
  inject_analogies: false,
  inject_worked_examples: false,
  enable_audio: false,
  require_visuals: false,
  enable_gamification: false,
  enable_focus_mode: false,
  predictable_navigation: false,
  slow_learning_mode: false,
  show_summary_first: false,
  enable_break_reminders: false,
  reduce_visual_noise: false
};

async function findUserByStudentId(studentId) {
  if (!mongoose.Types.ObjectId.isValid(studentId)) return null;
  return User.findById(studentId).select('name grade').lean();
}

router.get('/rules/:studentId', async (req, res) => {
  try {
    const student = await Student.findOne({ studentId: req.params.studentId });

    if (!student) {
      const user = await findUserByStudentId(req.params.studentId);
      if (!user) {
        return res.status(404).json({ error: 'Student not found' });
      }
      return res.status(200).json({
        rules: { ...DEFAULT_RULES },
        adaptation_reasons: [],
        active_profiles: [],
        raw_cnv: {},
        assessmentCount: 0
      });
    }

    const cnv = student.cnv_profile;

    const rules = { ...DEFAULT_RULES };

    const adaptation_reasons = [];
    const active_profiles = [];

    const v = (key) => cnv[key]?.value ?? 0.5;
    const c = (key) => cnv[key]?.confidence ?? 0;
    // An accommodation activates when the measured need is elevated (>= 0.52) with at least minimal confidence (>= 0.2)
    const elevated = (key) => v(key) >= 0.52 && c(key) >= 0.2;

    if (elevated('sensory_support')) {
      rules.theme = 'low_stimulation';
      rules.reduce_visual_noise = true;
      adaptation_reasons.push('Sensory support: calming theme with minimal visual noise.');
      active_profiles.push('sensory');
    }

    if (elevated('reading_support')) {
      rules.font_size = 'large';
      rules.show_summary_first = true;
      adaptation_reasons.push('Reading support: larger typography and summary-first layout.');
      active_profiles.push('reading');
    }

    if (elevated('chunking_support')) {
      rules.chunking_level = 'strict';
      rules.show_checkpoints = true;
      adaptation_reasons.push('Content chunking: micro-steps with inline checkpoints.');
      active_profiles.push('chunking');
    }

    if (elevated('abstraction_support')) {
      rules.inject_analogies = true;
      rules.inject_worked_examples = true;
      adaptation_reasons.push('Abstraction support: real-world analogies and concrete metaphors.');
      active_profiles.push('abstraction');
    }

    if (elevated('working_memory_support')) {
      rules.inject_worked_examples = true;
      rules.show_checkpoints = true;
      adaptation_reasons.push('Working memory: step-by-step worked examples and checkpoints.');
      active_profiles.push('working_memory');
    }

    if (elevated('attention_support')) {
      rules.show_checkpoints = true;
      rules.enable_focus_mode = true;
      adaptation_reasons.push('Attention scaffolding: single-concept focus mode.');
      active_profiles.push('attention');
    }

    if (elevated('structure_support')) {
      rules.inject_worked_examples = true;
      rules.show_checkpoints = true;
      rules.predictable_navigation = true;
      adaptation_reasons.push('Structure support: guided, sequential navigation.');
      active_profiles.push('structure');
    }

    if (elevated('gamification_support')) {
      rules.enable_gamification = true;
      adaptation_reasons.push('Gamification: interactive XP, streak tracking, and achievement feedback.');
      active_profiles.push('gamification');
    }

    if (elevated('fatigue_sensitivity')) {
      rules.enable_break_reminders = true;
      adaptation_reasons.push('Fatigue management: periodic rest and stretch reminders.');
      active_profiles.push('fatigue');
    }

    if (elevated('pace_support')) {
      rules.slow_learning_mode = true;
      adaptation_reasons.push('Comfortable pacing: timer-free learning with self-paced progression.');
      active_profiles.push('pace');
    }

    const audioVal = v('audio_support');
    const visualVal = v('visual_support');
    const audioConf = c('audio_support');
    const visualConf = c('visual_support');

    // Both audio and visuals can be enabled simultaneously (multi-modal learning).
    if (audioVal >= 0.48 && audioConf >= 0.2) {
      rules.enable_audio = true;
      adaptation_reasons.push('Audio narration and read-aloud support enabled.');
      if (!active_profiles.includes('audio')) active_profiles.push('audio');
    }

    if (visualVal >= 0.48 && visualConf >= 0.2) {
      rules.require_visuals = true;
      adaptation_reasons.push('Visual learning: interactive diagrams and concept graphs.');
      if (!active_profiles.includes('visual')) active_profiles.push('visual');
    }

    // Default audio fallback: even if audio is not the primary high need, allow audio narration tools
    if (!rules.enable_audio && audioVal >= 0.35) {
      rules.enable_audio = true;
    }

    const raw_cnv = {};
    const cnvObj = cnv.toObject ? cnv.toObject() : cnv;
    for (const [key, obj] of Object.entries(cnvObj)) {
      if (obj && typeof obj === 'object' && 'value' in obj) {
        raw_cnv[key] = { value: obj.value, confidence: obj.confidence };
      }
    }

    return res.status(200).json({
      rules,
      adaptation_reasons,
      active_profiles,
      raw_cnv,
      assessmentCount: student.assessmentCount
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /blocks/:studentId
router.get('/blocks/:studentId', async (req, res) => {
  try {
    const student = await Student.findOne({ studentId: req.params.studentId });
    const user = await findUserByStudentId(req.params.studentId);

    if (!student && !user) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Filter by student's grade, handling both "9" and "Grade 9" formats
    const rawGrade = (student?.grade && student.grade !== 'All') ? student.grade : user?.grade;
    const query = rawGrade
      ? (() => {
          const sGrade = String(rawGrade).trim();
          const formattedGrade = sGrade.toLowerCase().includes('grade') ? sGrade : `Grade ${sGrade}`;
          return { grade: { $in: [sGrade, formattedGrade, 'All'] } };
        })()
      : { grade: 'All' };

    const blocks = await LearningBlock.find(query).lean();
    const concepts = await KnowledgeGraph.find(query).lean();

    const conceptMap = {};
    concepts.forEach(c => {
      conceptMap[c.concept_id] = c;
    });

    return res.status(200).json({ blocks, concepts: conceptMap });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/student-status/:studentId', async (req, res) => {
  try {
    const student = await Student.findOne({ studentId: req.params.studentId });
    if (!student) {
      return res.status(200).json({ exists: false, assessmentCount: 0, needsAssessment: true });
    }
    return res.status(200).json({
      exists: true,
      assessmentCount: student.assessmentCount,
      needsAssessment: student.assessmentCount === 0,
      lastAssessmentDate: student.lastAssessmentDate
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
