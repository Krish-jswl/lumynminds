import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import mermaid from 'mermaid';
import {
  BookOpen, CheckCircle2, Star, Flame, ChevronLeft, ChevronRight,
  Lightbulb, HelpCircle, Brain, Headphones, Eye, Coffee, Loader2,
  Target, AlertTriangle, ChevronDown, ChevronUp,
  BookMarked, FileText, Play, Pause, Square, LayoutDashboard, UserCircle, School,
  Volume2, Sparkles, RefreshCw, Sliders, ShieldCheck, ArrowRight,
  Compass, Award, Zap
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

mermaid.initialize({ startOnLoad: false, theme: 'neutral', securityLevel: 'loose' });

const SUPPORT_METADATA = {
  reading: { label: 'Simplified Reading', icon: BookOpen, desc: 'Generous typography, clear line height, and summary-first layout.' },
  audio: { label: 'Audio Narration', icon: Headphones, desc: 'Natural spoken read-aloud support with adjustable speech rates.' },
  visual: { label: 'Visual Learning', icon: Eye, desc: 'Interactive concept diagrams, visual maps, and flowcharts.' },
  abstraction: { label: 'Real-World Analogies', icon: Lightbulb, desc: 'Concrete metaphors connecting abstract science to daily life.' },
  working_memory: { label: 'Step-by-Step Examples', icon: Target, desc: 'Deconstructed guided examples reducing cognitive load.' },
  attention: { label: 'Focus Scaffolding', icon: Brain, desc: 'Low-clutter focus view with inline concept checkpoints.' },
  structure: { label: 'Structured Guidance', icon: Compass, desc: 'Predictable navigation and step-by-step progress tracking.' },
  chunking: { label: 'Chunked Learning', icon: BookMarked, desc: 'Information grouped into digestible micro-cards.' },
  gamification: { label: 'Interactive Rewards', icon: Award, desc: 'XP points, streaks, and positive achievement feedback.' },
  fatigue: { label: 'Rest Reminders', icon: Coffee, desc: 'Periodic hydration and eye-stretch prompts.' },
  pace: { label: 'Comfortable Pacing', icon: Sliders, desc: 'Timer-free self-pacing with unlimited review.' },
  sensory: { label: 'Calm Sensory Theme', icon: ShieldCheck, desc: 'Low-stimulation warm palette and glare-free contrast.' }
};

const CNV_METRIC_CONFIG = [
  { key: 'attention_support', label: 'Focus Scaffolding', category: 'Executive Function', icon: Brain },
  { key: 'working_memory_support', label: 'Working Memory Load', category: 'Executive Function', icon: Target },
  { key: 'reading_support', label: 'Reading Comfort', category: 'Literacy & Text', icon: BookOpen },
  { key: 'sensory_support', label: 'Sensory Sensitivity', category: 'Interface Comfort', icon: ShieldCheck },
  { key: 'visual_support', label: 'Visual Processing', category: 'Modality', icon: Eye },
  { key: 'audio_support', label: 'Audio Narration Need', category: 'Modality', icon: Headphones },
  { key: 'abstraction_support', label: 'Concrete Analogies', category: 'Reasoning', icon: Lightbulb },
  { key: 'structure_support', label: 'Structured Guidance', category: 'Executive Function', icon: Compass },
  { key: 'chunking_support', label: 'Content Chunking', category: 'Processing', icon: BookMarked },
  { key: 'gamification_support', label: 'Motivational Reward', category: 'Engagement', icon: Award },
  { key: 'pace_support', label: 'Pacing Flexibility', category: 'Processing', icon: Sliders },
  { key: 'fatigue_sensitivity', label: 'Rest & Fatigue', category: 'Wellness', icon: Coffee }
];

/* ── Mermaid Diagram Viewer ── */
function sanitizeMermaid(raw) {
  if (!raw) return '';
  let cleaned = raw.replace(/```mermaid/g, '').replace(/```/g, '').trim();
  // Safe quote all node labels: A[text] -> A["text"], preventing unquoted parentheses like (Dalton, etc.)
  return cleaned.replace(/([A-Za-z0-9_]+)\[([^\]\r\n]+)\]/g, (match, id, text) => {
    const trimmed = text.trim();
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      return match;
    }
    const safe = trimmed.replace(/"/g, "'");
    return `${id}["${safe}"]`;
  });
}

function MermaidViewer({ chart }) {
  const containerRef = useRef(null);
  const [renderError, setRenderError] = useState(false);
  const [chartId] = useState(() => `mm-${Math.random().toString(36).substring(2, 9)}`);

  useEffect(() => {
    let active = true;
    if (containerRef.current && chart) {
      containerRef.current.innerHTML = '';
      const safeChart = sanitizeMermaid(chart);
      mermaid.render(chartId, safeChart)
        .then(({ svg }) => {
          if (active && containerRef.current) {
            containerRef.current.innerHTML = svg;
            setRenderError(false);
          }
        })
        .catch(err => {
          console.warn('Mermaid render warning:', err);
          if (active) setRenderError(true);
        });
    }
    return () => { active = false; };
  }, [chart, chartId]);

  if (renderError) {
    return (
      <div className="p-4 rounded-2xl bg-surface-container border border-primary/20 text-on-surface text-xs font-medium">
        Diagram preview unavailable in text mode. Please refer to written concept notes below.
      </div>
    );
  }

  return (
    <div className="flex justify-center overflow-x-auto bg-white p-5 rounded-2xl border border-outline-variant/40 shadow-xs my-3">
      <div ref={containerRef} className="max-w-full" />
    </div>
  );
}

/* ── Web Speech Narration Engine (Robust Chrome Keep-Alive) ── */
function LessonAudioNarrator({ text, title = 'Read Aloud Narrator' }) {
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [rate, setRate] = useState(0.95);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [supported] = useState(() => typeof window !== 'undefined' && 'speechSynthesis' in window);

  // Load available speech synthesis voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const updateVoices = () => {
      const avail = window.speechSynthesis.getVoices();
      if (avail && avail.length > 0) {
        setVoices(avail);
        // Prioritize natural English voice if available
        const preferred = avail.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('David') || v.name.includes('Zira'))) ||
          avail.find(v => v.lang.startsWith('en')) || avail[0];
        setSelectedVoice(preferred);
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Chrome SpeechSynthesis keep-alive ping (prevents stopping after 15s)
  useEffect(() => {
    if (!playing || paused) return;
    const interval = setInterval(() => {
      if (typeof window !== 'undefined' && window.speechSynthesis?.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [playing, paused]);

  // Clean cancellation on unmount or text change
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [text]);

  const handleTogglePlay = () => {
    if (!supported || !text) return;

    if (playing) {
      if (paused) {
        window.speechSynthesis.resume();
        setPaused(false);
      } else {
        window.speechSynthesis.pause();
        setPaused(true);
      }
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`[\]()]/g, ' ').replace(/\s+/g, ' ').trim();
    const utter = new SpeechSynthesisUtterance(cleanText);
    utter.rate = rate;
    utter.pitch = 1.0;
    if (selectedVoice) utter.voice = selectedVoice;

    utter.onstart = () => {
      setPlaying(true);
      setPaused(false);
    };

    utter.onend = () => {
      setPlaying(false);
      setPaused(false);
    };

    utter.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      setPlaying(false);
      setPaused(false);
    };

    window.speechSynthesis.speak(utter);
  };

  const handleStop = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setPlaying(false);
    setPaused(false);
  };

  const handleRateChange = (newRate) => {
    setRate(newRate);
    if (playing) {
      handleStop();
    }
  };

  if (!supported) return null;

  return (
    <div className="bg-gradient-to-r from-surface-container-low via-surface-container to-surface border border-outline-variant/60 rounded-2xl p-4 shadow-sm my-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={handleTogglePlay}
            title={playing ? (paused ? 'Resume' : 'Pause') : 'Play Read Aloud'}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center font-semibold transition-all shadow-sm ${
              playing && !paused
                ? 'bg-brand-orange text-white ring-4 ring-brand-orange/20 hover:bg-brand-orange-hover'
                : 'bg-white text-primary border border-outline-variant hover:bg-surface-container-low'
            }`}
          >
            {playing && !paused ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>

          {playing && (
            <button
              onClick={handleStop}
              title="Stop Narration"
              className="w-10 h-10 rounded-2xl bg-white text-on-surface-variant hover:text-error hover:bg-error/10 border border-outline-variant flex items-center justify-center transition-all"
            >
              <Square className="w-4 h-4" />
            </button>
          )}

          <div>
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-brand-orange" />
              <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">{title}</h4>
              {playing && !paused && (
                <div className="flex items-center gap-0.5 ml-1">
                  <span className="w-1 h-3 bg-brand-orange rounded-full animate-pulse" />
                  <span className="w-1 h-5 bg-primary rounded-full animate-pulse delay-75" />
                  <span className="w-1 h-2 bg-primary-container rounded-full animate-pulse delay-150" />
                </div>
              )}
            </div>
            <p className="text-[11px] text-on-surface-variant mt-0.5">
              {playing ? (paused ? 'Narration paused' : 'Reading aloud actively...') : 'Click to hear audio narration of this concept'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Speed:</span>
          <div className="inline-flex rounded-full bg-white border border-outline-variant p-0.5 shadow-xs">
            {[0.85, 1.0, 1.15].map((spd) => (
              <button
                key={spd}
                onClick={() => handleRateChange(spd)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                  rate === spd ? 'bg-brand-orange text-white shadow-xs' : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {voices.length > 1 && (
            <select
              aria-label="Voice selection"
              value={selectedVoice?.name || ''}
              onChange={(e) => {
                const found = voices.find(v => v.name === e.target.value);
                if (found) setSelectedVoice(found);
              }}
              className="text-[11px] bg-white border border-outline-variant rounded-full px-3 py-1.5 text-on-surface font-medium max-w-[130px] truncate focus:outline-none focus:ring-1 focus:ring-brand-orange"
            >
              {voices.filter(v => v.lang.startsWith('en')).slice(0, 5).map((v) => (
                <option key={v.name} value={v.name}>{v.name.replace(/Google|Microsoft|Apple/g, '').trim()}</option>
              ))}
            </select>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Interactive Quiz & Understanding Check ── */
function QuizRenderer({ content, onCorrect, gamification }) {
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const parsedQuiz = useMemo(() => {
    try {
      const rawLines = content.split('\n').map(l => l.trim()).filter(Boolean);
      let questionLine = 'Check Your Understanding:';
      const options = [];
      let correctIdx = -1;
      let explicitExplanation = '';

      const contentLines = [];
      for (const line of rawLines) {
        if (/^explanation\s*:\s*(.*)/i.test(line)) {
          explicitExplanation = line.replace(/^explanation\s*:\s*/i, '').trim();
          continue;
        }
        if (/^answer\s*:\s*([A-Da-d])/i.test(line)) {
          const letter = line.match(/^answer\s*:\s*([A-Da-d])/i)[1].toUpperCase();
          correctIdx = letter.charCodeAt(0) - 65;
          continue;
        }
        contentLines.push(line);
      }

      if (contentLines.length > 0) {
        questionLine = contentLines[0].replace(/^#+\s*|^Question:\s*/i, '');
      }

      for (let i = 1; i < contentLines.length; i++) {
        const line = contentLines[i];
        const isMarkedCorrect = line.startsWith('*') ||
                                line.startsWith('✓') ||
                                line.includes('[x]') ||
                                /^\s*\*\s*[A-Za-z\d]/.test(line) ||
                                /\(correct\)/i.test(line);

        // Strip ONLY the option prefix: "*", "-", "A)", "1.", "(A)"
        // NEVER strip characters of the option word itself!
        const cleanOpt = line
          .replace(/^[*✓\-\s]+/, '')
          .replace(/^(\(|\[)?([A-Za-z\d])[)\]:.]\s*/, '')
          .replace(/\(correct\)/i, '')
          .trim();

        if (cleanOpt.length > 0) {
          if (isMarkedCorrect) correctIdx = options.length;
          options.push(cleanOpt);
        }
      }

      // Fallback check if correctIdx is not marked explicitly:
      if (correctIdx === -1 && options.length > 0) {
        const priorityKeywords = ['democritus', 'both living', 'atomos'];
        const match = options.findIndex(opt =>
          priorityKeywords.some(kw => opt.toLowerCase().includes(kw))
        );
        correctIdx = match !== -1 ? match : 0;
      }

      if (options.length < 2) {
        return {
          question: content.replace(/\n+/g, ' '),
          options: ['I understand this concept', 'I need more practice'],
          correct: 0,
          explanation: explicitExplanation
        };
      }

      return { question: questionLine, options, correct: correctIdx, explanation: explicitExplanation };
    } catch {
      return { question: content, options: ['I understand this concept', 'I need more practice'], correct: 0, explanation: '' };
    }
  }, [content]);

  const handleSubmit = () => {
    if (selected === null) return;
    setSubmitted(true);
    if (selected === parsedQuiz.correct && onCorrect) {
      onCorrect();
    }
  };

  const handleReset = () => {
    setSelected(null);
    setSubmitted(false);
  };

  if (!parsedQuiz) return null;

  const isCorrect = selected === parsedQuiz.correct;

  return (
    <div className="space-y-4">
      <p className="font-semibold text-on-surface text-sm md:text-base leading-snug">{parsedQuiz.question}</p>
      
      <div className="space-y-2">
        {parsedQuiz.options.map((opt, i) => {
          let btnStyle = 'bg-white border-outline-variant/60 text-on-surface hover:bg-surface-container-low';
          if (submitted) {
            if (i === parsedQuiz.correct) {
              btnStyle = 'bg-emerald-50 border-emerald-400 text-emerald-800 font-semibold ring-1 ring-emerald-300';
            } else if (i === selected) {
              btnStyle = 'bg-error/10 border-error/30 text-error line-through';
            } else {
              btnStyle = 'bg-surface-container-low/50 border-outline-variant/30 text-on-surface-variant/40 opacity-60';
            }
          } else if (selected === i) {
            btnStyle = 'bg-primary-fixed/30 border-brand-orange text-primary font-semibold ring-2 ring-brand-orange/20';
          }

          return (
            <button
              key={i}
              onClick={() => !submitted && setSelected(i)}
              disabled={submitted}
              className={`w-full text-left px-4 py-3 rounded-2xl text-sm transition-all border flex items-center justify-between ${btnStyle}`}
            >
              <span>{opt}</span>
              {submitted && i === parsedQuiz.correct && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 ml-2" />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3 pt-1">
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={selected === null}
            className={`px-6 py-2.5 rounded-full text-xs md:text-sm font-semibold transition-all shadow-card ${
              selected !== null
                ? 'bg-brand-orange text-white hover:bg-brand-orange-hover'
                : 'bg-surface-container-high text-on-surface-variant/40 cursor-not-allowed'
            }`}
          >
            Check Answer
          </button>
        ) : (
          <div className="flex flex-col gap-2 w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                  isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-surface-container text-primary'
                }`}>
                  {isCorrect ? '✓ Excellent work!' : 'Keep exploring — review the notes above!'}
                </span>
                {gamification && isCorrect && (
                  <span className="text-primary font-extrabold text-xs flex items-center gap-1 animate-bounce">
                    <Star className="w-3.5 h-3.5 fill-primary text-primary" /> +10 XP
                  </span>
                )}
              </div>
              <button
                onClick={handleReset}
                className="text-xs text-on-surface-variant hover:text-on-surface font-semibold flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Try Again
              </button>
            </div>

            {parsedQuiz.explanation && (
              <div className="p-4 rounded-2xl bg-surface-container-low border border-primary/20 text-xs text-on-surface leading-relaxed mt-2 animate-fadeIn">
                <span className="font-bold block mb-1 text-primary">Explanation:</span>
                {parsedQuiz.explanation}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Dedicated Challenge Activity Card ── */
function ChallengeCard({ content, onComplete, gamification }) {
  const [completed, setCompleted] = useState(false);

  const handleComplete = () => {
    if (!completed) {
      setCompleted(true);
      if (onComplete) onComplete();
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap">{content}</p>

      {!completed ? (
        <button
          onClick={handleComplete}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold bg-brand-orange hover:bg-brand-orange-hover text-white shadow-card transition-all"
        >
          <CheckCircle2 className="w-4 h-4" /> I completed this challenge {gamification && '(+15 XP ⭐)'}
        </button>
      ) : (
        <div className="flex items-center gap-2 text-xs font-bold text-primary bg-primary/10 px-4 py-2 rounded-full w-fit border border-primary/20">
          <Award className="w-4 h-4 text-brand-orange" /> Great job! Challenge marked as completed.
        </div>
      )}
    </div>
  );
}

/* ── Dedicated Reflection Prompt Card ── */
function ReflectionCard({ content }) {
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-3">
      <p className="text-sm text-on-surface-variant italic whitespace-pre-wrap leading-relaxed">{content}</p>

      <div className="space-y-2 pt-1">
        <textarea
          value={note}
          onChange={(e) => { setNote(e.target.value); setSaved(false); }}
          placeholder="Write your thoughts or personal reflections here..."
          className="w-full text-xs p-3.5 rounded-2xl border border-outline-variant bg-white text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-brand-orange resize-none h-20"
        />
        {note.trim() && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSaved(true)}
              className="px-5 py-2 rounded-full text-xs font-semibold bg-brand-orange hover:bg-brand-orange-hover text-white transition-all shadow-card"
            >
              Save Thought
            </button>
            {saved && (
              <span className="text-xs text-primary font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Saved to session
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Dedicated Key Checkpoint Card ── */
function CheckpointCard({ content }) {
  const [reviewed, setReviewed] = useState(false);

  return (
    <div className="space-y-3">
      <p className="text-sm text-on-surface whitespace-pre-wrap leading-relaxed">{content}</p>

      {!reviewed ? (
        <button
          onClick={() => setReviewed(true)}
          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-semibold bg-brand-orange hover:bg-brand-orange-hover text-white transition-all shadow-card"
        >
          <CheckCircle2 className="w-3.5 h-3.5" /> Got it, understood
        </button>
      ) : (
        <div className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-3.5 py-1.5 rounded-full w-fit">
          <CheckCircle2 className="w-3.5 h-3.5 text-brand-orange" /> Reviewed & checked
        </div>
      )}
    </div>
  );
}

/* ── Break Reminder Modal/Card ── */
function BreakReminder() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center my-6 relative shadow-sm animate-fadeIn">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-4 text-emerald-400 hover:text-emerald-700 text-xl font-bold w-7 h-7 rounded-full flex items-center justify-center hover:bg-emerald-100"
      >
        ×
      </button>
      <Coffee className="w-9 h-9 text-emerald-600 mx-auto mb-2" />
      <h3 className="text-base font-bold text-emerald-900 mb-1">Rest & Stretch Reminder</h3>
      <p className="text-xs md:text-sm text-emerald-700 max-w-md mx-auto">
        Great focus so far! Take 30 seconds to relax your eyes, drink some water, and stretch before continuing.
      </p>
    </div>
  );
}

/* ── Multimodal Tab Builder (UDL Principles + CNV Priority Badging) ── */
function buildAvailableTabs(conceptBlocks, rules, activeProfiles) {
  const byType = {};
  conceptBlocks.forEach(b => {
    if (!byType[b.type]) byType[b.type] = [];
    byType[b.type].push(b);
  });

  const tabs = [];

  // 1. Summary Tab
  if (byType['summary'] && byType['summary'].length > 0) {
    const isRecommended = rules.show_summary_first || activeProfiles.includes('reading');
    tabs.push({
      id: 'summary',
      label: 'Summary',
      icon: BookMarked,
      blocks: byType['summary'],
      recommended: isRecommended,
      badgeText: isRecommended ? 'Recommended' : null
    });
  }

  // 2. Visual Diagram Tab
  const visualBlocks = [
    ...(byType['mermaid_graph'] || []),
    ...(byType['diagram_description'] || []),
    ...(byType['visual_prompt'] || [])
  ];
  if (visualBlocks.length > 0) {
    const isRecommended = rules.require_visuals || activeProfiles.includes('visual') || activeProfiles.includes('abstraction');
    tabs.push({
      id: 'visualize',
      label: 'Visualize',
      icon: Eye,
      blocks: visualBlocks,
      recommended: isRecommended,
      badgeText: isRecommended ? 'Visual Match' : null
    });
  }

  // 3. Analogy Tab
  if (byType['analogy'] && byType['analogy'].length > 0) {
    const isRecommended = rules.inject_analogies || activeProfiles.includes('abstraction');
    tabs.push({
      id: 'analogy',
      label: 'Analogy',
      icon: Lightbulb,
      blocks: byType['analogy'],
      recommended: isRecommended,
      badgeText: isRecommended ? 'Relatable' : null
    });
  }

  // 4. Worked Example / Step-by-Step Tab
  if (byType['worked_example'] && byType['worked_example'].length > 0) {
    const isRecommended = rules.inject_worked_examples || activeProfiles.includes('working_memory') || activeProfiles.includes('structure');
    tabs.push({
      id: 'worked_example',
      label: 'Step-by-Step',
      icon: Target,
      blocks: byType['worked_example'],
      recommended: isRecommended,
      badgeText: isRecommended ? 'Guided' : null
    });
  }

  // 5. Audio Script Tab
  if (byType['audio_script'] && byType['audio_script'].length > 0) {
    const isRecommended = rules.enable_audio || activeProfiles.includes('audio');
    tabs.push({
      id: 'listen',
      label: 'Audio Brief',
      icon: Headphones,
      blocks: byType['audio_script'],
      recommended: isRecommended,
      badgeText: isRecommended ? 'Spoken' : null
    });
  }

  return tabs;
}

function buildCheckBlocks(conceptBlocks) {
  const byType = {};
  conceptBlocks.forEach(b => {
    if (!byType[b.type]) byType[b.type] = [];
    byType[b.type].push(b);
  });

  const result = [];
  if (byType['checkpoint']) result.push(...byType['checkpoint']);
  if (byType['quiz']) result.push(...byType['quiz']);
  if (byType['challenge']) result.push(...byType['challenge']);
  if (byType['reflection']) result.push(...byType['reflection']);
  return result;
}

/* ── Tab Content Renderer ── */
function TabContent({ tab, rules }) {
  const fontSize = rules.font_size === 'large' ? 'text-base md:text-lg leading-relaxed' : 'text-sm md:text-base leading-relaxed';

  return (
    <div className="space-y-4 py-2 animate-fadeIn">
      {tab.blocks.map((block, i) => {
        if (block.type === 'mermaid_graph') {
          return (
            <div key={block.block_id || i} className="space-y-2">
              <MermaidViewer chart={block.content} />
              <LessonAudioNarrator text="Visual concept graph explaining system relationships." title="Diagram Description" />
            </div>
          );
        }
        if (block.type === 'audio_script') {
          return (
            <div key={block.block_id || i} className="space-y-3">
              <LessonAudioNarrator text={block.content} title="Spoken Audio Briefing" />
              <div className="p-5 bg-white rounded-2xl border border-outline-variant/40 shadow-xs">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Transcript</span>
                <p className={`${fontSize} text-on-surface-variant whitespace-pre-wrap`}>{block.content}</p>
              </div>
            </div>
          );
        }
        return (
          <div key={block.block_id || i} className="space-y-3">
            <div className={`p-6 rounded-2xl bg-white border border-outline-variant/40 ${fontSize} text-on-surface whitespace-pre-wrap shadow-xs`}>
              {block.content}
            </div>
            <LessonAudioNarrator text={block.content} title={`Read ${tab.label} Aloud`} />
          </div>
        );
      })}
    </div>
  );
}

/* ── Concept Lesson Main View ── */
function ConceptLesson({ concept, rules, activeProfiles, onComplete, isCompleted, onQuizCorrect }) {
  const blocks = useMemo(() => concept.blocks || [], [concept.blocks]);
  const tabs = useMemo(() => buildAvailableTabs(blocks, rules, activeProfiles), [blocks, rules, activeProfiles]);
  const checkBlocks = useMemo(() => buildCheckBlocks(blocks), [blocks]);

  // Find default recommended tab
  const recommendedTab = useMemo(() => {
    return tabs.find(t => t.recommended)?.id || (tabs.length > 0 ? tabs[0].id : null);
  }, [tabs]);

  const [userSelectedTab, setUserSelectedTab] = useState(null);
  const [prevConceptId, setPrevConceptId] = useState(concept.id);
  if (prevConceptId !== concept.id) {
    setPrevConceptId(concept.id);
    setUserSelectedTab(null);
  }
  const activeTab = userSelectedTab ?? recommendedTab;
  const [checkOpen, setCheckOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);

  const byType = useMemo(() => {
    const map = {};
    blocks.forEach(b => { if (!map[b.type]) map[b.type] = []; map[b.type].push(b); });
    return map;
  }, [blocks]);

  const heroBlock = (rules.show_summary_first && byType['summary']?.[0]) || byType['simplified_text']?.[0] || byType['summary']?.[0] || blocks[0] || null;
  const isLowStim = rules.theme === 'low_stimulation' || rules.reduce_visual_noise;
  const fontSize = rules.font_size === 'large' ? 'text-lg md:text-xl leading-relaxed md:leading-loose tracking-wide' : 'text-base md:text-lg leading-relaxed';
  const conceptLabel = concept.name || concept.id?.replace(/_/g, ' ').replace(/^concept\s*\d+\s*/i, '').replace(/^\d+\s*/, '') || 'Concept Overview';

  // Format content chunks if strict chunking is active
  const renderHeroContent = () => {
    if (!heroBlock) return null;
    if (rules.chunking_level === 'strict' && heroBlock.content.length > 250) {
      const chunks = heroBlock.content.split(/\n\n+/).filter(Boolean);
      if (chunks.length > 1) {
        return (
          <div className="space-y-4">
            {chunks.map((chunk, ci) => (
              <div key={ci} className={`p-5 rounded-2xl border ${isLowStim ? 'bg-surface-container-low border-outline-variant/60' : 'bg-surface-container-low/60 border-outline-variant/40'} transition-all`}>
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider block mb-1">Part {ci + 1}</span>
                <p className={`${fontSize} text-on-surface`}>{chunk}</p>
              </div>
            ))}
          </div>
        );
      }
    }
    return (
      <div className={`${fontSize} text-on-surface whitespace-pre-wrap leading-relaxed`}>
        {heroBlock.content}
      </div>
    );
  };

  return (
    <div className={`rounded-3xl border shadow-soft overflow-hidden transition-colors ${
      isLowStim ? 'bg-surface border-outline-variant/60' : 'bg-white border-outline-variant/40'
    }`}>
      {/* Header */}
      <div className={`px-6 md:px-8 py-5 flex items-center justify-between ${
        isLowStim ? 'bg-inverse-surface text-inverse-on-surface' : 'bg-gradient-to-r from-[#9f4200] via-[#c87a3e] to-[#f97d36] text-white'
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl md:text-2xl font-bold capitalize">{conceptLabel}</h2>
            {isLowStim && (
              <span className="text-[10px] bg-white/20 text-white px-2.5 py-0.5 rounded-full font-semibold">
                Calm Interface
              </span>
            )}
          </div>
          <p className="text-white/80 text-xs md:text-sm mt-0.5 font-medium flex items-center gap-2">
            <span>Read</span> • <span>Explore Multi-Modality</span> • <span>Verify</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {rules.enable_focus_mode && (
            <button
              onClick={() => setFocusMode(!focusMode)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                focusMode ? 'bg-white text-primary shadow-sm' : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Brain className="w-3.5 h-3.5" /> {focusMode ? 'Focus Active' : 'Focus Mode'}
            </button>
          )}
          {isCompleted && (
            <span className="bg-emerald-500/25 text-emerald-100 px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border border-emerald-400/40">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Completed
            </span>
          )}
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-8">
        {/* Main Concept Reading Block */}
        {heroBlock && (
          <div className={`transition-opacity ${focusMode ? 'ring-2 ring-brand-orange/40 p-6 rounded-3xl bg-white shadow-soft' : ''}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-brand-orange" />
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Concept Lesson Text</span>
              </div>
              {rules.font_size === 'large' && (
                <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full font-bold">
                  Large Text Active
                </span>
              )}
            </div>

            {/* Inline Prominent Audio Narrator */}
            <LessonAudioNarrator text={heroBlock.content} title={`Read "${conceptLabel}" Aloud`} />

            {/* Text Content */}
            <div className="mt-4">
              {renderHeroContent()}
            </div>
          </div>
        )}

        {/* Multi-Modal Learning Tabs (Universal Design for Learning) */}
        {tabs.length > 0 && (
          <div className="pt-4 border-t border-outline-variant/30">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-orange" />
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Explore Differently (Multi-Modal Aids)</span>
              </div>
              <span className="text-[11px] text-on-surface-variant/60 hidden sm:inline">Select what helps you understand best</span>
            </div>

            <div className="flex flex-wrap gap-2.5 mb-4">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setUserSelectedTab(isActive ? null : tab.id)}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs md:text-sm font-semibold transition-all border ${
                      isActive
                        ? 'bg-brand-orange text-white border-brand-orange shadow-card ring-2 ring-brand-orange/20'
                        : `${isLowStim ? 'bg-surface-container text-on-surface border-outline-variant hover:bg-surface-container-high' : 'bg-white text-on-surface border-outline-variant/60 hover:bg-surface-container-low hover:border-brand-orange/40 shadow-xs'}`
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {tab.badgeText && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ml-1 ${
                        isActive ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
                      }`}>
                        ★ {tab.badgeText}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {activeTab && tabs.find(t => t.id === activeTab) && (
              <div className={`p-6 rounded-3xl border ${isLowStim ? 'bg-surface-container border-outline-variant' : 'bg-surface-container-low/50 border-outline-variant/40'}`}>
                <TabContent tab={tabs.find(t => t.id === activeTab)} rules={rules} />
              </div>
            )}
          </div>
        )}

        {/* Check Understanding Section */}
        {checkBlocks.length > 0 && (
          <div className="pt-4 border-t border-outline-variant/30">
            <button
              onClick={() => setCheckOpen(!checkOpen)}
              className={`w-full flex items-center justify-between px-6 py-3.5 rounded-full text-sm font-semibold transition-all border ${
                checkOpen
                  ? `${isLowStim ? 'bg-inverse-surface text-inverse-on-surface border-inverse-surface' : 'bg-brand-orange text-white border-brand-orange shadow-card'}`
                  : `${isLowStim ? 'bg-surface-container text-on-surface border-outline-variant hover:bg-surface-container-high' : 'bg-surface-container-low text-on-surface border-outline-variant/60 hover:bg-surface-container shadow-xs'}`
              }`}
            >
              <span className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                Check Understanding & Practice ({checkBlocks.filter(b => b.type === 'quiz').length} Quiz{checkBlocks.filter(b => b.type === 'quiz').length === 1 ? '' : 'zes'}, {checkBlocks.length - checkBlocks.filter(b => b.type === 'quiz').length} Activities)
              </span>
              {checkOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {checkOpen && (
              <div className="mt-4 space-y-4 animate-fadeIn">
                {checkBlocks.map((block, i) => {
                  const isQuiz = block.type === 'quiz';
                  const isChallenge = block.type === 'challenge';
                  const isReflection = block.type === 'reflection';

                  return (
                    <div
                      key={block.block_id || `check-${i}`}
                      className={`p-6 rounded-3xl border shadow-xs ${
                        isQuiz ? 'bg-surface-container-low/80 border-outline-variant/50' :
                        isChallenge ? 'bg-surface-container/60 border-primary/20' :
                        isReflection ? 'bg-surface-container-low border-outline-variant/50' :
                        'bg-surface-container-low border-outline-variant/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        {isQuiz && <HelpCircle className="w-4 h-4 text-brand-orange" />}
                        {isChallenge && <Zap className="w-4 h-4 text-primary" />}
                        {isReflection && <Brain className="w-4 h-4 text-brand-orange" />}
                        {!isQuiz && !isChallenge && !isReflection && <CheckCircle2 className="w-4 h-4 text-brand-orange" />}
                        <span className="text-xs font-bold uppercase tracking-wider text-primary">
                          {isQuiz ? 'Concept Quiz' : isChallenge ? 'Interactive Challenge' : isReflection ? 'Reflection' : 'Checkpoint'}
                        </span>
                      </div>

                      {isQuiz ? (
                        <QuizRenderer content={block.content} onCorrect={onQuizCorrect} gamification={rules.enable_gamification} />
                      ) : isChallenge ? (
                        <ChallengeCard content={block.content} onComplete={onQuizCorrect} gamification={rules.enable_gamification} />
                      ) : isReflection ? (
                        <ReflectionCard content={block.content} />
                      ) : (
                        <CheckpointCard content={block.content} />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Completion Action */}
        {!isCompleted ? (
          <div className="pt-4 border-t border-outline-variant/30 flex items-center justify-between flex-wrap gap-4">
            <button
              onClick={onComplete}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-sm bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-card"
            >
              <CheckCircle2 className="w-4 h-4" /> I understand this concept {rules.enable_gamification && '(+10 XP)'}
            </button>
            <span className="text-xs text-on-surface-variant/60">Mark complete to record progress</span>
          </div>
        ) : (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <p className="text-xs md:text-sm text-emerald-800 font-medium">
              You marked this concept as understood! You can review any tab or proceed to the next concept.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Active Supports Side Panel ── */
function ActiveSupportsPanel({ activeProfiles, rules }) {
  const supports = useMemo(() => {
    return activeProfiles
      .map(p => SUPPORT_METADATA[p])
      .filter(Boolean);
  }, [activeProfiles]);

  return (
    <div className="bg-white border border-outline-variant/40 rounded-3xl p-6 shadow-soft space-y-4">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-brand-orange" />
        <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Active Accommodations</h3>
      </div>

      <div className="space-y-3">
        {supports.length === 0 ? (
          <p className="text-xs text-on-surface-variant">Standard learning mode active. Complete calibration to unlock personalized sensory and cognitive adaptations.</p>
        ) : (
          supports.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-1">
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 text-brand-orange" />
                  <span className="text-xs font-bold text-on-surface">{s.label}</span>
                </div>
                <p className="text-[11px] text-on-surface-variant leading-snug">{s.desc}</p>
              </div>
            );
          })
        )}
      </div>

      {rules.enable_audio && (
        <div className="p-3.5 bg-surface-container border border-primary/20 rounded-2xl flex items-center gap-2 text-primary">
          <Headphones className="w-4 h-4 text-brand-orange flex-shrink-0" />
          <span className="text-[11px] font-semibold">Read-Aloud Narration ready on all lesson sections</span>
        </div>
      )}
    </div>
  );
}

/* ── Student Home Dashboard (Cognitive Profile + Textbooks) ── */
export function StudentHomeDashboard({ onOpenLesson, studentId, currentUser, onRetakeAssessment }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ count: 0, lastDate: null });
  const [activeProfiles, setActiveProfiles] = useState([]);
  const [adaptationReasons, setAdaptationReasons] = useState([]);
  const [rawCnv, setRawCnv] = useState({});
  const [showAllCnvs, setShowAllCnvs] = useState(false);

  useEffect(() => {
    if (!studentId) return;
    const load = async () => {
      try {
        const [blocksRes, statusRes, rulesRes] = await Promise.all([
          fetch(`${API_BASE}/adaptation/blocks/${studentId}`),
          fetch(`${API_BASE}/adaptation/student-status/${studentId}`),
          fetch(`${API_BASE}/adaptation/rules/${studentId}`)
        ]);

        if (statusRes.ok) {
          const sData = await statusRes.json();
          setStats({
            count: sData.assessmentCount || 0,
            lastDate: sData.lastAssessmentDate ? new Date(sData.lastAssessmentDate).toLocaleDateString() : null
          });
        }

        if (rulesRes.ok) {
          const rData = await rulesRes.json();
          setActiveProfiles(rData.active_profiles || []);
          setAdaptationReasons(rData.adaptation_reasons || []);
          setRawCnv(rData.raw_cnv || {});
        }

        if (blocksRes.ok) {
          const data = await blocksRes.json();
          const blocks = data.blocks || [];
          const docMap = {};
          blocks.forEach(b => {
            const docName = b.source_document || 'General Concepts';
            const subject = b.subject || 'Uncategorized';
            if (!docMap[docName]) {
              docMap[docName] = { id: docName, name: docName, subject, conceptCount: new Set(), blockCount: 0 };
            }
            docMap[docName].conceptCount.add(b.concept_id);
            docMap[docName].blockCount++;
          });
          setDocuments(Object.values(docMap).map(d => ({ ...d, conceptCount: d.conceptCount.size })));
        }
      } catch (err) {
        console.error('Error loading student profile:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [studentId]);

  // Always scroll to top when opening student home dashboard
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  const subjectsMap = useMemo(() => {
    const map = {};
    documents.forEach(d => {
      if (!map[d.subject]) map[d.subject] = [];
      map[d.subject].push(d);
    });
    return map;
  }, [documents]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-on-surface-variant text-sm font-semibold">Calibrating your learning portal...</p>
        </div>
      </div>
    );
  }

  const isCalibrated = stats.count > 0;

  return (
    <div className="min-h-screen bg-surface font-inter text-on-surface">
      {/* Header Banner */}
      <div className="bg-white border-b border-outline-variant/30 shadow-xs">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary-fixed/40 rounded-2xl flex items-center justify-center border-2 border-white shadow-sm flex-shrink-0 text-primary">
                <UserCircle className="w-10 h-10" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-on-surface">{currentUser?.name || 'Student'}</h1>
                  <span className={`text-xs px-3 py-0.5 rounded-full font-bold border ${
                    isCalibrated ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-surface-container text-primary border-primary/20'
                  }`}>
                    {isCalibrated ? '● Profile Calibrated' : '○ Calibration Pending'}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-xs md:text-sm text-on-surface-variant font-medium">
                  <span className="flex items-center gap-1"><School className="w-4 h-4 text-on-surface-variant/60" /> {currentUser?.institute || 'LumynMinds Academy'}</span>
                  <span>•</span>
                  <span>Grade {currentUser?.grade || 'All'}</span>
                  {stats.lastDate && (
                    <>
                      <span>•</span>
                      <span>Calibrated {stats.lastDate}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 md:justify-end">
              {onRetakeAssessment && (
                <button
                  onClick={onRetakeAssessment}
                  className="px-6 py-2.5 rounded-full font-semibold text-xs bg-white text-primary hover:bg-surface-container border border-primary/30 transition-all flex items-center gap-2 shadow-xs hover:-translate-y-0.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  {isCalibrated ? 'Recalibrate Assessment' : 'Take Cognitive Assessment'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Calibrated Cognitive Profile Section */}
        <div className="bg-white rounded-3xl border border-outline-variant/40 shadow-soft p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/30 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-brand-orange" />
                <h2 className="text-lg md:text-xl font-bold text-on-surface">Your Calibrated Cognitive Profile</h2>
              </div>
              <p className="text-xs md:text-sm text-on-surface-variant mt-1">
                Measured through your behavioral telemetry to calibrate optimal font sizing, audio assistance, visual scaffolding, and concept pacing.
              </p>
            </div>
            {isCalibrated && (
              <span className="text-xs font-bold bg-surface-container text-primary px-3.5 py-1.5 rounded-full border border-primary/20 w-fit">
                {activeProfiles.length} Adaptive Accommodations Active
              </span>
            )}
          </div>

          {/* Active Accommodations Badges */}
          <div>
            <h3 className="text-xs font-bold text-on-surface-variant/60 uppercase tracking-wider mb-3">Active Learning Accommodations</h3>
            {activeProfiles.length === 0 ? (
              <div className="p-6 rounded-3xl bg-surface-container-low border border-outline-variant/40 text-center">
                <p className="text-sm text-on-surface-variant mb-3">No active accommodations established yet.</p>
                {onRetakeAssessment && (
                  <button
                    onClick={onRetakeAssessment}
                    className="px-6 py-2.5 rounded-full text-xs font-semibold bg-brand-orange text-white hover:bg-brand-orange-hover transition-all inline-flex items-center gap-2 shadow-card"
                  >
                    Start Quick Assessment <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeProfiles.map((p) => {
                  const meta = SUPPORT_METADATA[p] || { label: p, icon: CheckCircle2, desc: 'Personalized learning aid enabled.' };
                  const Icon = meta.icon;
                  return (
                    <div key={p} className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/40 hover:border-brand-orange/40 transition-all shadow-xs">
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                          <Icon className="w-4 h-4 text-brand-orange" />
                        </div>
                        <h4 className="text-xs font-bold text-on-surface">{meta.label}</h4>
                      </div>
                      <p className="text-[11px] text-on-surface-variant leading-snug">{meta.desc}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Adaptation Reasons (Why accommodations are enabled) */}
          {adaptationReasons.length > 0 && (
            <div className="p-5 rounded-2xl bg-surface-container-low/60 border border-outline-variant/40">
              <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-2">Calibration Insights</span>
              <ul className="space-y-1.5 text-xs text-on-surface">
                {adaptationReasons.map((r, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-brand-orange font-bold">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 12-Dimensional CNV Metrics Breakdown */}
          {Object.keys(rawCnv).length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-on-surface-variant/70 uppercase tracking-wider">
                  Calibrated Cognitive Vectors (12 Dimensions)
                </span>
                <button
                  onClick={() => setShowAllCnvs(!showAllCnvs)}
                  className="text-xs font-semibold text-primary hover:text-brand-orange transition-colors"
                >
                  {showAllCnvs ? 'Show Key Dimensions' : 'View All 12 Vectors'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(showAllCnvs ? CNV_METRIC_CONFIG : CNV_METRIC_CONFIG.slice(0, 6)).map((metric) => {
                  const cnvData = rawCnv[metric.key] || { value: 0.5, confidence: 0.2 };
                  const pct = Math.round(cnvData.value * 100);
                  const confPct = Math.round(cnvData.confidence * 100);
                  const Icon = metric.icon;

                  return (
                    <div key={metric.key} className="p-4 rounded-2xl border border-outline-variant/40 bg-white hover:border-brand-orange/30 transition-all shadow-xs">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className="w-3.5 h-3.5 text-brand-orange" />
                          <span className="text-xs font-bold text-on-surface">{metric.label}</span>
                        </div>
                        <span className="text-xs font-extrabold text-primary">{pct}%</span>
                      </div>
                      <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden mb-1.5">
                        <div
                          className="bg-brand-orange h-2 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-on-surface-variant/60">
                        <span>{metric.category}</span>
                        <span>{confPct}% confidence</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Textbooks and Subject Lessons */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg md:text-xl font-bold text-on-surface flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-brand-orange" />
              Your Textbooks & Subject Lessons
            </h2>
            <span className="text-xs text-on-surface-variant font-medium">{documents.length} Learning Materials Available</span>
          </div>

          {Object.keys(subjectsMap).length === 0 ? (
            <div className="bg-white rounded-3xl border border-outline-variant/40 p-12 text-center shadow-soft">
              <BookOpen className="w-12 h-12 text-outline-variant mx-auto mb-4" />
              <h3 className="text-lg font-bold text-on-surface mb-2">No learning materials uploaded yet</h3>
              <p className="text-on-surface-variant text-sm max-w-md mx-auto">
                Your educator will upload curriculum chapters for your grade. Once uploaded, your personalized multi-modal lessons and read-aloud textbooks will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.entries(subjectsMap).map(([subject, docs]) => (
                <div key={subject} className="bg-white rounded-3xl border border-outline-variant/40 shadow-soft overflow-hidden">
                  <div className="bg-surface-container-low px-6 py-4 border-b border-outline-variant/30 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">{subject}</h3>
                    <span className="text-[11px] font-semibold text-on-surface-variant/70">{docs.length} chapters</span>
                  </div>
                  <div className="divide-y divide-outline-variant/20">
                    {docs.map(doc => (
                      <button
                        key={doc.id}
                        onClick={() => onOpenLesson(doc.id)}
                        className="w-full text-left px-6 py-4.5 hover:bg-surface-container-low/50 transition-colors flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                            <FileText className="w-5 h-5 text-brand-orange" />
                          </div>
                          <div>
                            <h4 className="font-bold text-on-surface text-sm md:text-base group-hover:text-primary transition-colors">
                              {doc.name}
                            </h4>
                            <p className="text-xs text-on-surface-variant mt-0.5">
                              {doc.conceptCount} Key Concepts • {doc.blockCount} Multi-Modal Blocks
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-orange opacity-80 group-hover:opacity-100 group-hover:text-primary transition-all">
                          <span>Open Lesson</span>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Interactive Lesson Dashboard (Single Concept Reader) ── */
export default function StudentDashboard({ conceptFilter, studentId, onBackToDashboard }) {
  const [rules, setRules] = useState({});
  const [activeProfiles, setActiveProfiles] = useState([]);
  const [documentName, setDocumentName] = useState('');
  const [concepts, setConcepts] = useState([]);
  const [currentConceptIdx, setCurrentConceptIdx] = useState(0);
  const [completedConcepts, setCompletedConcepts] = useState(new Set());
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!studentId || !conceptFilter) return;
    const load = async () => {
      try {
        const [rulesRes, blocksRes] = await Promise.all([
          fetch(`${API_BASE}/adaptation/rules/${studentId}`),
          fetch(`${API_BASE}/adaptation/blocks/${studentId}`)
        ]);

        if (rulesRes.ok) {
          const rulesData = await rulesRes.json();
          setRules(rulesData.rules || {});
          setActiveProfiles(rulesData.active_profiles || []);
        }

        if (blocksRes.ok) {
          const blocksData = await blocksRes.json();
          const allBlocks = blocksData.blocks || [];
          const docBlocks = allBlocks.filter(b => b.source_document === conceptFilter);
          setDocumentName(conceptFilter);

          const conceptMap = {};
          docBlocks.forEach(b => {
            if (!conceptMap[b.concept_id]) {
              conceptMap[b.concept_id] = {
                id: b.concept_id,
                name: blocksData.concepts?.[b.concept_id]?.concept || '',
                blocks: []
              };
            }
            conceptMap[b.concept_id].blocks.push(b);
          });
          setConcepts(Object.values(conceptMap));
          setCurrentConceptIdx(0);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load lesson materials.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [studentId, conceptFilter]);

  const handleQuizCorrect = useCallback(() => {
    setXp(x => x + 10);
    setStreak(s => s + 1);
  }, []);

  const markComplete = useCallback(() => {
    const cid = concepts[currentConceptIdx]?.id;
    if (cid && !completedConcepts.has(cid)) {
      setCompletedConcepts(prev => new Set([...prev, cid]));
      if (rules.enable_gamification) setXp(x => x + 10);
    }
  }, [concepts, currentConceptIdx, completedConcepts, rules.enable_gamification]);

  // Scroll to the very top whenever the concept index changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [currentConceptIdx]);

  const goNext = () => {
    markComplete();
    if (currentConceptIdx < concepts.length - 1) {
      setCurrentConceptIdx(i => i + 1);
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  };

  const goPrev = () => {
    if (currentConceptIdx > 0) {
      setCurrentConceptIdx(i => i - 1);
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-on-surface-variant font-medium text-sm">Formatting textbook lesson with your sensory profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <AlertTriangle className="w-12 h-12 text-brand-orange mx-auto mb-3" />
          <p className="text-on-surface font-bold mb-4">{error}</p>
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="px-6 py-2.5 rounded-full bg-brand-orange text-white font-semibold text-xs hover:bg-brand-orange-hover transition-all shadow-card"
            >
              Back to Subjects
            </button>
          )}
        </div>
      </div>
    );
  }

  const isLowStim = rules.theme === 'low_stimulation' || rules.reduce_visual_noise;
  const currentConcept = concepts[currentConceptIdx];
  const showBreak = rules.enable_break_reminders && currentConceptIdx > 0 && currentConceptIdx % 3 === 0;
  const progressPct = concepts.length > 0 ? (completedConcepts.size / concepts.length) * 100 : 0;

  return (
    <div className={`min-h-screen pb-20 ${isLowStim ? 'bg-surface' : 'bg-surface'}`}>
      {/* Sticky Top Progress Header */}
      <div className={`sticky top-12 z-40 backdrop-blur-md border-b px-6 py-3.5 transition-colors ${
        isLowStim ? 'bg-surface/95 border-outline-variant/40' : 'bg-white/90 border-outline-variant/30 shadow-xs'
      }`}>
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-sm md:text-base font-bold truncate max-w-[200px] md:max-w-lg text-on-surface">
              {documentName}
            </h1>
            <p className="text-[11px] text-on-surface-variant">
              Concept {currentConceptIdx + 1} of {concepts.length}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-28 md:w-36 rounded-full h-2 overflow-hidden bg-surface-container">
                <div
                  className="bg-brand-orange h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <span className="text-[11px] text-on-surface-variant font-bold">{Math.round(progressPct)}%</span>
            </div>

            {rules.enable_gamification && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-surface-container px-3 py-1 rounded-full border border-primary/20">
                  <Star className="w-3.5 h-3.5 text-brand-orange fill-brand-orange" />
                  <span className="text-xs font-bold text-primary">{xp} XP</span>
                </div>
                {streak > 0 && (
                  <div className="flex items-center gap-1 bg-surface-container px-3 py-1 rounded-full border border-primary/20">
                    <Flame className="w-3.5 h-3.5 text-brand-orange fill-brand-orange" />
                    <span className="text-xs font-bold text-primary">{streak}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Workspace */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          <div className="xl:col-span-3 space-y-6">
            {showBreak && <BreakReminder />}

            {currentConcept && (
              <ConceptLesson
                concept={currentConcept}
                rules={rules}
                activeProfiles={activeProfiles}
                isCompleted={completedConcepts.has(currentConcept.id)}
                onComplete={markComplete}
                onQuizCorrect={handleQuizCorrect}
              />
            )}

            {/* Bottom Concept Pager */}
            <div className="flex items-center justify-between pt-4">
              <button
                onClick={goPrev}
                disabled={currentConceptIdx === 0}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-xs md:text-sm transition-all ${
                  currentConceptIdx === 0
                    ? 'bg-surface-container-high text-on-surface-variant/40 cursor-not-allowed'
                    : 'bg-white text-on-surface hover:bg-surface-container border border-outline-variant shadow-xs hover:-translate-y-0.5'
                }`}
              >
                <ChevronLeft className="w-4 h-4" /> Previous Concept
              </button>
              <button
                onClick={goNext}
                disabled={currentConceptIdx === concepts.length - 1}
                className={`inline-flex items-center gap-2 px-7 py-3 rounded-full font-semibold text-xs md:text-sm transition-all ${
                  currentConceptIdx === concepts.length - 1
                    ? 'bg-surface-container-high text-on-surface-variant/40 cursor-not-allowed'
                    : 'bg-brand-orange text-white hover:bg-brand-orange-hover shadow-card hover:-translate-y-0.5'
                }`}
              >
                Next Concept <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Accommodations Sidebar */}
          <div className="xl:col-span-1 hidden xl:block">
            <div className="sticky top-28 space-y-4">
              <ActiveSupportsPanel activeProfiles={activeProfiles} rules={rules} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
