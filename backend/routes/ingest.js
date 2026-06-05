// Tracked by Git
const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const pdfParse = require('pdf-parse'); 
const Groq = require('groq-sdk');
const LearningBlock = require('../models/LearningBlock');

// Initialize Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post('/upload', upload.single('curriculum'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded.' });
    }

    console.log("📄 File Received. Extracting text...");
    let rawText = "";

    try {
      const parseFunc = typeof pdfParse === 'function' ? pdfParse : pdfParse.default;
      const pdfData = await parseFunc(req.file.buffer);
      rawText = pdfData.text;
    } catch (parseError) {
      console.log("⚠️ Not a valid PDF format. Falling back to raw text buffer...");
      rawText = req.file.buffer.toString('utf-8');
    }

    const textToAnalyze = rawText.substring(0, 8000);
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
      response_format: { type: "json_object" }, // Force strict JSON output
    });

    const aiResponse = completion.choices[0].message.content;
    const parsedData = JSON.parse(aiResponse);
    const blocks = parsedData.blocks; // Extract the array from the object

    blocks.forEach((block, index) => {
      block.concept_id = `concept_${Date.now()}_${index}`;
    });
    
    console.log(`💾 Saving ${blocks.length} blocks to database...`);
    await LearningBlock.insertMany(blocks);

    res.json({ 
      message: 'Knowledge Graph generated and saved successfully!', 
      blocksProcessed: blocks.length,
      data: blocks 
    });

  } catch (error) {
    console.error('❌ Ingestion Error:', error);
    res.status(500).json({ error: 'Failed to process the PDF or generate AI content.' });
  }
});

module.exports = router;
