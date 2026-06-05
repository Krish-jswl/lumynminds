// Tracked by Git
const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const pdfParse = require('pdf-parse-new');
const Groq = require('groq-sdk');
const KnowledgeGraph = require('../models/KnowledgeGraph');

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
    });
    
    console.log(`💾 Saving ${blocks.length} blocks to database...`);
    await KnowledgeGraph.insertMany(blocks);

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
