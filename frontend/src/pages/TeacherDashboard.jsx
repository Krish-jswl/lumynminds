// Tracked by Git
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  BrainCircuit, UploadCloud, FileText, Loader2, AlertCircle,
  ChevronDown, ChevronRight, CheckCircle2, XCircle, ArrowLeft
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api/ingest';

const BLOCK_TYPE_ORDER = [
  'simplified_text', 'summary', 'analogy', 'worked_example',
  'checkpoint', 'quiz', 'reflection', 'challenge',
  'visual_prompt', 'audio_script', 'diagram_description', 'animation_cue',
  'mermaid_graph'
];

const WORKER_MAP = {
  'Structure Engine': ['simplified_text', 'summary', 'analogy', 'worked_example'],
  'Engagement Engine': ['checkpoint', 'quiz', 'reflection', 'challenge'],
  'Multimodal Engine': ['visual_prompt', 'audio_script', 'diagram_description', 'animation_cue'],
  'Knowledge Visualization Engine': ['mermaid_graph']
};

const GRADE_OPTIONS = [
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
  'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
  'Grade 11', 'Grade 12', 'Undergraduate', 'Graduate'
];

function formatBlockType(type) {
  return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function MetricCard({ label, value, color }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
  };
  return (
    <div className={`rounded-xl border p-4 ${colorMap[color] || colorMap.blue}`}>
      <div className="text-3xl font-extrabold">{value}</div>
      <div className="text-sm font-medium mt-1 opacity-80">{label}</div>
    </div>
  );
}

function ConceptCard({ concept }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <h4 className="text-lg font-bold text-slate-800 mb-3">{concept.concept}</h4>
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="text-center bg-slate-50 rounded-lg p-2">
          <div className="text-xs text-slate-500 font-medium">Difficulty</div>
          <div className="text-lg font-bold text-slate-700">{concept.difficulty?.toFixed(2)}</div>
        </div>
        <div className="text-center bg-slate-50 rounded-lg p-2">
          <div className="text-xs text-slate-500 font-medium">Cog. Load</div>
          <div className="text-lg font-bold text-slate-700">{concept.cognitive_load?.toFixed(2)}</div>
        </div>
        <div className="text-center bg-slate-50 rounded-lg p-2">
          <div className="text-xs text-slate-500 font-medium">Abstraction</div>
          <div className="text-lg font-bold text-slate-700">{concept.abstraction_level?.toFixed(2)}</div>
        </div>
      </div>
      {concept.learning_objectives && concept.learning_objectives.length > 0 && (
        <div>
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-1">Objectives</div>
          <ul className="list-disc list-inside text-sm text-slate-600 space-y-0.5">
            {concept.learning_objectives.map((obj, i) => <li key={i}>{obj}</li>)}
          </ul>
        </div>
      )}
      {concept.misconceptions && concept.misconceptions.length > 0 && (
        <div className="mt-2">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-1">Misconceptions</div>
          <ul className="list-disc list-inside text-sm text-red-500 space-y-0.5">
            {concept.misconceptions.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

function BlockCard({ block }) {
  const isMermaid = block.type === 'mermaid_graph';
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          {formatBlockType(block.type)}
        </span>
        {block.support_tags && block.support_tags.length > 0 && (
          <div className="flex gap-1 flex-wrap justify-end">
            {block.support_tags.map((tag, i) => (
              <span key={i} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{tag}</span>
            ))}
          </div>
        )}
      </div>
      {isMermaid ? (
        <pre className="bg-slate-900 text-green-400 p-4 rounded-lg text-sm font-mono overflow-x-auto whitespace-pre-wrap">{block.content}</pre>
      ) : (
        <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{block.content}</div>
      )}
      {block.metadata && (
        <div className="mt-3 flex gap-2 flex-wrap">
          <span className="text-xs bg-slate-50 text-slate-500 border border-slate-200 px-2 py-0.5 rounded">chunk: {block.metadata.chunk_size}</span>
          <span className="text-xs bg-slate-50 text-slate-500 border border-slate-200 px-2 py-0.5 rounded">visual: {block.metadata.visual_density}</span>
          <span className="text-xs bg-slate-50 text-slate-500 border border-slate-200 px-2 py-0.5 rounded">audio: {block.metadata.audio_enabled ? 'yes' : 'no'}</span>
          <span className="text-xs bg-slate-50 text-slate-500 border border-slate-200 px-2 py-0.5 rounded">gamification: {block.metadata.gamification}</span>
          <span className="text-xs bg-slate-50 text-slate-500 border border-slate-200 px-2 py-0.5 rounded">complexity: {block.metadata.complexity?.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
}

function WorkerVerificationPanel({ blocks }) {
  const presentTypes = new Set(blocks.map(b => b.type));
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <h3 className="text-xl font-bold text-slate-800 mb-5">Worker Verification Panel</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(WORKER_MAP).map(([engine, types]) => (
          <div key={engine} className="bg-slate-50 rounded-lg p-4">
            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">{engine}</h4>
            <div className="space-y-1.5">
              {types.map(type => (
                <div key={type} className="flex items-center gap-2">
                  {presentTypes.has(type) ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  )}
                  <span className={`text-sm font-medium ${presentTypes.has(type) ? 'text-slate-700' : 'text-red-500'}`}>
                    {formatBlockType(type)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CollapsibleJSON({ title, data }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
      >
        <span className="font-semibold text-slate-700">{title}</span>
        {open ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
      </button>
      {open && (
        <div className="bg-slate-900 p-4 overflow-x-auto max-h-96 overflow-y-auto">
          <pre className="text-green-400 text-xs font-mono whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [grade, setGrade] = useState('Grade 9');
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const [phase, setPhase] = useState('idle');
  const [phaseMsg, setPhaseMsg] = useState('');
  const [error, setError] = useState(null);

  const [graphConcepts, setGraphConcepts] = useState([]);
  const [sourceText, setSourceText] = useState('');
  const [learningBlocks, setLearningBlocks] = useState([]);
  const [blockGenResponse, setBlockGenResponse] = useState(null);

  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      setError(null);
    }
  };
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleFullPipeline = async () => {
    if (!file) return;
    setError(null);
    setGraphConcepts([]);
    setLearningBlocks([]);
    setBlockGenResponse(null);
    setSourceText('');

    try {
      // Phase 1: Upload PDF → Knowledge Graph
      setPhase('uploading');
      setPhaseMsg('Uploading PDF and generating Knowledge Graph via Groq...');

      const formData = new FormData();
      formData.append('curriculum', file);

      const uploadRes = await axios.post(`${API_BASE}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const concepts = uploadRes.data.data;
      // Fetch the actual text from the backend response, NOT from parsing the PDF blob!
      const extractedText = uploadRes.data.sourceText || "";
      
      setGraphConcepts(concepts);
      setSourceText(extractedText);

      // Phase 2: Generate Learning Blocks
      setPhase('generating');
      setPhaseMsg(`Knowledge Graph ready (${concepts.length} concepts). Generating Learning Blocks...`);

      const blockRes = await axios.post(`${API_BASE}/generate-blocks`, {
        concepts: concepts,
        sourceText: extractedText // Send the properly parsed text to the workers
      });

      setBlockGenResponse(blockRes.data);
      setLearningBlocks(blockRes.data.data || []);
      setPhase('done');
      setPhaseMsg('');

    } catch (err) {
      setPhase('error');
      setPhaseMsg('');
      setError(err.response?.data?.error || err.message || 'Pipeline failed.');
    }
  };

  const reset = () => {
    setFile(null);
    setPhase('idle');
    setPhaseMsg('');
    setError(null);
    setGraphConcepts([]);
    setSourceText('');
    setLearningBlocks([]);
    setBlockGenResponse(null);
  };

  // Compute metrics
  const totalBlocks = learningBlocks.length;
  const structureCount = learningBlocks.filter(b => ['simplified_text', 'summary', 'analogy', 'worked_example'].includes(b.type)).length;
  const engagementCount = learningBlocks.filter(b => ['checkpoint', 'quiz', 'reflection', 'challenge'].includes(b.type)).length;
  const multimodalCount = learningBlocks.filter(b => ['visual_prompt', 'audio_script', 'diagram_description', 'animation_cue'].includes(b.type)).length;
  const mermaidCount = learningBlocks.filter(b => b.type === 'mermaid_graph').length;

  // Group blocks by concept_id
  const blocksByConcept = {};
  learningBlocks.forEach(block => {
    if (!blocksByConcept[block.concept_id]) {
      blocksByConcept[block.concept_id] = [];
    }
    blocksByConcept[block.concept_id].push(block);
  });

  const isProcessing = phase === 'uploading' || phase === 'generating';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">

      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="text-slate-400 hover:text-slate-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="bg-blue-600 p-2 rounded-xl">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">LumynMinds Feature 4 Verification Dashboard</h1>
              <p className="text-xs text-slate-400 font-medium">Adaptive Learning Block Generator — Testing Interface</p>
            </div>
          </div>
          {phase === 'done' && (
            <button onClick={reset} className="px-4 py-2 bg-slate-100 text-slate-600 font-medium rounded-lg hover:bg-slate-200 transition-colors text-sm">
              Reset & Upload New
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* Upload Section */}
        {phase === 'idle' || phase === 'error' ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Upload Curriculum PDF</h2>

            <div className="flex gap-6 mb-6">
              <div className="flex-1">
                <label className="text-sm font-semibold text-slate-600 mb-2 block">Selected Grade</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-slate-700 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {GRADE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            <div
              className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400 bg-slate-50'
              }`}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            >
              <input
                type="file"
                accept="application/pdf"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileChange}
              />
              <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none">
                {file ? (
                  <>
                    <FileText className="w-12 h-12 text-blue-500" />
                    <p className="text-lg font-semibold text-slate-700">{file.name}</p>
                    <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-12 h-12 text-slate-400" />
                    <p className="text-lg font-medium text-slate-700">Drag & drop your curriculum PDF here</p>
                    <p className="text-sm text-slate-500">or click to browse files</p>
                  </>
                )}
              </div>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <button
              onClick={handleFullPipeline}
              disabled={!file}
              className={`w-full mt-6 py-3.5 px-4 rounded-xl text-white font-semibold flex items-center justify-center transition-all ${
                !file ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md'
              }`}
            >
              Run Full Pipeline (Knowledge Graph → Learning Blocks)
            </button>
          </div>
        ) : null}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="bg-white rounded-2xl border border-blue-200 p-8 shadow-sm">
            <div className="flex items-center gap-4">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  {phase === 'uploading' ? 'Phase 1: Knowledge Graph Generation' : 'Phase 2: Learning Block Generation'}
                </h3>
                <p className="text-sm text-slate-500 mt-1">{phaseMsg}</p>
              </div>
            </div>
            {graphConcepts.length > 0 && phase === 'generating' && (
              <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Phase 1 complete — {graphConcepts.length} concepts extracted. Now running 4 parallel workers per concept...
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {phase === 'done' && (
          <>
            {/* Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <MetricCard label="Concepts Generated" value={graphConcepts.length} color="blue" />
              <MetricCard label="Total Learning Blocks" value={totalBlocks} color="green" />
              <MetricCard label="Structure Blocks" value={structureCount} color="purple" />
              <MetricCard label="Engagement Blocks" value={engagementCount} color="amber" />
              <MetricCard label="Multimodal Blocks" value={multimodalCount} color="cyan" />
              <MetricCard label="Mermaid Graphs" value={mermaidCount} color="rose" />
            </div>

            {/* Section 1: Knowledge Graph Concepts */}
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
                Knowledge Graph Concepts
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {graphConcepts.map((concept, idx) => (
                  <ConceptCard key={concept.concept_id || idx} concept={concept} />
                ))}
              </div>
            </div>

            {/* Section 2: Generated Blocks by Concept */}
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-6 bg-green-600 rounded-full"></span>
                Feature 4 Generated Blocks
              </h2>
              {Object.entries(blocksByConcept).map(([conceptId, blocks]) => {
                const conceptObj = graphConcepts.find(c => c.concept_id === conceptId);
                const conceptName = conceptObj?.concept || conceptId;
                const sortedBlocks = [...blocks].sort((a, b) => {
                  return BLOCK_TYPE_ORDER.indexOf(a.type) - BLOCK_TYPE_ORDER.indexOf(b.type);
                });
                return (
                  <div key={conceptId} className="mb-8">
                    <div className="bg-blue-600 text-white px-5 py-3 rounded-t-xl">
                      <h3 className="text-lg font-bold">{conceptName}</h3>
                      <p className="text-xs text-blue-200 font-medium">{conceptId} — {blocks.length} blocks</p>
                    </div>
                    <div className="bg-slate-100 rounded-b-xl p-4 space-y-3">
                      {sortedBlocks.map((block, idx) => (
                        <BlockCard key={block.block_id || idx} block={block} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Section 3: Worker Verification */}
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-6 bg-purple-600 rounded-full"></span>
                Worker Verification
              </h2>
              <WorkerVerificationPanel blocks={learningBlocks} />
            </div>

            {/* Section 4: Raw JSON Debugger */}
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-6 bg-slate-600 rounded-full"></span>
                Raw JSON Debugger
              </h2>
              <div className="space-y-3">
                <CollapsibleJSON title="Knowledge Graph JSON" data={graphConcepts} />
                <CollapsibleJSON title="Learning Blocks JSON" data={learningBlocks} />
                {blockGenResponse && (
                  <CollapsibleJSON title="Block Generation API Response" data={blockGenResponse} />
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}