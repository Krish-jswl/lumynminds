import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen, Zap, CheckCircle2, Trophy, Star, Flame, ChevronLeft, ChevronRight,
  Lightbulb, HelpCircle, Brain, Headphones, Eye, Sparkles, Coffee, Loader2,
  Volume2, VolumeX, Award, Target, BarChart3, AlertTriangle, ChevronDown, ChevronUp,
  BookMarked, FlaskConical, Calculator, Microscope, FileText, Play, Pause, Square, Settings, LayoutDashboard, UserCircle, School
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const BLOCK_STYLES = {
  simplified_text: { border: 'border-l-slate-400', bg: 'bg-white', icon: BookOpen, iconColor: 'text-slate-600', label: 'Core Content' },
  summary: { border: 'border-l-slate-500', bg: 'bg-slate-50', icon: BookMarked, iconColor: 'text-slate-700', label: 'Summary' },
  analogy: { border: 'border-l-purple-500', bg: 'bg-purple-50', icon: Lightbulb, iconColor: 'text-purple-600', label: 'Analogy' },
  worked_example: { border: 'border-l-green-500', bg: 'bg-green-50', icon: Target, iconColor: 'text-green-600', label: 'Worked Example' },
  checkpoint: { border: 'border-l-blue-500', bg: 'bg-blue-50', icon: CheckCircle2, iconColor: 'text-blue-600', label: 'Checkpoint' },
  quiz: { border: 'border-l-amber-500', bg: 'bg-amber-50', icon: HelpCircle, iconColor: 'text-amber-600', label: 'Quiz' },
  reflection: { border: 'border-l-rose-500', bg: 'bg-rose-50', icon: Brain, iconColor: 'text-rose-600', label: 'Reflection' },
  challenge: { border: 'border-l-red-500', bg: 'bg-red-50', icon: Zap, iconColor: 'text-red-600', label: 'Challenge' },
  visual_prompt: { border: 'border-l-cyan-500', bg: 'bg-cyan-50', icon: Eye, iconColor: 'text-cyan-600', label: 'Visual' },
  audio_script: { border: 'border-l-orange-500', bg: 'bg-orange-50', icon: Headphones, iconColor: 'text-orange-600', label: 'Audio' },
  diagram_description: { border: 'border-l-cyan-500', bg: 'bg-cyan-50', icon: Eye, iconColor: 'text-cyan-600', label: 'Diagram' },
  animation_cue: { border: 'border-l-indigo-500', bg: 'bg-indigo-50', icon: Sparkles, iconColor: 'text-indigo-600', label: 'Focus Cue' },
  mermaid_graph: { border: 'border-l-teal-500', bg: 'bg-teal-50', icon: BarChart3, iconColor: 'text-teal-600', label: 'Graph' },
};

function MermaidRenderer({ code }) {
  const containerRef = useRef(null);
  const [svg, setSvg] = useState('');
  const [error, setError] = useState(false);
  const rendered = useRef(false);

  useEffect(() => {
    if (!code || !code.trim() || rendered.current) return;
    rendered.current = true;
    let cancelled = false;

    const doRender = async () => {
      try {
        const mod = await import('mermaid');
        const mermaid = mod.default || mod;
        mermaid.initialize({ startOnLoad: false, theme: 'neutral', securityLevel: 'loose' });
        const id = 'mm-' + Math.random().toString(36).substr(2, 9);
        const { svg: rendered } = await mermaid.render(id, code);
        if (!cancelled) setSvg(rendered);
      } catch (e) {
        console.error('Mermaid render error:', e);
        if (!cancelled) setError(true);
      }
    };
    doRender();
    return () => { cancelled = true; };
  }, [code]);

  if (error) {
    return <pre className="bg-slate-100 text-slate-600 p-4 rounded-xl text-xs overflow-x-auto font-mono border border-slate-200">{code}</pre>;
  }
  if (!svg) {
    return <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 text-teal-500 animate-spin" /></div>;
  }
  return <div ref={containerRef} className="overflow-x-auto flex justify-center py-4" dangerouslySetInnerHTML={{ __html: svg }} />;
}

function AudioBlock({ content }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);
  const startRef = useRef(0);
  const durationRef = useRef(0);

  const handlePlay = () => {
    if (playing) {
      window.speechSynthesis.pause();
      setPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setPlaying(true);
      startRef.current = Date.now() - (durationRef.current * progress / 100);
      intervalRef.current = setInterval(() => {
        const pct = Math.min(100, ((Date.now() - startRef.current) / durationRef.current) * 100);
        setProgress(pct);
      }, 200);
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(content);
    utter.rate = 0.9;
    const words = content.split(/\s+/).length;
    durationRef.current = (words / 2.5) * 1000;
    startRef.current = Date.now();
    utter.onend = () => { setPlaying(false); setProgress(100); if (intervalRef.current) clearInterval(intervalRef.current); };
    utter.onerror = () => { setPlaying(false); if (intervalRef.current) clearInterval(intervalRef.current); };
    window.speechSynthesis.speak(utter);
    setPlaying(true);
    intervalRef.current = setInterval(() => {
      const pct = Math.min(100, ((Date.now() - startRef.current) / durationRef.current) * 100);
      setProgress(pct);
    }, 200);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setPlaying(false);
    setProgress(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => { return () => { window.speechSynthesis.cancel(); if (intervalRef.current) clearInterval(intervalRef.current); }; }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button data-interactive="true" onClick={handlePlay}
          className={`p-2.5 rounded-full transition-all shadow-sm ${playing ? 'bg-orange-600 text-white' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'}`}>
          {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <button data-interactive="true" onClick={handleStop}
          className="p-2.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all">
          <Square className="w-3.5 h-3.5" />
        </button>
        <div className="flex-1 bg-orange-100 rounded-full h-2 overflow-hidden">
          <div className="bg-orange-500 h-2 rounded-full transition-all duration-200" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-xs text-slate-400 min-w-[36px] text-right">{Math.round(progress)}%</span>
      </div>
      <p className="text-sm text-slate-600 leading-relaxed">{content}</p>
    </div>
  );
}

function QuizBlock({ content, onCorrect, gamification }) {
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [parsedQuiz, setParsedQuiz] = useState(null);

  useEffect(() => {
    try {
      const lines = content.split('\n').filter(l => l.trim());
      const questionLine = lines[0] || 'Question?';
      const options = [];
      let correctIdx = 0;
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        const isCorrect = line.startsWith('*') || line.startsWith('✓');
        const cleanLine = line.replace(/^[\*✓\-\d\.\)\]\s]+/, '').trim();
        if (cleanLine) {
          if (isCorrect) correctIdx = options.length;
          options.push(cleanLine);
        }
      }
      if (options.length < 2) { options.push('True', 'False'); correctIdx = 0; }
      setParsedQuiz({ question: questionLine, options, correct: correctIdx });
    } catch {
      setParsedQuiz({ question: content, options: ['True', 'False'], correct: 0 });
    }
  }, [content]);

  if (!parsedQuiz) return null;

  const handleSubmit = () => { setSubmitted(true); if (selected === parsedQuiz.correct && onCorrect) onCorrect(); };

  return (
    <div className="space-y-3">
      <p className="font-semibold text-slate-800 text-sm">{parsedQuiz.question}</p>
      <div className="space-y-2">
        {parsedQuiz.options.map((opt, i) => (
          <button key={i} data-interactive="true" onClick={() => !submitted && setSelected(i)}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
              submitted ? i === parsedQuiz.correct ? 'bg-green-100 border-green-400 text-green-800' : i === selected ? 'bg-red-100 border-red-400 text-red-800' : 'bg-slate-50 border-slate-200 text-slate-500'
              : selected === i ? 'bg-blue-100 border-blue-400 text-blue-800' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}>{opt}</button>
        ))}
      </div>
      {!submitted && (
        <button data-interactive="true" onClick={handleSubmit} disabled={selected === null}
          className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${selected !== null ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
          Submit
        </button>
      )}
      {submitted && gamification && selected === parsedQuiz.correct && (
        <div className="text-amber-600 font-bold text-sm animate-bounce mt-2">+10 XP ⭐</div>
      )}
    </div>
  );
}

function BreakReminder() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6 text-center my-6 relative shadow-sm">
      <button data-interactive="true" onClick={() => setDismissed(true)} className="absolute top-3 right-4 text-emerald-400 hover:text-emerald-600 text-xl font-bold">×</button>
      <Coffee className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
      <h3 className="text-lg font-bold text-emerald-800 mb-1">Take a Quick Break</h3>
      <p className="text-sm text-emerald-600">You've been working hard. Stretch, breathe, and come back refreshed.</p>
    </div>
  );
}

function BlockRenderer({ block, rules, onQuizCorrect }) {
  const style = BLOCK_STYLES[block.type] || BLOCK_STYLES.simplified_text;
  const Icon = style.icon;
  const isMermaid = block.type === 'mermaid_graph';
  const isAudio = block.type === 'audio_script';
  const isQuiz = block.type === 'quiz' || block.type === 'challenge';
  const isReflection = block.type === 'reflection';
  const isCheckpoint = block.type === 'checkpoint';
  const fontSize = rules.font_size === 'large' ? 'text-base leading-relaxed' : 'text-sm leading-relaxed';

  return (
    <div className={`border-l-4 ${style.border} ${style.bg} rounded-r-xl p-5 transition-all duration-300 hover:shadow-md mb-4`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-4 h-4 ${style.iconColor}`} />
        <span className={`text-xs font-bold uppercase tracking-wider ${style.iconColor}`}>{style.label}</span>
      </div>
      {isMermaid ? (
        <MermaidRenderer code={block.content} />
      ) : isAudio ? (
        <AudioBlock content={block.content} />
      ) : isQuiz ? (
        <QuizBlock content={block.content} onCorrect={onQuizCorrect} gamification={rules.enable_gamification} />
      ) : isCheckpoint ? (
        <div className="space-y-2">
          <div className={`${fontSize} text-slate-700 whitespace-pre-wrap`}>{block.content}</div>
          <div className="flex items-center gap-2 text-blue-600 bg-blue-100 px-3 py-1.5 rounded-lg w-fit mt-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">Review before continuing</span>
          </div>
        </div>
      ) : isReflection ? (
        <div className="space-y-2">
          <div className={`${fontSize} text-slate-700 whitespace-pre-wrap italic`}>{block.content}</div>
          <div className="flex items-center gap-2 text-rose-600 bg-rose-100 px-3 py-1.5 rounded-lg w-fit mt-2">
            <Brain className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">Take a moment to think</span>
          </div>
        </div>
      ) : (
        <div className={`${fontSize} text-slate-700 whitespace-pre-wrap`}>{block.content}</div>
      )}
    </div>
  );
}

function CnvDebugPanel({ rawCnv }) {
  const [open, setOpen] = useState(false);
  const cnvLabels = {
    attention_support: 'Attention',
    reading_support: 'Reading',
    sensory_support: 'Sensory',
    structure_support: 'Structure',
    working_memory_support: 'Memory',
    audio_support: 'Audio',
    visual_support: 'Visual',
    gamification_support: 'Gamification',
    chunking_support: 'Chunking',
    fatigue_sensitivity: 'Fatigue',
    abstraction_support: 'Abstraction',
    pace_support: 'Pace'
  };

  return (
    <div className="mt-8">
      <button data-interactive="true" onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all border border-slate-200">
        <Settings className="w-3.5 h-3.5" />
        {open ? 'Hide' : 'Show'} Adaptation Scorecard
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      {open && (
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 border-b pb-2">Cognitive Needs Profile</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Object.entries(rawCnv).map(([key, obj]) => {
              const isActive = obj.value > 0.6 && obj.confidence > 0.3;
              return (
                <div key={key} className={`rounded-xl p-3 border ${isActive ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-100'}`}>
                  <p className={`text-xs font-bold mb-2 ${isActive ? 'text-blue-800' : 'text-slate-600'}`}>{cnvLabels[key] || key}</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500">Value</span>
                      <span className="font-mono font-bold text-slate-700">{(obj.value || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex-1 bg-slate-200 rounded-full h-1.5 w-full">
                      <div className={`h-1.5 rounded-full ${obj.value > 0.6 ? 'bg-rose-500' : obj.value > 0.4 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${(obj.value || 0) * 100}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500">Confidence</span>
                      <span className="font-mono font-bold text-slate-700">{(obj.confidence || 0).toFixed(2)} {obj.confidence > 0.3 ? '✓' : '○'}</span>
                    </div>
                    {isActive && (
                      <div className="mt-2 text-[9px] uppercase font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded text-center">
                        Active
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function filterBlocksForProfile(conceptBlocks, rules, activeProfiles) {
  if (!conceptBlocks || conceptBlocks.length === 0) return [];
  
  const byType = {};
  conceptBlocks.forEach(b => {
    if (!byType[b.type]) byType[b.type] = [];
    byType[b.type].push(b);
  });

  const result = [];
  const added = new Set();
  const injectedReasons = [];

  const addBlocks = (type, reason) => {
    if (byType[type] && byType[type].length > 0) {
      if (!added.has(type)) {
        byType[type].forEach(b => {
          result.push({ ...b, injectedReason: reason });
        });
        added.add(type);
      }
    }
  };

  // 1. Non-destructive scaffolding: ALWAYS include Core Content
  if (rules.show_summary_first) {
    addBlocks('summary', 'Reading Support Activated: Show summary first');
    addBlocks('simplified_text', 'Core Curriculum');
  } else {
    addBlocks('simplified_text', 'Core Curriculum');
    addBlocks('summary', 'General Support');
  }

  // 2. Modality injections based on rules
  if (rules.enable_audio) addBlocks('audio_script', 'Audio Modality Preferred');
  if (rules.require_visuals) {
    addBlocks('visual_prompt', 'Visual Support High');
    addBlocks('diagram_description', 'Visual Support High');
    addBlocks('mermaid_graph', 'Visual Support High');
  }

  // 3. Cognitive scaffolding based on active profiles
  if (activeProfiles.includes('abstraction')) {
    addBlocks('analogy', 'Abstraction Support High: Concrete analogies required');
    addBlocks('worked_example', 'Abstraction Support High');
    addBlocks('mermaid_graph', 'Abstraction Support High');
  }

  if (activeProfiles.includes('working_memory')) {
    addBlocks('worked_example', 'Working Memory High: Provide concrete examples');
    addBlocks('checkpoint', 'Working Memory High: Break information down');
    addBlocks('reflection', 'Working Memory High');
  }

  if (activeProfiles.includes('structure')) {
    addBlocks('worked_example', 'Structure Support High: Step-by-step guidance');
    addBlocks('checkpoint', 'Structure Support High');
  }

  if (activeProfiles.includes('attention')) {
    addBlocks('checkpoint', 'Attention Support High: Frequent interaction required');
    addBlocks('challenge', 'Attention Support High: Keep engagement high');
    if (!rules.reduce_visual_noise) {
      addBlocks('animation_cue', 'Attention Support High: Visual hooks');
    }
  }

  // 4. Default fallbacks if none of the specific active profiles captured them, but gamification/etc is on
  if (rules.enable_gamification && !added.has('challenge')) addBlocks('challenge', 'Gamification Enabled');
  if (!added.has('quiz')) addBlocks('quiz', 'Knowledge Check');
  if (!added.has('reflection') && !activeProfiles.includes('working_memory')) addBlocks('reflection', 'Metacognition');

  return result;
}

export function StudentHomeDashboard({ onOpenLesson, studentId, currentUser }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ count: 0, score: 85 });

  useEffect(() => {
    if (!studentId) return;
    const load = async () => {
      try {
        const [blocksRes, statusRes] = await Promise.all([
          fetch(`${API_BASE}/adaptation/blocks/${studentId}`),
          fetch(`${API_BASE}/adaptation/student-status/${studentId}`)
        ]);

        if (statusRes.ok) {
          const sData = await statusRes.json();
          setStats(prev => ({ ...prev, count: sData.assessmentCount || 0 }));
        }

        if (blocksRes.ok) {
          const data = await blocksRes.json();
          const blocks = data.blocks || [];
          const docMap = {};

          blocks.forEach(b => {
            // Group by source_document
            const docName = b.source_document || 'General Concepts';
            const subject = b.subject || 'Uncategorized';
            if (!docMap[docName]) {
              docMap[docName] = {
                id: docName,
                name: docName,
                subject: subject,
                conceptCount: new Set(),
                blockCount: 0
              };
            }
            docMap[docName].conceptCount.add(b.concept_id);
            docMap[docName].blockCount++;
          });

          setDocuments(Object.values(docMap).map(d => ({
            ...d,
            conceptCount: d.conceptCount.size
          })));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [studentId]);

  const subjectsMap = {};
  documents.forEach(d => {
    if (!subjectsMap[d.subject]) subjectsMap[d.subject] = [];
    subjectsMap[d.subject].push(d);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                <UserCircle className="w-10 h-10 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">{currentUser?.name || 'Student Profile'}</h1>
                <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 font-medium">
                  <span className="flex items-center gap-1"><School className="w-4 h-4" /> {currentUser?.institute || 'LumynMinds Academy'}</span>
                  <span>•</span>
                  <span>Grade {currentUser?.grade || 'N/A'}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 min-w-[120px]">
                <p className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-wider">Assessments</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-800">{stats.count}</span>
                  <span className="text-xs text-slate-400">completed</span>
                </div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 min-w-[120px]">
                <p className="text-xs text-blue-600 font-semibold mb-1 uppercase tracking-wider">Profile Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg font-bold text-blue-800">Calibrated</span>
                  <CheckCircle2 className="w-5 h-5 text-blue-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-slate-400" />
          Your Learning Materials
        </h2>
        
        {Object.keys(subjectsMap).length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700 mb-2">No documents yet</h3>
            <p className="text-slate-500 text-sm">Your teacher hasn't assigned any materials to your grade level.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(subjectsMap).map(([subject, docs]) => (
              <div key={subject} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 px-5 py-4 border-b border-slate-200">
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">{subject}</h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {docs.map(doc => (
                    <button key={doc.id} onClick={() => onOpenLesson(doc.id)}
                      className="w-full text-left px-5 py-4 hover:bg-blue-50 transition-colors flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">{doc.name}</h4>
                          <p className="text-xs text-slate-500 mt-1">{doc.conceptCount} Concepts • {doc.blockCount} Blocks</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function StudentDashboard({ conceptFilter, studentId }) {
  const [rules, setRules] = useState({});
  const [reasons, setReasons] = useState([]);
  const [rawCnv, setRawCnv] = useState({});
  const [activeProfiles, setActiveProfiles] = useState([]);
  
  const [documentName, setDocumentName] = useState("");
  const [concepts, setConcepts] = useState([]);
  const [currentConceptIdx, setCurrentConceptIdx] = useState(0);
  const [completedConcepts, setCompletedConcepts] = useState(new Set());
  
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!studentId || !conceptFilter) return; // conceptFilter is now document name
    const load = async () => {
      try {
        const [rulesRes, blocksRes] = await Promise.all([
          fetch(`${API_BASE}/adaptation/rules/${studentId}`),
          fetch(`${API_BASE}/adaptation/blocks/${studentId}`)
        ]);

        if (rulesRes.ok) {
          const rulesData = await rulesRes.json();
          setRules(rulesData.rules || {});
          setReasons(rulesData.adaptation_reasons || []);
          setRawCnv(rulesData.raw_cnv || {});
          setActiveProfiles(rulesData.active_profiles || []);
        }

        if (blocksRes.ok) {
          const blocksData = await blocksRes.json();
          const allBlocks = blocksData.blocks || [];
          
          // Filter blocks by the selected document
          const docBlocks = allBlocks.filter(b => b.source_document === conceptFilter);
          setDocumentName(conceptFilter);

          const conceptMap = {};
          docBlocks.forEach(b => {
            if (!conceptMap[b.concept_id]) conceptMap[b.concept_id] = { id: b.concept_id, blocks: [] };
            conceptMap[b.concept_id].blocks.push(b);
          });
          
          const conceptList = Object.values(conceptMap);
          setConcepts(conceptList);
          setCurrentConceptIdx(0);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load learning data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [studentId, conceptFilter]);

  const handleQuizCorrect = () => { setXp(x => x + 10); setStreak(s => s + 1); };

  const markComplete = () => {
    const cid = concepts[currentConceptIdx]?.id;
    if (cid && !completedConcepts.has(cid)) {
      setCompletedConcepts(prev => new Set([...prev, cid]));
      if (rules.enable_gamification) setXp(x => x + 10);
    }
  };

  const goNext = () => { markComplete(); if (currentConceptIdx < concepts.length - 1) setCurrentConceptIdx(i => i + 1); };
  const goPrev = () => { if (currentConceptIdx > 0) setCurrentConceptIdx(i => i - 1); };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <p className="text-slate-700 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  const isLowStim = rules.theme === 'low_stimulation' || rules.reduce_visual_noise;
  const bgClass = isLowStim ? 'bg-stone-50' : 'bg-slate-50';
  const cardBg = isLowStim ? 'bg-stone-50 border-stone-200' : 'bg-white border-slate-200';
  const headingColor = isLowStim ? 'text-stone-800' : 'text-slate-800';

  const currentConcept = concepts[currentConceptIdx];
  const filteredBlocks = currentConcept ? filterBlocksForProfile(currentConcept.blocks, rules, activeProfiles) : [];
  const conceptLabel = currentConcept?.id?.replace(/_/g, ' ').replace(/^c\s*\d+\s*/i, '') || '';
  const showBreak = rules.enable_break_reminders && currentConceptIdx > 0 && currentConceptIdx % 3 === 0;
  const progressPct = concepts.length > 0 ? ((completedConcepts.size) / concepts.length) * 100 : 0;

  return (
    <div className={`min-h-screen pb-20 ${bgClass}`}>
      <div className={`sticky top-12 z-40 ${isLowStim ? 'bg-stone-100/95' : 'bg-white/95'} backdrop-blur border-b ${isLowStim ? 'border-stone-200' : 'border-slate-200'} px-6 py-3`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className={`text-lg font-bold ${headingColor} truncate max-w-[300px] md:max-w-md`}>{documentName}</h1>
            <p className="text-xs text-slate-500">Concept {currentConceptIdx + 1} of {concepts.length}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1 mr-4">
              <div className={`w-32 ${isLowStim ? 'bg-stone-200' : 'bg-slate-200'} rounded-full h-2`}>
                <div className="bg-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
              </div>
              <span className="text-[10px] text-slate-400 ml-1">{Math.round(progressPct)}%</span>
            </div>
            {rules.enable_gamification && (
              <>
                <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                  <Star className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-xs font-bold text-amber-700">{xp}</span>
                </div>
                {streak > 0 && (
                  <div className="flex items-center gap-1 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200">
                    <Flame className="w-3.5 h-3.5 text-orange-500" />
                    <span className="text-xs font-bold text-orange-700">{streak}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          
          <div className="xl:col-span-3 space-y-6">
            {showBreak && <BreakReminder />}

            {currentConcept && (
              <div className={`${cardBg} border rounded-2xl p-6 md:p-8 shadow-sm`}>
                <div className="flex items-center justify-between mb-8 border-b pb-4">
                  <h2 className={`text-2xl font-bold ${headingColor} capitalize`}>{conceptLabel}</h2>
                  {completedConcepts.has(currentConcept.id) && (
                    <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 border border-green-200">
                      <CheckCircle2 className="w-4 h-4" /> Completed
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {filteredBlocks.map((block, i) => (
                    <div key={block.block_id || `${block.type}-${i}`}>
                      {block.injectedReason && (
                        <div className="flex items-center gap-2 mb-1.5 ml-2">
                          <Zap className="w-3 h-3 text-amber-500" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{block.injectedReason}</span>
                        </div>
                      )}
                      <BlockRenderer block={block} rules={rules} onQuizCorrect={handleQuizCorrect} />
                    </div>
                  ))}
                  {filteredBlocks.length === 0 && (
                    <p className="text-sm text-slate-400 italic py-8 text-center">No learning blocks available for this concept.</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4">
              <button data-interactive="true" onClick={goPrev} disabled={currentConceptIdx === 0}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  currentConceptIdx === 0 ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}>
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              {!completedConcepts.has(currentConcept?.id) && (
                <button data-interactive="true" onClick={markComplete}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-green-600 text-white hover:bg-green-700 transition-all shadow-sm">
                  <CheckCircle2 className="w-4 h-4" /> Mark Complete {rules.enable_gamification && '(+10 XP)'}
                </button>
              )}
              <button data-interactive="true" onClick={goNext} disabled={currentConceptIdx === concepts.length - 1}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  currentConceptIdx === concepts.length - 1 ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                }`}>
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <CnvDebugPanel rawCnv={rawCnv} />
          </div>

          <div className="xl:col-span-1 hidden xl:block">
            <div className="sticky top-32 space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 border-b pb-2">Your Active Profile</h3>
                
                <div className="space-y-4">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Activated Modes</p>
                    <div className="flex flex-wrap gap-1.5">
                      {activeProfiles.length > 0 ? activeProfiles.map(p => (
                        <span key={p} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold capitalize border border-blue-200">
                          {p.replace('_', ' ')}
                        </span>
                      )) : <span className="text-xs text-slate-500 font-medium">Standard</span>}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Block Injection Rules</p>
                    <ul className="space-y-2">
                      {reasons.map((r, i) => (
                        <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="leading-snug">{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
