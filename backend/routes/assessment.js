const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

const clamp = (v) => Math.min(1, Math.max(0, v));
router.get('/test', (req, res) => {
  res.json({
    status: 'Assessment Route Working'
  });
});

router.post('/evaluate', async (req, res) => {
  try {
    const { studentId, activity1, activity2, activity3, global } = req.body;

    const EXPECTED_GLOBAL_TIME = 240000;
    
    const CompletionScore = clamp(global.completedActivities / Math.max(1, global.requiredActivities));
    const RandomClickRatio = clamp(global.erraticClicks / Math.max(1, global.totalClicks));
    const TimeScore = clamp(global.totalTime / EXPECTED_GLOBAL_TIME);
    const FocusScore = clamp(1 - ((global.windowBlurCount * 0.05) + (global.assessmentRestarts * 0.1)));

    const Validity = clamp(
      (0.30 * CompletionScore) +
      (0.25 * TimeScore) +
      (0.25 * (1 - RandomClickRatio)) +
      (0.20 * FocusScore)
    );

    if (Validity < 0.5) {
      return res.status(200).json({
        status: "REJECTED",
        validity: Validity,
        features: null,
        cnv_profile: {
          attention_support: { value: 0.5, confidence: 0.1 },
          reading_support: { value: 0.5, confidence: 0.1 },
          sensory_support: { value: 0.5, confidence: 0.1 },
          structure_support: { value: 0.5, confidence: 0.1 },
          working_memory_support: { value: 0.5, confidence: 0.1 },
          audio_support: { value: 0.5, confidence: 0.1 },
          visual_support: { value: 0.5, confidence: 0.1 },
          gamification_support: { value: 0.5, confidence: 0.1 },
          chunking_support: { value: 0.5, confidence: 0.1 },
          fatigue_sensitivity: { value: 0.5, confidence: 0.1 },
          abstraction_support: { value: 0.5, confidence: 0.1 },
          pace_support: { value: 0.5, confidence: 0.1 }
        }
      });
    }

    const EXPECTED_CLUTTER_TIME = 45000;
    const INIT_DELAY_MAX = 15000;

    const SensoryDegradation = clamp(
      ((activity1.tClutter - activity1.tClean) / Math.max(1, activity1.tClean)) +
      (0.05 * activity1.scrollBacks) +
      (0.03 * activity1.rereads)
    );

    const InitiationDelay = clamp(activity1.tInit / INIT_DELAY_MAX);

    const ProcessingLag = clamp(activity1.tClutter / EXPECTED_CLUTTER_TIME);

    const TotalWrongClicks = activity1.wrongClicksClean + activity1.wrongClicksClutter;
    const DistractibilityIndex = clamp(
      (0.25 * clamp(TotalWrongClicks / 10)) +
      (0.25 * clamp(activity2.tabSwitches / 10)) +
      (0.25 * clamp(global.idleEvents / 10)) +
      (0.25 * clamp(activity1.rereads / 10))
    );

    const RecallFailureRate = clamp(1 - (activity2.recallCorrect / Math.max(1, activity2.recallTotal)));

    const WorkingMemoryLoad = clamp((RecallFailureRate * 0.7) + (clamp(activity2.tabSwitches / 10) * 0.3));

    const ConceptTransferDeficit = clamp(1 - (activity3.correctAnalogies / 3));

    const rawMotivation = (activity3.speedBase - activity3.speedReward) / Math.max(1, activity3.speedBase);
    const MotivationalResponsiveness = clamp((rawMotivation + 1) / 2);

    const AudioTimeAffinity = activity2.tAudio / Math.max(1, activity2.tAudio + activity2.tVisual + activity2.tText);
    const AudioCompletionBonus = activity2.audioCompleted ? 1 : (activity2.audioCompletionPercent / 100);
    const AudioAffinity = clamp(
      (0.3 * (activity2.firstChoice === "audio" ? 1 : 0)) +
      (0.3 * AudioTimeAffinity) +
      (0.3 * AudioCompletionBonus) +
      (0.1 * clamp(activity2.audioPlayCount / 3))
    );

    const VisualTimeAffinity = activity2.tVisual / Math.max(1, activity2.tAudio + activity2.tVisual + activity2.tText);
    const VisualEngagement = clamp((activity2.diagramInteractions + activity2.diagramZooms) / 25);
    const VisualAffinity = clamp(
      (0.3 * (activity2.firstChoice === "diagram" ? 1 : 0)) +
      (0.5 * VisualTimeAffinity) +
      (0.2 * VisualEngagement)
    );

    const TextAffinity = clamp(
      (0.4 * (activity2.firstChoice === "text" ? 1 : 0)) +
      (0.6 * (activity2.tText / Math.max(1, activity2.tAudio + activity2.tVisual + activity2.tText)))
    );

    const rawDecline = (activity1.activity1Speed - activity3.activity3Speed) / Math.max(0.001, activity1.activity1Speed);
    const PerformanceDeclineSlope = Math.max(-0.5, Math.min(0.5, rawDecline));

    const GlobalSpeed = clamp(global.totalTime / (EXPECTED_GLOBAL_TIME * 1.5));

    const features = {
      SensoryDegradation,
      InitiationDelay,
      ProcessingLag,
      DistractibilityIndex,
      RecallFailureRate,
      WorkingMemoryLoad,
      ConceptTransferDeficit,
      MotivationalResponsiveness,
      AudioAffinity,
      VisualAffinity,
      TextAffinity,
      PerformanceDeclineSlope,
      GlobalSpeed
    };

    const sessionEvidence = {
      attention_support: DistractibilityIndex,
      reading_support: clamp(1 - TextAffinity),
      sensory_support: SensoryDegradation,
      structure_support: InitiationDelay,
      working_memory_support: WorkingMemoryLoad,
      audio_support: AudioAffinity,
      visual_support: VisualAffinity,
      gamification_support: MotivationalResponsiveness,
      chunking_support: ProcessingLag,
      fatigue_sensitivity: clamp(0.5 + PerformanceDeclineSlope),
      abstraction_support: ConceptTransferDeficit,
      pace_support: GlobalSpeed
    };

    let student = await Student.findOne({ studentId });
    if (!student) {
      student = new Student({ studentId, name: studentId });
    }

    if (student.assessmentCount === 0) {
      const initConfidence = clamp(
  0.2 + (0.3 * Validity));
      const newCnvProfile = {};
      for (const [key, val] of Object.entries(sessionEvidence)) {
        newCnvProfile[key] = {
          value: val,
          confidence: initConfidence
        };
      }
      student.cnv_profile = newCnvProfile;
    } else {
      const ConfidenceGain = 0.2 * Validity;
      for (const [key, val] of Object.entries(sessionEvidence)) {
        const oldValue = student.cnv_profile[key].value;
        const oldConfidence = student.cnv_profile[key].confidence;
        
        student.cnv_profile[key].value = clamp((0.85 * oldValue) + (0.15 * val));
        student.cnv_profile[key].confidence = clamp(oldConfidence + ConfidenceGain);
      }
    }

    student.assessmentCount += 1;
    student.lastAssessmentDate = new Date();
    student.lastAssessmentValidity = Validity;

    student.assessmentHistory.push({
      validity: Validity,
      createdAt: new Date(),
      sessionEvidence
    });

    if (student.assessmentHistory.length > 20) {
      student.assessmentHistory = student.assessmentHistory.slice(-20);
    }

    await student.save();
    console.log("\n========== ASSESSMENT RESULTS ==========");
console.log("Student ID:", studentId);

console.log("\nValidity Score:");
console.log(Validity);

console.log("\nExtracted Features:");
console.log(features);

console.log("\nSession Evidence (Raw CNVs):");
console.log(sessionEvidence);

console.log("\nFinal CNV Profile (After EMA):");
console.log(student.cnv_profile);

console.log("\nAssessment Count:");
console.log(student.assessmentCount);

console.log("========================================\n");
    

    return res.status(200).json({
      status: "SUCCESS",
      validity: Validity,
      features,
      sessionEvidence,
      cnv_profile: student.cnv_profile,
      historyCount: student.assessmentHistory.length
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
