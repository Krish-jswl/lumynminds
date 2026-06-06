const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const LearningBlock = require('../models/LearningBlock');
const KnowledgeGraph = require('../models/KnowledgeGraph');

const CONFIDENCE_THRESHOLD = 0.3;

router.get('/rules/:studentId', async (req, res) => {
  try {
    const student = await Student.findOne({ studentId: req.params.studentId });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const cnv = student.cnv_profile;

    const rules = {
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

    const adaptation_reasons = [];
    const active_profiles = [];

    const v = (key) => cnv[key]?.value ?? 0.5;
    const c = (key) => cnv[key]?.confidence ?? 0;
    const highNeed = (key) => v(key) > 0.6 && c(key) > CONFIDENCE_THRESHOLD;

    if (highNeed('sensory_support')) {
      rules.theme = 'low_stimulation';
      rules.reduce_visual_noise = true;
      adaptation_reasons.push('High sensory support need detected.');
      active_profiles.push('sensory');
    }

    if (highNeed('reading_support')) {
      rules.font_size = 'large';
      rules.show_summary_first = true;
      adaptation_reasons.push('Reading support enabled.');
      active_profiles.push('reading');
    }

    if (highNeed('chunking_support')) {
      rules.chunking_level = 'strict';
      rules.show_checkpoints = true;
      adaptation_reasons.push('Content chunking enabled.');
      active_profiles.push('chunking');
    }

    if (highNeed('abstraction_support')) {
      rules.inject_analogies = true;
      rules.inject_worked_examples = true;
      adaptation_reasons.push('Concrete analogies required.');
      active_profiles.push('abstraction');
    }

    if (highNeed('working_memory_support')) {
      rules.inject_worked_examples = true;
      rules.show_checkpoints = true;
      adaptation_reasons.push('Worked examples and checkpoints added for working memory.');
      active_profiles.push('working_memory');
    }

    if (highNeed('attention_support')) {
      rules.show_checkpoints = true;
      rules.enable_focus_mode = true;
      adaptation_reasons.push('Attention scaffolding enabled.');
      active_profiles.push('attention');
    }

    if (highNeed('structure_support')) {
      rules.inject_worked_examples = true;
      rules.show_checkpoints = true;
      rules.predictable_navigation = true;
      adaptation_reasons.push('Additional learning structure enabled.');
      active_profiles.push('structure');
    }

    if (highNeed('gamification_support')) {
      rules.enable_gamification = true;
      adaptation_reasons.push('Gamification enabled.');
      active_profiles.push('gamification');
    }

    if (highNeed('fatigue_sensitivity')) {
      rules.enable_break_reminders = true;
      adaptation_reasons.push('Fatigue support activated.');
      active_profiles.push('fatigue');
    }

    if (highNeed('pace_support')) {
      rules.slow_learning_mode = true;
      adaptation_reasons.push('Reduced pacing activated.');
      active_profiles.push('pace');
    }

    const audioVal = v('audio_support');
    const visualVal = v('visual_support');
    const audioConf = c('audio_support');
    const visualConf = c('visual_support');

    if (audioVal > visualVal && audioConf > CONFIDENCE_THRESHOLD) {
      rules.enable_audio = true;
      adaptation_reasons.push('Audio modality preferred.');
      active_profiles.push('audio');
    } 
    
    if (visualVal > audioVal && visualConf > CONFIDENCE_THRESHOLD) {
      rules.require_visuals = true;
      adaptation_reasons.push('Visual modality preferred.');
      active_profiles.push('visual');
    }

    if (audioVal <= visualVal && visualVal <= audioVal && audioConf > CONFIDENCE_THRESHOLD && visualConf > CONFIDENCE_THRESHOLD) {
      rules.enable_audio = true;
      rules.require_visuals = true;
      adaptation_reasons.push('Mixed modality support enabled.');
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
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    
    // Filter by student's grade, handling both "9" and "Grade 9" formats
    const sGrade = String(student.grade).trim();
    const formattedGrade = sGrade.toLowerCase().includes('grade') ? sGrade : `Grade ${sGrade}`;
    
    const query = { grade: { $in: [sGrade, formattedGrade, 'All'] } };
    
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
