// Tracked by Git
const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const pdfParse = require('pdf-parse-new');
const Groq = require('groq-sdk');
const KnowledgeGraph = require('../models/KnowledgeGraph');
const LearningBlock = require('../models/LearningBlock');

// Initialize Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MAX_SOURCE_TEXT = 4000;
const MAX_CONCEPTS = 4;
const CONCEPT_COOLDOWN_MS = 2000;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================
// EXISTING ROUTE — POST /upload (Feature 3: Knowledge Graph)
// ============================================================

router.post('/upload', upload.single('curriculum'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded.' });
    }

    const source_document = req.file.originalname || 'Unknown Document';
    const subject = req.body.subject || 'General';
    const grade = req.body.grade || 'All';

    console.log("📄 File Received. Extracting text...");

    let rawText = "";
    try {
      const pdfData = await pdfParse(req.file.buffer);
      rawText = pdfData.text;
    } catch (parseError) {
      console.error("❌ pdf-parse failed:", parseError.message);
      return res.status(400).json({ error: 'Failed to parse PDF. The file may be corrupt or not a valid PDF.' });
    }

    if (!rawText || rawText.trim().length === 0) {
      return res.status(400).json({ error: 'PDF parsed but contained no readable text.' });
    }

    // Clean extracted text: collapse excess whitespace and newlines
    const cleanedText = rawText.replace(/\n{2,}/g, '\n').replace(/[ \t]{2,}/g, ' ').trim();

    // Truncate to 3000 chars to prevent context window overload
    const textToAnalyze = cleanedText.substring(0, 15000);
    console.log(`🧠 Text ready (Length: ${textToAnalyze.length}). Sending to Groq...`);
    
    const prompt = `
      You are an expert instructional designer building an Adaptive Cognitive Learning Infrastructure.
      Analyze the following curriculum text. Break it down into atomic learning blocks.
      
      Return a JSON object containing a single key "blocks" with an array of objects.
      Each object MUST have this exact structure:
      {
        "concept_id": "A unique string ID (e.g., c_101)",
        "concept": "The core concept name",
        "difficulty": A number between 0.0 and 1.0,
        "cognitive_load": A number between 0.0 and 1.0,
        "abstraction_level": A number between 0.0 and 1.0,
        "requires_visualization": true or false,
        "learning_objectives": ["Array", "of", "strings"],
        "misconceptions": ["Array", "of", "strings"]
      }

      Curriculum Text to analyze:
      ${textToAnalyze}
    `;

    // Call Groq LLaMA 3 70B
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      max_tokens: 4000,
      response_format: { type: "json_object" },
    });

    const aiResponse = completion.choices[0].message.content;
    const parsedData = JSON.parse(aiResponse);
    const blocks = parsedData.blocks;

    blocks.forEach((block, index) => {
      block.concept_id = `concept_${Date.now()}_${index}`;
      block.source_document = source_document;
      block.subject = subject;
      block.grade = grade;
    });
    
    console.log(`💾 Saving ${blocks.length} blocks to database...`);
    await KnowledgeGraph.insertMany(blocks);

    res.json({ 
      message: 'Knowledge Graph generated and saved successfully!', 
      blocksProcessed: blocks.length,
      data: blocks,
      sourceText: textToAnalyze 
    });

  } catch (error) {
    console.error('❌ Ingestion Error:', error);
    res.status(500).json({ error: 'Failed to process the PDF or generate AI content.' });
  }
});

// ============================================================
// FEATURE 4 — Learning Block Generator
// ============================================================

const ALLOWED_BLOCK_TYPES = new Set([
  'simplified_text', 'summary', 'analogy', 'worked_example',
  'checkpoint', 'quiz', 'reflection', 'challenge',
  'visual_prompt', 'audio_script', 'diagram_description', 'animation_cue',
  'mermaid_graph'
]);

const ALL_EXPECTED_TYPES = [...ALLOWED_BLOCK_TYPES];

const SUPPORT_TAG_MAP = {
  simplified_text: ['reading_support', 'structure_support', 'chunking_support'],
  summary: ['reading_support', 'structure_support'],
  analogy: ['abstraction_support'],
  worked_example: ['abstraction_support', 'structure_support'],
  checkpoint: ['attention_support', 'gamification_support'],
  quiz: ['attention_support', 'gamification_support', 'pace_support'],
  reflection: ['pace_support'],
  challenge: ['attention_support', 'pace_support'],
  visual_prompt: ['visual_support'],
  audio_script: ['audio_support', 'fatigue_sensitivity'],
  diagram_description: ['visual_support'],
  animation_cue: ['visual_support', 'attention_support'],
  mermaid_graph: ['visual_support', 'structure_support']
};

const VALID_CHUNK_SIZES = new Set(['small', 'medium', 'large']);
const VALID_VISUAL_DENSITIES = new Set(['low', 'medium', 'high']);
const VALID_GAMIFICATION = new Set(['low', 'medium', 'high']);

function validateBlock(block) {
  if (!block || typeof block !== 'object') return false;
  if (!block.type || !ALLOWED_BLOCK_TYPES.has(block.type)) return false;
  if (!block.content || typeof block.content !== 'string' || block.content.trim().length === 0) return false;
  return true;
}

function normalizeMetadata(metadata) {
  if (!metadata || typeof metadata !== 'object') {
    return {
      chunk_size: 'medium',
      visual_density: 'medium',
      audio_enabled: false,
      gamification: 'low',
      complexity: 0.5
    };
  }

  return {
    chunk_size: VALID_CHUNK_SIZES.has(metadata.chunk_size) ? metadata.chunk_size : 'medium',
    visual_density: VALID_VISUAL_DENSITIES.has(metadata.visual_density) ? metadata.visual_density : 'medium',
    audio_enabled: Boolean(metadata.audio_enabled),
    gamification: VALID_GAMIFICATION.has(metadata.gamification) ? metadata.gamification : 'low',
    complexity: typeof metadata.complexity === 'number' ? Math.min(1, Math.max(0, metadata.complexity)) : 0.5
  };
}

function validateMermaid(content) {
  if (!content || typeof content !== 'string') return false;
  const lower = content.trim().toLowerCase();
  return lower.includes('graph') || lower.includes('flowchart');
}

function sanitizeBlocks(blocks) {
  if (!Array.isArray(blocks)) return [];

  return blocks.filter(block => {
    if (!validateBlock(block)) return false;
    if (block.type === 'mermaid_graph' && !validateMermaid(block.content)) return false;
    return true;
  }).map(block => ({
    type: block.type,
    content: block.content.trim(),
    metadata: normalizeMetadata(block.metadata),
    support_tags: SUPPORT_TAG_MAP[block.type] || []
  }));
}

async function generateBlocks(systemPrompt, userPrompt, maxTokens) {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: maxTokens,
      response_format: { type: "json_object" }
    });

    const raw = completion.choices[0].message.content;
    try {
      const parsed = JSON.parse(raw);
      return parsed.blocks || [];
    } catch (jsonErr) {
      console.warn("⚠️ JSON malformed on first attempt. Retrying...");
      const retry = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt + "\n\nIMPORTANT: Your previous response had invalid JSON. Return ONLY valid JSON this time." }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.2,
        max_tokens: maxTokens,
        response_format: { type: "json_object" }
      });
      try {
        const retryParsed = JSON.parse(retry.choices[0].message.content);
        return retryParsed.blocks || [];
      } catch (retryErr) {
        console.error("❌ JSON parse failed after retry:", retryErr.message);
        return [];
      }
    }
  } catch (apiErr) {
    if (apiErr.status === 429 || (apiErr.message && apiErr.message.includes('429'))) {
      const retryAfter = apiErr.headers?.['retry-after'];
      const waitMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : 30000;
      console.warn(`⏳ 429 Rate limited. Waiting ${waitMs / 1000}s before retry...`);
      await sleep(waitMs);
      try {
        const retryCompletion = await groq.chat.completions.create({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          model: "llama-3.3-70b-versatile",
          temperature: 0.3,
          max_tokens: maxTokens,
          response_format: { type: "json_object" }
        });
        const retryRaw = retryCompletion.choices[0].message.content;
        const retryParsed = JSON.parse(retryRaw);
        return retryParsed.blocks || [];
      } catch (retryErr) {
        console.error("❌ 429 retry also failed:", retryErr.message);
        return [];
      }
    }
    console.error("❌ Groq API call failed:", apiErr.message);
    return [];
  }
}

function buildConceptContext(concept) {
  return `
CONCEPT: ${concept.concept}
CONCEPT ID: ${concept.concept_id}
DIFFICULTY: ${concept.difficulty}
COGNITIVE LOAD: ${concept.cognitive_load}
ABSTRACTION LEVEL: ${concept.abstraction_level}
LEARNING OBJECTIVES: ${JSON.stringify(concept.learning_objectives)}
MISCONCEPTIONS: ${JSON.stringify(concept.misconceptions)}
  `.trim();
}

function runStructureEngine(concept, sourceText) {
  const systemPrompt = `You are the Structure Engine of an Adaptive Cognitive Learning Infrastructure.
Your purpose: reading_support, structure_support, chunking_support, abstraction_support.
You generate 4 block types: simplified_text, summary, analogy, worked_example.

Rules:
- Use ONLY the provided sourceText. Do NOT hallucinate or fabricate information.
- Low cognitive load. Short paragraphs. High clarity. Concrete examples.
- Analogy: a conceptual comparison relating the concept to something familiar.
- Worked Example: a step-by-step application showing how to use/apply the concept.
- These are DIFFERENT types. Do not confuse them.

Return ONLY this exact JSON structure:
{
  "blocks": [
    {
      "type": "simplified_text",
      "content": "...",
      "metadata": { "chunk_size": "small", "visual_density": "low", "audio_enabled": true, "gamification": "low", "complexity": 0.2 }
    },
    {
      "type": "summary",
      "content": "...",
      "metadata": { "chunk_size": "small", "visual_density": "low", "audio_enabled": true, "gamification": "low", "complexity": 0.3 }
    },
    {
      "type": "analogy",
      "content": "...",
      "metadata": { "chunk_size": "small", "visual_density": "low", "audio_enabled": true, "gamification": "low", "complexity": 0.25 }
    },
    {
      "type": "worked_example",
      "content": "...",
      "metadata": { "chunk_size": "medium", "visual_density": "low", "audio_enabled": true, "gamification": "low", "complexity": 0.4 }
    }
  ]
}`;

  const userPrompt = `${buildConceptContext(concept)}

SOURCE TEXT:
${sourceText}

CRITICAL INSTRUCTION:
Do not summarize the entire text. You must scan the SOURCE TEXT and isolate the specific information related to the concept: "${concept.concept}". 
Base your blocks EXCLUSIVELY on the details, facts, and analogies relevant to "${concept.concept}". If the text provides a specific analogy (e.g., watermelon, plum pudding), use it. Do not use generic analogies like "LEGOs".`;

  return generateBlocks(systemPrompt, userPrompt, 1200);
}

function runEngagementEngine(concept, sourceText) {
  const systemPrompt = `You are the Engagement Engine of an Adaptive Cognitive Learning Infrastructure.
Your purpose: attention_support, gamification_support, pace_support.
You generate 4 block types: checkpoint, quiz, reflection, challenge.

Rules:
- Active recall. Short interactions. Concept focused.
- Use ONLY the provided sourceText. Do NOT fabricate information.

Return ONLY this exact JSON structure:
{
  "blocks": [
    {
      "type": "checkpoint",
      "content": "...",
      "metadata": { "chunk_size": "small", "visual_density": "low", "audio_enabled": false, "gamification": "medium", "complexity": 0.3 }
    },
    {
      "type": "quiz",
      "content": "...",
      "metadata": { "chunk_size": "small", "visual_density": "medium", "audio_enabled": false, "gamification": "high", "complexity": 0.5 }
    },
    {
      "type": "reflection",
      "content": "...",
      "metadata": { "chunk_size": "small", "visual_density": "low", "audio_enabled": true, "gamification": "low", "complexity": 0.35 }
    },
    {
      "type": "challenge",
      "content": "...",
      "metadata": { "chunk_size": "medium", "visual_density": "medium", "audio_enabled": false, "gamification": "high", "complexity": 0.6 }
    }
  ]
}`;

  const userPrompt = `${buildConceptContext(concept)}

SOURCE TEXT:
${sourceText}

CRITICAL INSTRUCTION:
Do not summarize the entire text. You must scan the SOURCE TEXT and isolate the specific information related to the concept: "${concept.concept}". 
Base your blocks EXCLUSIVELY on the details, facts, and analogies relevant to "${concept.concept}". If the text provides a specific analogy (e.g., watermelon, plum pudding), use it. Do not use generic analogies like "LEGOs".`;

  return generateBlocks(systemPrompt, userPrompt, 800);
}

function runMultimodalEngine(concept, sourceText) {
  const systemPrompt = `You are the Multimodal Engine of an Adaptive Cognitive Learning Infrastructure.
Your purpose: visual_support, audio_support, fatigue_sensitivity.
You generate 4 block types: visual_prompt, audio_script, diagram_description, animation_cue.

Rules:
- Optimized for UI rendering, TTS, and accessibility.
- Use ONLY the provided sourceText. Do NOT fabricate information.

Return ONLY this exact JSON structure:
{
  "blocks": [
    {
      "type": "visual_prompt",
      "content": "...",
      "metadata": { "chunk_size": "small", "visual_density": "high", "audio_enabled": false, "gamification": "low", "complexity": 0.3 }
    },
    {
      "type": "audio_script",
      "content": "...",
      "metadata": { "chunk_size": "medium", "visual_density": "low", "audio_enabled": true, "gamification": "low", "complexity": 0.3 }
    },
    {
      "type": "diagram_description",
      "content": "...",
      "metadata": { "chunk_size": "medium", "visual_density": "high", "audio_enabled": false, "gamification": "low", "complexity": 0.4 }
    },
    {
      "type": "animation_cue",
      "content": "...",
      "metadata": { "chunk_size": "small", "visual_density": "high", "audio_enabled": false, "gamification": "medium", "complexity": 0.35 }
    }
  ]
}`;

  const userPrompt = `${buildConceptContext(concept)}

SOURCE TEXT:
${sourceText}

Generate all 4 multimodal blocks for this concept using ONLY the source text above.
CRITICAL INSTRUCTION:
Do not summarize the entire text. You must scan the SOURCE TEXT and isolate the specific information related to the concept: "${concept.concept}". 
Base your blocks EXCLUSIVELY on the details, facts, and analogies relevant to "${concept.concept}". If the text provides a specific analogy (e.g., watermelon, plum pudding), use it. Do not use generic analogies like "LEGOs".`;


  return generateBlocks(systemPrompt, userPrompt, 800);
}

function runKnowledgeVisualizationEngine(concept, sourceText) {
  const systemPrompt = `You are the Knowledge Visualization Engine.
Generate exactly 1 Mermaid concept graph.

STRICT RULES:
- Output ONLY valid Mermaid syntax starting with "graph TD" or "flowchart TD".
- NO markdown wrappers. NO explanations. NO descriptions. NO educational text.
- Raw Mermaid graph code ONLY in the "content" field.
- Keep it concise: 5-10 nodes maximum.

Return ONLY this JSON:
{
  "blocks": [
    {
      "type": "mermaid_graph",
      "content": "graph TD\\n  A[Concept] --> B[Sub]\\n  B --> C[Detail]",
      "metadata": { "chunk_size": "medium", "visual_density": "medium", "audio_enabled": false, "gamification": "low", "complexity": 0.4 }
    }
  ]
}`;

  const userPrompt = `${buildConceptContext(concept)}

SOURCE TEXT:
${sourceText}

Generate a Mermaid graph. Raw Mermaid code only. No explanation.`;

  return generateBlocks(systemPrompt, userPrompt, 400);
}

function validateExpectedOutput(blocks, conceptName) {
  const presentTypes = new Set(blocks.map(b => b.type));
  const missing = ALL_EXPECTED_TYPES.filter(t => !presentTypes.has(t));
  if (missing.length > 0) {
    console.warn(`⚠️ [${conceptName}] Missing block types: ${missing.join(', ')}`);
  } else {
    console.log(`✅ [${conceptName}] All 13 block types present`);
  }
  ALL_EXPECTED_TYPES.forEach(t => {
    const count = blocks.filter(b => b.type === t).length;
    if (count > 0) {
      console.log(`   ✓ ${t} (${count})`);
    } else {
      console.log(`   ✗ ${t} (MISSING)`);
    }
  });
}

async function processOneConcept(concept, sourceText, index, total) {
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📘 Processing Concept ${index + 1}/${total}: ${concept.concept}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  const [structureRaw, engagementRaw, multimodalRaw, graphRaw] = await Promise.all([
    runStructureEngine(concept, sourceText).then(r => { console.log(`   ✅ Worker A (Structure Engine) Complete`); return r; }),
    runEngagementEngine(concept, sourceText).then(r => { console.log(`   ✅ Worker B (Engagement Engine) Complete`); return r; }),
    runMultimodalEngine(concept, sourceText).then(r => { console.log(`   ✅ Worker C (Multimodal Engine) Complete`); return r; }),
    runKnowledgeVisualizationEngine(concept, sourceText).then(r => { console.log(`   ✅ Worker D (Knowledge Visualization Engine) Complete`); return r; })
  ]);

  const structureBlocks = sanitizeBlocks(structureRaw);
  const engagementBlocks = sanitizeBlocks(engagementRaw);
  const multimodalBlocks = sanitizeBlocks(multimodalRaw);
  const graphBlocks = sanitizeBlocks(graphRaw);

  const merged = [
    ...structureBlocks,
    ...engagementBlocks,
    ...multimodalBlocks,
    ...graphBlocks
  ];

  const timestamp = Date.now();
  const learningObjectives = Array.isArray(concept.learning_objectives) ? concept.learning_objectives : [];

  merged.forEach((block, idx) => {
    block.block_id = `blk_${concept.concept_id}_${timestamp}_${idx}`;
    block.concept_id = concept.concept_id;
    block.learning_objectives = learningObjectives;
    const misconceptions = Array.isArray(concept.misconceptions)
    ? concept.misconceptions
    : [];

    block.misconceptions = misconceptions;
  });

  console.log(`   📦 Generated ${merged.length} blocks for ${concept.concept}`);
  validateExpectedOutput(merged, concept.concept);

  return merged;
}

// POST /generate-blocks — Generate and save learning blocks
router.post('/generate-blocks', async (req, res) => {
  try {
    const { concepts, sourceText } = req.body;

    if (!concepts || !Array.isArray(concepts) || concepts.length === 0) {
      return res.status(400).json({ error: 'concepts array is required and must not be empty.' });
    }
    if (!sourceText || sourceText.trim().length === 0) {
      return res.status(400).json({ error: 'sourceText is required and must not be empty.' });
    }

    const source_document = concepts[0]?.source_document || 'Unknown Document';
    const subject = concepts[0]?.subject || 'General';
    const grade = concepts[0]?.grade || 'All';

    const limitedConcepts = concepts.slice(0, MAX_CONCEPTS);
    const truncatedSource = sourceText.substring(0, MAX_SOURCE_TEXT);
    console.log(`\n🚀 Generating learning blocks for ${limitedConcepts.length} concepts (capped from ${concepts.length})...`);
    console.log(`📏 Source text truncated to ${truncatedSource.length} chars`);

    const conceptIds = limitedConcepts.map(c => c.concept_id);
    const allBlocks = [];
    const errors = [];

    for (let i = 0; i < limitedConcepts.length; i++) {
      const concept = limitedConcepts[i];
      try {
        const blocks = await processOneConcept(concept, truncatedSource, i, limitedConcepts.length);
        blocks.forEach(b => {
          b.source_document = source_document;
          b.subject = subject;
          b.grade = grade;
        });
        allBlocks.push(...blocks);
      } catch (conceptErr) {
        console.error(`❌ Failed concept ${concept.concept_id}:`, conceptErr.message);
        errors.push({ concept_id: concept.concept_id, error: conceptErr.message });
      }
      if (i < limitedConcepts.length - 1) {
        console.log(`⏳ Cooldown ${CONCEPT_COOLDOWN_MS}ms before next concept...`);
        await sleep(CONCEPT_COOLDOWN_MS);
      }
    }

    let savedBlocks = 0;
    if (allBlocks.length > 0) {
      await LearningBlock.deleteMany({ concept_id: { $in: conceptIds } });
      await LearningBlock.insertMany(allBlocks);
      savedBlocks = allBlocks.length;
      console.log(`\n💾 Saved ${savedBlocks} learning blocks to database.`);
    }

    console.log(`\n🏁 PIPELINE COMPLETE: ${savedBlocks} blocks saved across ${limitedConcepts.length} concepts (${errors.length} failed)\n`);

    res.json({
      success: true,
      totalConcepts: limitedConcepts.length,
      totalBlocks: allBlocks.length,
      savedBlocks: savedBlocks,
      failedConcepts: errors.length,
      errors: errors.length > 0 ? errors : undefined,
      data: allBlocks
    });

  } catch (error) {
    console.error('❌ Block Generation Error:', error);
    res.status(500).json({ error: 'Failed to generate learning blocks.' });
  }
});

// POST /preview-blocks — Generate blocks without saving (frontend testing proxy)
router.post('/preview-blocks', async (req, res) => {
  try {
    const { concepts, sourceText } = req.body;

    if (!concepts || !Array.isArray(concepts) || concepts.length === 0) {
      return res.status(400).json({ error: 'concepts array is required and must not be empty.' });
    }
    if (!sourceText || sourceText.trim().length === 0) {
      return res.status(400).json({ error: 'sourceText is required and must not be empty.' });
    }

    const limitedConcepts = concepts.slice(0, MAX_CONCEPTS);
    const truncatedSource = sourceText.substring(0, MAX_SOURCE_TEXT);
    console.log(`\n👁️ Preview mode: generating blocks for ${limitedConcepts.length} concepts...`);

    const results = [];

    for (let i = 0; i < limitedConcepts.length; i++) {
      const concept = limitedConcepts[i];
      try {
        const blocks = await processOneConcept(concept, truncatedSource, i, limitedConcepts.length);
        results.push({
          success: true,
          concept: concept.concept,
          concept_id: concept.concept_id,
          blocks: blocks
        });
      } catch (conceptErr) {
        console.error(`❌ Preview failed for ${concept.concept_id}:`, conceptErr.message);
        results.push({
          success: false,
          concept: concept.concept,
          concept_id: concept.concept_id,
          error: conceptErr.message,
          blocks: []
        });
      }
      if (i < limitedConcepts.length - 1) {
        await sleep(CONCEPT_COOLDOWN_MS);
      }
    }

    res.json({
      success: true,
      results: results
    });

  } catch (error) {
    console.error('❌ Preview Error:', error);
    res.status(500).json({ error: 'Failed to preview learning blocks.' });
  }
});

module.exports = router;
