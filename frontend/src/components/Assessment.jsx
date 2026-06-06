import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BrainCircuit, CheckCircle2, Loader2, BookOpen, Eye, Headphones, Trophy, Zap, Star, ArrowRight, Award, Flame, PartyPopper, Play, Pause, Square } from 'lucide-react';

const API_URL = 'http://localhost:5000/api/assessment/evaluate';
const IDLE_THRESHOLD = 5000;
const MIN_READING_TIME = 15000;
const REQUIRED_TARGETS = 5;
const RAPID_CLICK_WINDOW = 1000;
const RAPID_CLICK_THRESHOLD = 4;

const SHARED_PARAGRAPHS = [
  {
    id: 'p1',
    segments: [
      { text: 'The universe is vast and filled with billions of galaxies. Our home galaxy is called the ', phrase: false },
      { text: 'Milky Way', phrase: true, isTarget: true, phraseId: 'milky_way' },
      { text: '. It contains our solar system, which is held together by the massive gravitational pull of the ', phrase: false },
      { text: 'Sun', phrase: true, isTarget: true, phraseId: 'sun' },
      { text: '.', phrase: false }
    ],
  },
  {
    id: 'p2',
    segments: [
      { text: 'Earth is perfectly positioned to support life. But scientists are also very interested in exploring ', phrase: false },
      { text: 'Mars', phrase: true, isTarget: true, phraseId: 'mars' },
      { text: '. It is known as the Red Planet and has a landscape full of craters and extinct volcanoes. Rovers use advanced ', phrase: false },
      { text: 'Telescope Lenses', phrase: true, isTarget: false, phraseId: 'd_telescope' },
      { text: ' and cameras to study its rocky surface.', phrase: false }
    ],
  },
  {
    id: 'p3',
    segments: [
      { text: 'Beyond the inner planets lies the largest planet in our solar system, ', phrase: false },
      { text: 'Jupiter', phrase: true, isTarget: true, phraseId: 'jupiter' },
      { text: '. It is a massive gas giant famous for a swirling storm called the Great Red Spot. Between the inner and outer planets sits the ', phrase: false },
      { text: 'Asteroid Belt', phrase: true, isTarget: false, phraseId: 'd_asteroid_belt' },
      { text: ', a thick ring of rocky debris.', phrase: false }
    ],
  },
  {
    id: 'p4',
    segments: [
      { text: 'All planets and moons are kept in their steady orbits by an invisible force. This force is called ', phrase: false },
      { text: 'Gravity', phrase: true, isTarget: true, phraseId: 'gravity' },
      { text: '. Without it, planets would float away into deep, freezing space. It is the exact same pull that causes a ', phrase: false },
      { text: 'Meteor Shower', phrase: true, isTarget: false, phraseId: 'd_meteor' },
      { text: ' to fall toward our atmosphere.', phrase: false }
    ],
  },
  {
    id: 'p5',
    segments: [
      { text: 'Space exploration has taught us a lot about our neighborhood. Sometimes, a freezing ', phrase: false },
      { text: 'Comet', phrase: true, isTarget: false, phraseId: 'd_comet' },
      { text: ' will streak across the sky, leaving a glowing trail of ice and dust behind it. Even though space is dangerous, learning about it helps us understand our own world.', phrase: false }
    ],
  }
];

const TRUE_TARGETS = new Set(['milky_way', 'sun', 'mars', 'jupiter', 'gravity']);

const CLUTTER_SIDEBAR = [
  '🚀 Fun Fact: A day on Venus is longer than an entire year on Venus!',
  '🌌 Did you know? Space is completely silent because there is no air.',
  '⭐ The closest star to Earth (besides our Sun) is Proxima Centauri.',
  '🌕 Neil Armstrong was the very first person to walk on the moon in 1969.',
];

const LUMA_TEXT = `Luma Crystals are synthetic energy structures developed for high-density power storage. Each crystal contains three primary components that work together to capture, channel, and regulate energy flow.

The Core Chamber sits at the center of every Luma Crystal. It is a dense, spherical cavity where raw energy is compressed and stored. The Core Chamber can hold up to 4,700 terajoules of energy in a space smaller than a marble. Energy enters the Core Chamber through intake valves and is locked in place by a resonance field.

Photon Channels are thin, luminescent pathways that radiate outward from the Core Chamber like the spokes of a wheel. These channels carry energy from the Core Chamber to external devices. Each Luma Crystal contains between 12 and 36 Photon Channels, depending on its class. The channels glow faintly blue when active, indicating energy transfer is occurring.

Cooling Rings are concentric bands that encircle the Core Chamber. Their primary function is thermal regulation — they prevent the crystal from overheating during high-output energy transfer. Without Cooling Rings, the Core Chamber would reach critical temperatures within seconds and destabilize. Each Cooling Ring absorbs excess heat and redistributes it across the crystal surface as harmless infrared radiation.

The three components work in harmony: the Core Chamber stores energy, Photon Channels distribute it, and Cooling Rings keep the entire system thermally stable.`;

const LUMA_AUDIO_SCRIPT = `Picture a tiny glowing marble sitting in the palm of your hand. That marble is the Core Chamber of a Luma Crystal — the place where all energy is stored. It can hold an enormous amount of power, locked in place by a special resonance field.

Now imagine thin glowing lines stretching outward from that marble, like rays of light from a tiny sun. Those are the Photon Channels. They carry energy from the Core Chamber to whatever device needs power. When energy is flowing, the channels glow a soft blue color.

But here's the problem — all that energy creates heat. A lot of heat. That's where the Cooling Rings come in. They wrap around the Core Chamber in layers, like the rings of a tree trunk. Their job is to absorb the excess heat before the crystal overheats. They convert that heat into harmless infrared radiation that spreads across the surface.

So to summarize: the Core Chamber stores the energy, the Photon Channels move it where it needs to go, and the Cooling Rings make sure nothing melts in the process. All three parts must work together for the crystal to function safely.`;

const QUIZ_QUESTIONS = [
  { q: 'Where is energy stored in a Luma Crystal?', options: ['Cooling Ring', 'Core Chamber', 'Photon Channel', 'Reactor Pod'], answer: 1 },
  { q: 'What is the function of Photon Channels?', options: ['Store energy', 'Regulate temperature', 'Distribute energy to devices', 'Generate resonance'], answer: 2 },
  { q: 'What do Cooling Rings prevent?', options: ['Energy loss', 'Light emission', 'Crystal overheating', 'Channel blockage'], answer: 2 },
];

const ANALOGY_QUESTIONS = [
  { prompt: 'Atom is to Solar System as...', options: ['Nucleus is to Sun', 'Electron is to Planet mass', 'Proton is to Comet', 'Neutron is to Asteroid belt'], answer: 0 },
  { prompt: 'DNA is to Blueprint as...', options: ['Cell is to Building', 'Gene is to Instruction', 'Protein is to Architect', 'Chromosome is to Foundation'], answer: 1 },
  { prompt: 'Electric Current is to Water Flow as...', options: ['Voltage is to Water Pressure', 'Resistance is to Pipe Color', 'Ampere is to Water Temperature', 'Circuit is to Ocean'], answer: 0 },
];

const SYMBOL_QUESTIONS_NORMAL = [
  { prompt: 'Which sequence matches: ★ ▲ ■ ◆ ?', options: ['★ ▲ ■ ◆', '▲ ★ ◆ ■', '■ ◆ ★ ▲', '◆ ■ ▲ ★'], answer: 0 },
  { prompt: 'Which sequence matches: ◯ ✦ △ ▢ ?', options: ['✦ ◯ ▢ △', '◯ ✦ ▢ △', '◯ ✦ △ ▢', '△ ▢ ◯ ✦'], answer: 2 },
];

const SYMBOL_QUESTIONS_REWARD = [
  { prompt: 'Which sequence matches: ▼ ◇ ● ✖ ?', options: ['◇ ▼ ✖ ●', '▼ ◇ ● ✖', '● ✖ ▼ ◇', '✖ ● ◇ ▼'], answer: 1 },
  { prompt: 'Which sequence matches: ✚ ⬟ ◈ ▶ ?', options: ['⬟ ✚ ▶ ◈', '✚ ◈ ⬟ ▶', '✚ ⬟ ◈ ▶', '▶ ◈ ⬟ ✚'], answer: 2 },
];

function getRestartCount() {
  try {
    return parseInt(sessionStorage.getItem('lumyn_assessment_restarts') || '0', 10);
  } catch { return 0; }
}

function incrementRestartCount() {
  try {
    const c = getRestartCount() + 1;
    sessionStorage.setItem('lumyn_assessment_restarts', String(c));
    return c;
  } catch { return 0; }
}

function LumaCrystalSVG({ onInteraction }) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const interactionsRef = useRef(0);

  const handleClick = (e) => {
    e.stopPropagation();
    interactionsRef.current++;
    if (onInteraction) onInteraction(interactionsRef.current);
  };

  const handleZoomIn = (e) => {
    e.stopPropagation();
    setZoomLevel(z => Math.min(z + 0.25, 2));
    interactionsRef.current++;
    if (onInteraction) onInteraction(interactionsRef.current, zoomLevel + 0.25 > zoomLevel ? 1 : 0);
  };

  const handleZoomOut = (e) => {
    e.stopPropagation();
    setZoomLevel(z => Math.max(z - 0.25, 0.5));
    interactionsRef.current++;
    if (onInteraction) onInteraction(interactionsRef.current, 0);
  };

  return (
    <div data-interactive="true">
      <div className="flex gap-2 mb-3">
        <button data-interactive="true" onClick={handleZoomIn} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700">Zoom In +</button>
        <button data-interactive="true" onClick={handleZoomOut} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700">Zoom Out −</button>
        <span className="text-xs text-slate-400 self-center ml-2">{Math.round(zoomLevel * 100)}%</span>
      </div>
      <div className="overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-4" style={{ maxHeight: '500px' }}>
        <svg viewBox="0 0 500 520" width={500 * zoomLevel} height={520 * zoomLevel} onClick={handleClick} className="cursor-pointer mx-auto block">
          <defs>
            <radialGradient id="coreGrad" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#fbbf24" /><stop offset="60%" stopColor="#f59e0b" /><stop offset="100%" stopColor="#d97706" /></radialGradient>
            <radialGradient id="ring1" cx="50%" cy="50%" r="50%"><stop offset="70%" stopColor="transparent" /><stop offset="80%" stopColor="#7dd3fc" stopOpacity="0.25" /><stop offset="100%" stopColor="#38bdf8" stopOpacity="0.1" /></radialGradient>
            <radialGradient id="ring2" cx="50%" cy="50%" r="50%"><stop offset="70%" stopColor="transparent" /><stop offset="80%" stopColor="#93c5fd" stopOpacity="0.2" /><stop offset="100%" stopColor="#60a5fa" stopOpacity="0.08" /></radialGradient>
            <radialGradient id="ring3" cx="50%" cy="50%" r="50%"><stop offset="70%" stopColor="transparent" /><stop offset="80%" stopColor="#a5b4fc" stopOpacity="0.15" /><stop offset="100%" stopColor="#818cf8" stopOpacity="0.06" /></radialGradient>
            <linearGradient id="channelGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#60a5fa" stopOpacity="0.4" /></linearGradient>
          </defs>

          <circle cx="250" cy="220" r="180" fill="url(#ring3)" stroke="#818cf8" strokeWidth="2" strokeDasharray="8 4" opacity="0.7" />
          <text x="250" y="52" textAnchor="middle" fill="#818cf8" fontSize="11" fontWeight="600">Cooling Ring 3</text>

          <circle cx="250" cy="220" r="135" fill="url(#ring2)" stroke="#60a5fa" strokeWidth="2" strokeDasharray="6 3" opacity="0.8" />
          <text x="395" y="130" textAnchor="start" fill="#60a5fa" fontSize="11" fontWeight="600">Cooling Ring 2</text>

          <circle cx="250" cy="220" r="90" fill="url(#ring1)" stroke="#38bdf8" strokeWidth="2" opacity="0.9" />
          <text x="105" y="155" textAnchor="end" fill="#38bdf8" fontSize="11" fontWeight="600">Cooling Ring 1</text>

          <circle cx="250" cy="220" r="42" fill="url(#coreGrad)" stroke="#b45309" strokeWidth="2.5" />
          <text x="250" y="215" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">CORE</text>
          <text x="250" y="230" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="600">CHAMBER</text>
          <text x="250" y="244" textAnchor="middle" fill="#fef3c7" fontSize="8">4,700 TJ</text>

          <line x1="250" y1="262" x2="250" y2="440" stroke="url(#channelGrad)" strokeWidth="3" />
          <polygon points="250,450 243,435 257,435" fill="#3b82f6" />
          <rect x="220" y="455" width="60" height="24" rx="4" fill="#1e40af" />
          <text x="250" y="471" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="600">Device 1</text>

          <line x1="212" y1="245" x2="100" y2="410" stroke="url(#channelGrad)" strokeWidth="3" />
          <polygon points="95,418 88,403 103,405" fill="#3b82f6" />
          <rect x="62" y="422" width="60" height="24" rx="4" fill="#1e40af" />
          <text x="92" y="438" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="600">Device 2</text>

          <line x1="288" y1="245" x2="400" y2="410" stroke="url(#channelGrad)" strokeWidth="3" />
          <polygon points="405,418 397,405 412,403" fill="#3b82f6" />
          <rect x="378" y="422" width="60" height="24" rx="4" fill="#1e40af" />
          <text x="408" y="438" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="600">Device 3</text>

          <text x="170" y="360" fill="#3b82f6" fontSize="10" fontWeight="600" transform="rotate(-55 170 360)">Photon Channel</text>
          <text x="280" y="360" fill="#3b82f6" fontSize="10" fontWeight="600" transform="rotate(55 310 360)">Photon Channel</text>
          <text x="258" y="365" fill="#3b82f6" fontSize="10" fontWeight="600">Photon Channel</text>

          <rect x="10" y="490" width="480" height="26" rx="6" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />
          <text x="250" y="508" textAnchor="middle" fill="#475569" fontSize="10" fontWeight="600">Core Chamber → Photon Channels → Devices | Cooling Rings regulate heat → IR radiation</text>
        </svg>
      </div>
    </div>
  );
}

function AudioPlayer({ script, onTelemetry }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playCount, setPlayCount] = useState(0);
  const utteranceRef = useRef(null);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(0);
  const estimatedDurationRef = useRef(0);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handlePlay = () => {
    if (isPlaying) return;
    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(script);
    utter.rate = 0.95;
    utter.pitch = 1;
    utter.volume = 1;
    utteranceRef.current = utter;

    const words = script.split(/\s+/).length;
    estimatedDurationRef.current = (words / 2.5) * 1000;
    startTimeRef.current = Date.now();

    utter.onend = () => {
      setIsPlaying(false);
      setProgress(100);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (onTelemetry) onTelemetry({ completed: true, playCount: playCount + 1, percent: 100 });
    };

    utter.onerror = () => {
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };

    window.speechSynthesis.speak(utter);
    setIsPlaying(true);
    setPlayCount(c => c + 1);
    if (onTelemetry) onTelemetry({ completed: false, playCount: playCount + 1, percent: 0 });

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(100, (elapsed / estimatedDurationRef.current) * 100);
      setProgress(pct);
    }, 200);
  };

  const handlePause = () => {
    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(100, (elapsed / estimatedDurationRef.current) * 100);
      if (onTelemetry) onTelemetry({ completed: false, playCount, percent: Math.round(pct) });
    } else if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      startTimeRef.current = Date.now() - (estimatedDurationRef.current * progress / 100);
      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        const pct = Math.min(100, (elapsed / estimatedDurationRef.current) * 100);
        setProgress(pct);
      }, 200);
    }
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    const pct = progress;
    setProgress(0);
    if (onTelemetry) onTelemetry({ completed: false, playCount, percent: Math.round(pct) });
  };

  return (
    <div data-interactive="true" className="space-y-4">
      <div className="flex items-center gap-3">
        <button data-interactive="true" onClick={handlePlay} className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all shadow-md"><Play className="w-5 h-5" /></button>
        <button data-interactive="true" onClick={handlePause} className="p-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-full transition-all"><Pause className="w-5 h-5" /></button>
        <button data-interactive="true" onClick={handleStop} className="p-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-full transition-all"><Square className="w-4 h-4" /></button>
        <span className="text-sm text-slate-500 ml-2">{isPlaying ? '🔊 Playing...' : progress >= 100 ? '✅ Completed' : '⏸ Ready'}</span>
        <span className="text-xs text-slate-400 ml-auto">Plays: {playCount}</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2.5">
        <div className="bg-blue-500 h-2.5 rounded-full transition-all duration-200" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
}

function ConfettiBurst() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i, left: Math.random() * 100, delay: Math.random() * 0.3, duration: 0.8 + Math.random() * 0.6,
    color: ['#fbbf24', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#10b981'][Math.floor(Math.random() * 6)],
    size: 4 + Math.random() * 6, rotation: Math.random() * 360,
  }));
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute', left: `${p.left}%`, top: '-10px',
          width: `${p.size}px`, height: `${p.size}px`,
          backgroundColor: p.color, borderRadius: p.size > 7 ? '50%' : '1px',
          transform: `rotate(${p.rotation}deg)`,
          animation: `confettiFall ${p.duration}s ease-in ${p.delay}s forwards`,
        }} />
      ))}
      <style>{`@keyframes confettiFall { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }`}</style>
    </div>
  );
}

function XpPopup({ amount }) {
  return (
    <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
      <div style={{ animation: 'xpFloat 1.2s ease-out forwards' }} className="text-4xl font-extrabold text-amber-500 drop-shadow-lg">+{amount} XP</div>
      <style>{`@keyframes xpFloat { 0% { transform: translateY(0) scale(0.5); opacity: 0; } 30% { transform: translateY(-20px) scale(1.2); opacity: 1; } 100% { transform: translateY(-80px) scale(1); opacity: 0; } }`}</style>
    </div>
  );
}

export default function AssessmentEngine({ onComplete, currentUser }) {
  const [phase, setPhase] = useState('login');
  const [studentName, setStudentName] = useState('');

  const telemetryRef = useRef({
    assessmentStartTime: 0,
    totalClicks: 0,
    erraticClicks: 0,
    idleEvents: 0,
    completedActivities: 0,
    requiredActivities: 3,
    totalTime: 0,
    windowBlurCount: 0,
    windowFocusCount: 0,
    assessmentRestarts: getRestartCount(),

    activity1: {
      tInit: 0, tClean: 0, tClutter: 0,
      wrongClicksClean: 0, wrongClicksClutter: 0,
      scrollBacks: 0, rereads: 0, activity1Speed: 0,
      paragraphViewTime: 0, uniqueParagraphsViewed: 0,
    },
    activity2: {
      firstChoice: '', tText: 0, tVisual: 0, tAudio: 0,
      tabSwitches: 0, recallCorrect: 0, recallTotal: 3,
      audioStarted: false, audioCompleted: false, audioPlayCount: 0, audioCompletionPercent: 0,
      diagramZooms: 0, diagramInteractions: 0,
      averageResponseTime: 0, questionHesitationTime: [],
    },
    activity3: {
      correctAnalogies: 0, speedBase: 0, speedReward: 0, activity3Speed: 0,
      averageResponseTime: 0, questionHesitationTime: [],
    },
  });

  const erraticRef = useRef({
    lastClickX: -1, lastClickY: -1, lastClickTime: 0,
    sameLocationCount: 0, rapidClickTimestamps: [],
  });

  const idleTimerRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  const resetIdleTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      telemetryRef.current.idleEvents++;
      resetIdleTimer();
    }, IDLE_THRESHOLD);
  }, []);

  useEffect(() => {
    const events = ['mousemove', 'touchmove', 'keydown', 'mousedown'];
    const handler = () => resetIdleTimer();
    events.forEach(e => window.addEventListener(e, handler, { passive: true }));
    resetIdleTimer();
    return () => {
      events.forEach(e => window.removeEventListener(e, handler));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [resetIdleTimer]);

  useEffect(() => {
    const onBlur = () => { telemetryRef.current.windowBlurCount++; };
    const onFocus = () => { telemetryRef.current.windowFocusCount++; };
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    return () => {
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  useEffect(() => {
    const onBeforeUnload = () => { incrementRestartCount(); };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  const handleGlobalClick = (e) => {
    telemetryRef.current.totalClicks++;
    const now = Date.now();
    const er = erraticRef.current;

    const tag = e.target.tagName;
    const isInteractive = ['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'A', 'LABEL', 'SVG', 'CIRCLE', 'LINE', 'TEXT', 'RECT', 'POLYGON'].includes(tag) ||
      e.target.closest('[data-interactive]') || e.target.dataset.interactive;

    const isWhitespace = e.target.classList.contains('min-h-screen') ||
      e.target.classList.contains('bg-slate-50') ||
      (!isInteractive && !e.target.closest('.bg-white'));

    if (isWhitespace) {
      telemetryRef.current.erraticClicks++;
    }

    const dx = Math.abs(e.clientX - er.lastClickX);
    const dy = Math.abs(e.clientY - er.lastClickY);
    if (dx < 10 && dy < 10 && (now - er.lastClickTime) < RAPID_CLICK_WINDOW) {
      er.sameLocationCount++;
      if (er.sameLocationCount >= 3) {
        telemetryRef.current.erraticClicks++;
        er.sameLocationCount = 0;
      }
    } else {
      er.sameLocationCount = 0;
    }

    er.rapidClickTimestamps.push(now);
    er.rapidClickTimestamps = er.rapidClickTimestamps.filter(t => now - t < RAPID_CLICK_WINDOW);
    if (er.rapidClickTimestamps.length >= RAPID_CLICK_THRESHOLD) {
      telemetryRef.current.erraticClicks++;
      er.rapidClickTimestamps = [];
    }

    er.lastClickX = e.clientX;
    er.lastClickY = e.clientY;
    er.lastClickTime = now;
  };

  const handleLogin = () => {
    if (!studentName.trim()) return;
    telemetryRef.current.assessmentStartTime = Date.now();
    telemetryRef.current.assessmentRestarts = getRestartCount();
    setPhase('activity1_clean');
  };

  const buildPayload = () => {
    const t = telemetryRef.current;
    t.totalTime = Date.now() - t.assessmentStartTime;
    return {
      studentId: currentUser?.id,
      activity1: {
        tClean: t.activity1.tClean,
        tClutter: t.activity1.tClutter,
        wrongClicksClean: t.activity1.wrongClicksClean,
        wrongClicksClutter: t.activity1.wrongClicksClutter,
        rereads: t.activity1.rereads,
        scrollBacks: t.activity1.scrollBacks,
        tInit: t.activity1.tInit,
        activity1Speed: t.activity1.activity1Speed,
        paragraphViewTime: t.activity1.paragraphViewTime,
        uniqueParagraphsViewed: t.activity1.uniqueParagraphsViewed,
      },
      activity2: {
        firstChoice: t.activity2.firstChoice,
        tText: t.activity2.tText,
        tVisual: t.activity2.tVisual,
        tAudio: t.activity2.tAudio,
        tabSwitches: t.activity2.tabSwitches,
        recallCorrect: t.activity2.recallCorrect,
        recallTotal: 3,
        audioStarted: t.activity2.audioStarted,
        audioCompleted: t.activity2.audioCompleted,
        audioPlayCount: t.activity2.audioPlayCount,
        audioCompletionPercent: t.activity2.audioCompletionPercent,
        diagramZooms: t.activity2.diagramZooms,
        diagramInteractions: t.activity2.diagramInteractions,
        averageResponseTime: t.activity2.averageResponseTime,
        questionHesitationTime: t.activity2.questionHesitationTime,
      },
      activity3: {
        correctAnalogies: t.activity3.correctAnalogies,
        speedBase: t.activity3.speedBase,
        speedReward: t.activity3.speedReward,
        activity3Speed: t.activity3.activity3Speed,
        averageResponseTime: t.activity3.averageResponseTime,
        questionHesitationTime: t.activity3.questionHesitationTime,
      },
      global: {
        totalTime: t.totalTime,
        totalClicks: t.totalClicks,
        idleEvents: t.idleEvents,
        erraticClicks: t.erraticClicks,
        completedActivities: t.completedActivities,
        requiredActivities: t.requiredActivities,
        windowBlurCount: t.windowBlurCount,
        windowFocusCount: t.windowFocusCount,
        assessmentRestarts: t.assessmentRestarts,
      },
    };
  };

  const submitTelemetry = async () => {
    setPhase('analyzing');
    const payload = buildPayload();
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error('Telemetry submission failed:', err);
    }
    setTimeout(() => setPhase('success'), 2500);
  };

  if (phase === 'login') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6" onClick={handleGlobalClick}>
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 p-3 rounded-xl"><BrainCircuit className="w-7 h-7 text-white" /></div>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 text-center mb-1">LumynMinds Assessment</h1>
          <p className="text-sm text-slate-500 text-center mb-8">Cognitive Profile Calibration — Grades 8–10</p>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Your Name</label>
          <input type="text" value={studentName} onChange={e => setStudentName(e.target.value)}
            placeholder="Enter your name" data-interactive="true"
            className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-6"
            onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          <button onClick={handleLogin} disabled={!studentName.trim()} data-interactive="true"
            className={`w-full py-3 rounded-xl font-semibold text-white transition-all ${studentName.trim() ? 'bg-blue-600 hover:bg-blue-700 shadow-md' : 'bg-slate-300 cursor-not-allowed'}`}>
            Begin Assessment
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'activity1_clean') {
    return <Activity1Phase key="clean" title="Information Retrieval — Clean Layout"
      paragraphs={SHARED_PARAGRAPHS} isCluttered={false} onGlobalClick={handleGlobalClick}
      onComplete={(data) => {
        const t = telemetryRef.current;
        t.activity1.tClean = data.tTime;
        t.activity1.wrongClicksClean = data.wrongClicks;
        t.activity1.tInit = data.tInit;
        t.activity1.paragraphViewTime = data.paragraphViewTime;
        t.activity1.uniqueParagraphsViewed = data.uniqueParagraphsViewed;
        setPhase('activity1_clutter');
      }} />;
  }

  if (phase === 'activity1_clutter') {
    return <Activity1Phase key="clutter" title="Information Retrieval — Cluttered Layout"
      paragraphs={SHARED_PARAGRAPHS} isCluttered={true} onGlobalClick={handleGlobalClick}
      onComplete={(data) => {
        const t = telemetryRef.current;
        t.activity1.tClutter = data.tTime;
        t.activity1.wrongClicksClutter = data.wrongClicks;
        t.activity1.scrollBacks = data.scrollBacks;
        t.activity1.rereads = data.rereads;
        t.activity1.activity1Speed = data.tTime > 0 ? (REQUIRED_TARGETS / (data.tTime / 1000)) : 0;
        t.completedActivities++;
        setPhase('activity2');
      }} />;
  }

  if (phase === 'activity2') {
    return <Activity2 onGlobalClick={handleGlobalClick}
      onComplete={(data) => {
        const t = telemetryRef.current;
        t.activity2.firstChoice = data.firstChoice;
        t.activity2.tText = data.tText;
        t.activity2.tVisual = data.tVisual;
        t.activity2.tAudio = data.tAudio;
        t.activity2.tabSwitches = data.tabSwitches;
        t.activity2.recallCorrect = data.recallCorrect;
        t.activity2.recallTotal = 3;
        t.activity2.audioStarted = data.audioStarted;
        t.activity2.audioCompleted = data.audioCompleted;
        t.activity2.audioPlayCount = data.audioPlayCount;
        t.activity2.audioCompletionPercent = data.audioCompletionPercent;
        t.activity2.diagramZooms = data.diagramZooms;
        t.activity2.diagramInteractions = data.diagramInteractions;
        t.activity2.averageResponseTime = data.averageResponseTime;
        t.activity2.questionHesitationTime = data.questionHesitationTime;
        t.completedActivities++;
        setPhase('activity3');
      }} />;
  }

  if (phase === 'activity3') {
    return <Activity3 onGlobalClick={handleGlobalClick}
      onComplete={(data) => {
        const t = telemetryRef.current;
        t.activity3.correctAnalogies = data.correctAnalogies;
        t.activity3.speedBase = data.speedBase;
        t.activity3.speedReward = data.speedReward;
        t.activity3.activity3Speed = data.activity3Speed;
        t.activity3.averageResponseTime = data.averageResponseTime;
        t.activity3.questionHesitationTime = data.questionHesitationTime;
        t.completedActivities++;
        submitTelemetry();
      }} />;
  }

  if (phase === 'analyzing') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6" onClick={handleGlobalClick}>
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Analyzing Cognitive Profile...</h2>
          <p className="text-slate-500 font-medium">Processing behavioral telemetry through neural assessment pipeline.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6" onClick={handleGlobalClick}>
      <div className="text-center max-w-md">
        <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
        <h2 className="text-3xl font-extrabold text-slate-800 mb-3">Assessment Complete</h2>
        <p className="text-slate-500 font-medium mb-8">Your personalized learning profile has been generated.</p>
        <button data-interactive="true" onClick={() => {
          if (onComplete) { onComplete(buildPayload()); }
          else { try { window.location.href = '/student-dashboard'; } catch (_) { /* noop */ } }
        }} className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition-all inline-flex items-center gap-2">
          Continue Learning <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}


function Activity1Phase({ title, paragraphs, isCluttered, onGlobalClick, onComplete }) {
  const [found, setFound] = useState([]);
  const [wrongClicks, setWrongClicks] = useState(0);
  const [tooFastMsg, setTooFastMsg] = useState(false);
  const startRef = useRef(Date.now());
  const firstClickRef = useRef(0);
  const scrollBacksRef = useRef(0);
  const rereadsRef = useRef(0);
  const viewedRef = useRef(new Set());
  const containerRef = useRef(null);
  const paraViewStartRef = useRef({});
  const totalParaViewTimeRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isCluttered) return;
    let lastScroll = container.scrollTop;
    const handleScroll = () => {
      const current = container.scrollTop;
      if (lastScroll - current > 150) scrollBacksRef.current++;
      lastScroll = current;
    };
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isCluttered]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = entry.target.dataset.paraId;
        if (entry.isIntersecting) {
          if (viewedRef.current.has(id)) {
            if (isCluttered) rereadsRef.current++;
          } else {
            viewedRef.current.add(id);
          }
          paraViewStartRef.current[id] = Date.now();
        } else {
          if (paraViewStartRef.current[id]) {
            totalParaViewTimeRef.current += Date.now() - paraViewStartRef.current[id];
            delete paraViewStartRef.current[id];
          }
        }
      });
    }, { threshold: 0.5 });
    const paras = containerRef.current?.querySelectorAll('[data-para-id]');
    paras?.forEach(p => observer.observe(p));
    return () => observer.disconnect();
  }, [isCluttered]);

  const tryComplete = (newFound) => {
    const elapsed = Date.now() - startRef.current;
    if (elapsed < MIN_READING_TIME) {
      setTooFastMsg(true);
      setTimeout(() => setTooFastMsg(false), 3000);
      return;
    }
    Object.keys(paraViewStartRef.current).forEach(id => {
      totalParaViewTimeRef.current += Date.now() - paraViewStartRef.current[id];
    });
    onComplete({
      tTime: elapsed,
      wrongClicks,
      tInit: firstClickRef.current,
      scrollBacks: scrollBacksRef.current,
      rereads: rereadsRef.current,
      paragraphViewTime: totalParaViewTimeRef.current,
      uniqueParagraphsViewed: viewedRef.current.size,
    });
  };

  const handlePhraseClick = (seg) => {
    if (found.includes(seg.phraseId)) return;
    if (seg.isTarget) {
      if (firstClickRef.current === 0) firstClickRef.current = Date.now() - startRef.current;
      const newFound = [...found, seg.phraseId];
      setFound(newFound);
      if (newFound.length === REQUIRED_TARGETS) tryComplete(newFound);
    } else {
      setWrongClicks(w => w + 1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6" onClick={onGlobalClick}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          <p className="text-sm text-slate-500 mt-1">Read the passage carefully and click on the <span className="font-semibold text-blue-600">{REQUIRED_TARGETS} key terms</span> related to space and the solar system.</p>
          <div className="mt-3 flex items-center gap-3">
            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">{found.length} / {REQUIRED_TARGETS} Found</span>
            {tooFastMsg && <span className="text-amber-600 text-sm font-medium animate-pulse">Please continue reading before submitting.</span>}
          </div>
        </div>

        <div className={isCluttered ? 'grid grid-cols-1 lg:grid-cols-4 gap-4' : ''}>
          <div ref={containerRef} className={`bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4 ${isCluttered ? 'lg:col-span-3 max-h-[70vh] overflow-y-auto' : ''}`}>
            {paragraphs.map((para) => (
              <p key={para.id} data-para-id={para.id} data-interactive="true"
                className="text-base leading-relaxed p-3 rounded-xl border border-transparent select-none">
                {para.segments.map((seg, si) => {
                  if (seg.phrase) {
                    const isFound = found.includes(seg.phraseId);
                    const isWrong = !seg.isTarget && found.includes(seg.phraseId);
                    return (
                      <span key={si} data-interactive="true"
                        onClick={(e) => { e.stopPropagation(); handlePhraseClick(seg); }}
                        className={`cursor-pointer ${isFound && seg.isTarget ? 'underline decoration-2 decoration-green-500' : ''} ${isWrong ? 'line-through text-red-400' : ''}`}>
                        {seg.text}
                      </span>
                    );
                  }
                  return <span key={si}>{seg.text}</span>;
                })}
              </p>
            ))}
          </div>

          {isCluttered && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <h4 className="text-sm font-bold text-amber-700 mb-2">🐠 Did You Know?</h4>
                {CLUTTER_SIDEBAR.map((fact, i) => (<p key={i} className="text-xs text-amber-600 mb-1.5">{fact}</p>))}
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4">
                <h4 className="text-sm font-bold text-purple-700 mb-2">📊 Ocean Stats</h4>
                <p className="text-xs text-purple-600">Average depth: 3,688m</p>
                <p className="text-xs text-purple-600">Deepest point: 10,994m</p>
                <p className="text-xs text-purple-600">Volume: 1.335 billion km³</p>
              </div>
              <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-4">
                <h4 className="text-sm font-bold text-cyan-700 mb-2">🔬 Featured Research</h4>
                <p className="text-xs text-cyan-600">Woods Hole Oceanographic Institution recently discovered 12 new species near the Galápagos Rift hydrothermal vent field.</p>
              </div>
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4">
                <h4 className="text-sm font-bold text-rose-700 mb-2">🌡️ Temperature Facts</h4>
                <p className="text-xs text-rose-600">Surface: 17°C average</p>
                <p className="text-xs text-rose-600">Deep sea: 0–3°C</p>
                <p className="text-xs text-rose-600">Hydrothermal vents: up to 400°C</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 animate-pulse">
                <h4 className="text-sm font-bold text-emerald-700 mb-1">📢 Sponsored</h4>
                <p className="text-xs text-emerald-600">OceanVR™ — Explore the deep sea in virtual reality. Download free on App Store.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


function Activity2({ onGlobalClick, onComplete }) {
  const [activeTab, setActiveTab] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState([null, null, null]);
  const [quizDone, setQuizDone] = useState(false);
  const [canQuiz, setCanQuiz] = useState(false);
  const [countdown, setCountdown] = useState(15);

  const tabEntryRef = useRef(0);
  const timesRef = useRef({ tText: 0, tVisual: 0, tAudio: 0 });
  const switchesRef = useRef(0);
  const firstChoiceRef = useRef('');
  const audioTelemetryRef = useRef({ started: false, completed: false, playCount: 0, percent: 0 });
  const diagramTelemetryRef = useRef({ zooms: 0, interactions: 0 });
  const quizTimesRef = useRef([]);
  const quizQuestionStartRef = useRef(0);

  useEffect(() => {
    if (countdown <= 0) { setCanQuiz(true); return; }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const accumulateTime = () => {
    if (!activeTab || tabEntryRef.current === 0) return;
    const elapsed = Date.now() - tabEntryRef.current;
    if (activeTab === 'text') timesRef.current.tText += elapsed;
    if (activeTab === 'diagram') timesRef.current.tVisual += elapsed;
    if (activeTab === 'audio') timesRef.current.tAudio += elapsed;
  };

  const switchTab = (tab) => {
    accumulateTime();
    if (!firstChoiceRef.current) firstChoiceRef.current = tab;
    if (activeTab && tab !== activeTab) switchesRef.current++;
    setActiveTab(tab);
    tabEntryRef.current = Date.now();
  };

  const handleAudioTelemetry = (data) => {
    if (data.playCount > 0) audioTelemetryRef.current.started = true;
    if (data.completed) audioTelemetryRef.current.completed = true;
    audioTelemetryRef.current.playCount = data.playCount;
    audioTelemetryRef.current.percent = Math.max(audioTelemetryRef.current.percent, data.percent);
  };

  const handleDiagramInteraction = (interactions, zoomDelta) => {
    diagramTelemetryRef.current.interactions = interactions;
    if (zoomDelta) diagramTelemetryRef.current.zooms++;
  };

  const handleQuizAnswer = (qIndex, optIndex) => {
    if (quizQuestionStartRef.current > 0) {
      quizTimesRef.current.push(Date.now() - quizQuestionStartRef.current);
    }
    const newAnswers = [...quizAnswers];
    newAnswers[qIndex] = optIndex;
    setQuizAnswers(newAnswers);
    quizQuestionStartRef.current = Date.now();
  };

  const submitQuiz = () => {
    accumulateTime();
    let correct = 0;
    QUIZ_QUESTIONS.forEach((q, i) => { if (quizAnswers[i] === q.answer) correct++; });
    setQuizDone(true);
    const avgResp = quizTimesRef.current.length > 0 ? quizTimesRef.current.reduce((a, b) => a + b, 0) / quizTimesRef.current.length : 0;
    setTimeout(() => {
      onComplete({
        firstChoice: firstChoiceRef.current,
        tText: timesRef.current.tText,
        tVisual: timesRef.current.tVisual,
        tAudio: timesRef.current.tAudio,
        tabSwitches: switchesRef.current,
        recallCorrect: correct,
        audioStarted: audioTelemetryRef.current.started,
        audioCompleted: audioTelemetryRef.current.completed,
        audioPlayCount: audioTelemetryRef.current.playCount,
        audioCompletionPercent: audioTelemetryRef.current.percent,
        diagramZooms: diagramTelemetryRef.current.zooms,
        diagramInteractions: diagramTelemetryRef.current.interactions,
        averageResponseTime: avgResp,
        questionHesitationTime: quizTimesRef.current,
      });
    }, 1000);
  };

  const tabClass = (tab) => `flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
    activeTab === tab ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
  }`;

  if (showQuiz) {
    if (quizQuestionStartRef.current === 0) quizQuestionStartRef.current = Date.now();
    return (
      <div className="min-h-screen bg-slate-50 p-6" onClick={onGlobalClick}>
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-slate-800 mb-1">Recall Quiz — Luma Crystal Energy System</h2>
          <p className="text-sm text-slate-500 mb-6">Answer from memory. No going back to the content.</p>
          <div className="space-y-5">
            {QUIZ_QUESTIONS.map((q, qi) => (
              <div key={qi} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <p className="font-semibold text-slate-800 mb-3">{qi + 1}. {q.q}</p>
                <div className="grid grid-cols-2 gap-2">
                  {q.options.map((opt, oi) => (
                    <button key={oi} data-interactive="true" onClick={() => handleQuizAnswer(qi, oi)}
                      className={`py-2.5 px-4 rounded-xl text-sm font-medium transition-all text-left ${
                        quizAnswers[qi] === oi ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}>{opt}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button data-interactive="true" onClick={submitQuiz}
            disabled={quizAnswers.includes(null) || quizDone}
            className={`w-full mt-6 py-3 rounded-xl font-semibold text-white transition-all ${
              quizAnswers.includes(null) || quizDone ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md'
            }`}>{quizDone ? 'Submitted ✓' : 'Submit Answers'}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6" onClick={onGlobalClick}>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-xl font-bold text-slate-800 mb-1">Modality Preference Challenge</h2>
        <p className="text-sm text-slate-500 mb-5">Explore the Luma Crystal Energy System using your preferred format. You'll be quizzed from memory.</p>

        <div className="flex gap-2 mb-5">
          <button data-interactive="true" onClick={() => switchTab('text')} className={tabClass('text')}><BookOpen className="w-4 h-4" /> Text</button>
          <button data-interactive="true" onClick={() => switchTab('diagram')} className={tabClass('diagram')}><Eye className="w-4 h-4" /> Diagram</button>
          <button data-interactive="true" onClick={() => switchTab('audio')} className={tabClass('audio')}><Headphones className="w-4 h-4" /> Audio</button>
        </div>

        {!activeTab && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Select a tab above to begin learning about the Luma Crystal Energy System.</p>
          </div>
        )}

        {activeTab === 'text' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-3">📖 Luma Crystal Energy System - Text</h3>
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{LUMA_TEXT}</div>
          </div>
        )}

        {activeTab === 'diagram' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-3">🔬 Luma Crystal Energy System — Diagram</h3>
            <LumaCrystalSVG onInteraction={handleDiagramInteraction} />
          </div>
        )}

        {activeTab === 'audio' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-3">🎧 Luma Crystal Energy System — Audio</h3>
            <AudioPlayer script={LUMA_AUDIO_SCRIPT} onTelemetry={handleAudioTelemetry} />
            <div className="mt-4 bg-slate-50 rounded-xl p-4 border border-slate-200">
              <p className="text-xs text-slate-400 italic">Listen to the narration using the player above. Focus on understanding the three key components.</p>
            </div>
          </div>
        )}

        {activeTab && (
          <button data-interactive="true" onClick={() => { accumulateTime(); setShowQuiz(true); }}
            disabled={!canQuiz}
            className={`w-full mt-5 py-3 rounded-xl font-semibold text-white transition-all ${
              canQuiz ? 'bg-blue-600 hover:bg-blue-700 shadow-md' : 'bg-slate-300 cursor-not-allowed'
            }`}>{canQuiz ? 'Take Quiz' : `Study for ${countdown}s more before quiz`}</button>
        )}
      </div>
    </div>
  );
}


function Activity3({ onGlobalClick, onComplete }) {
  const [subPhase, setSubPhase] = useState('analogies');
  const [analogyIndex, setAnalogyIndex] = useState(0);
  const [correctAnalogies, setCorrectAnalogies] = useState(0);

  const [motivationRound, setMotivationRound] = useState('normal');
  const [mQuestionIndex, setMQuestionIndex] = useState(0);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showXpPopup, setShowXpPopup] = useState(false);
  const [showBadge, setShowBadge] = useState(null);

  const normalTimesRef = useRef([]);
  const rewardTimesRef = useRef([]);
  const questionStartRef = useRef(Date.now());
  const activityStartRef = useRef(Date.now());
  const totalQuestionsRef = useRef(0);
  const allHesitationRef = useRef([]);
  const analogyStartRef = useRef(Date.now());

  useEffect(() => {
    activityStartRef.current = Date.now();
    analogyStartRef.current = Date.now();
  }, []);

  const handleAnalogyAnswer = (optIndex) => {
    const hesitation = Date.now() - analogyStartRef.current;
    allHesitationRef.current.push(hesitation);
    if (optIndex === ANALOGY_QUESTIONS[analogyIndex].answer) {
      setCorrectAnalogies(c => c + 1);
    }
    totalQuestionsRef.current++;
    if (analogyIndex < 2) {
      setAnalogyIndex(i => i + 1);
      analogyStartRef.current = Date.now();
    } else {
      setSubPhase('motivation_intro');
    }
  };

  const startMotivation = () => {
    questionStartRef.current = Date.now();
    setSubPhase('motivation');
  };

  const questions = motivationRound === 'normal' ? SYMBOL_QUESTIONS_NORMAL : SYMBOL_QUESTIONS_REWARD;

  const handleMotivationAnswer = (optIndex) => {
    const elapsed = Date.now() - questionStartRef.current;
    allHesitationRef.current.push(elapsed);
    totalQuestionsRef.current++;

    if (motivationRound === 'normal') {
      normalTimesRef.current.push(elapsed);
    } else {
      rewardTimesRef.current.push(elapsed);
      const isCorrect = optIndex === questions[mQuestionIndex].answer;
      if (isCorrect) {
        setXp(x => x + 50);
        setStreak(s => s + 1);
        setShowXpPopup(true);
        setTimeout(() => setShowXpPopup(false), 1200);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 1500);
        if (mQuestionIndex === 0) { setShowBadge('streak'); setTimeout(() => setShowBadge(null), 2000); }
        if (mQuestionIndex === questions.length - 1) { setShowBadge('level'); setTimeout(() => setShowBadge(null), 2000); }
      } else {
        setStreak(0);
      }
    }

    if (mQuestionIndex < questions.length - 1) {
      setMQuestionIndex(i => i + 1);
      questionStartRef.current = Date.now();
    } else if (motivationRound === 'normal') {
      setMotivationRound('reward');
      setMQuestionIndex(0);
      questionStartRef.current = Date.now();
    } else {
      const avgNormal = normalTimesRef.current.reduce((a, b) => a + b, 0) / normalTimesRef.current.length;
      const avgReward = rewardTimesRef.current.reduce((a, b) => a + b, 0) / rewardTimesRef.current.length;
      const actDuration = (Date.now() - activityStartRef.current) / 1000;
      const totalHesitation = allHesitationRef.current;
      const avgAll = totalHesitation.length > 0 ? totalHesitation.reduce((a, b) => a + b, 0) / totalHesitation.length : 0;
      onComplete({
        correctAnalogies,
        speedBase: avgNormal,
        speedReward: avgReward,
        activity3Speed: actDuration > 0 ? totalQuestionsRef.current / actDuration : 0,
        averageResponseTime: avgAll,
        questionHesitationTime: totalHesitation,
      });
    }
  };

  if (subPhase === 'analogies') {
    const current = ANALOGY_QUESTIONS[analogyIndex];
    return (
      <div className="min-h-screen bg-slate-50 p-6" onClick={onGlobalClick}>
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-slate-800 mb-1">Abstract Reasoning</h2>
          <p className="text-sm text-slate-500 mb-6">Question {analogyIndex + 1} of 3</p>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <p className="text-lg font-bold text-slate-800 mb-5">{current.prompt}</p>
            <div className="space-y-2">
              {current.options.map((opt, oi) => (
                <button key={oi} data-interactive="true" onClick={() => handleAnalogyAnswer(oi)}
                  className="w-full py-3 px-5 rounded-xl text-left font-medium text-slate-700 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 hover:border-blue-300 transition-all">
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (subPhase === 'motivation_intro') {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center" onClick={onGlobalClick}>
        <div className="max-w-md text-center bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <Zap className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Speed Challenge</h2>
          <p className="text-sm text-slate-500 mb-6">Match 4 symbol sequences as fast as you can. Two rounds.</p>
          <button data-interactive="true" onClick={startMotivation}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition-all">Start</button>
        </div>
      </div>
    );
  }

  const currentQ = questions[mQuestionIndex];
  const isReward = motivationRound === 'reward';
  const progressPercent = ((mQuestionIndex + 1) / questions.length) * 100;

  if (!isReward) {
    return (
      <div className="min-h-screen bg-slate-50 p-6" onClick={onGlobalClick}>
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-slate-800 mb-1">Standard Round</h2>
          <p className="text-sm text-slate-500 mb-5">Question {mQuestionIndex + 1} of {questions.length}</p>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <p className="text-2xl font-bold text-slate-800 mb-5 tracking-widest text-center">{currentQ.prompt}</p>
            <div className="space-y-2">
              {currentQ.options.map((opt, oi) => (
                <button key={oi} data-interactive="true" onClick={() => handleMotivationAnswer(oi)}
                  className="w-full py-3 px-5 rounded-xl text-left font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all text-xl tracking-widest">
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 relative overflow-hidden" onClick={onGlobalClick}
      style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fffbeb 30%, #fef9c3 60%, #fefce8 100%)' }}>

      {showConfetti && <ConfettiBurst />}
      {showXpPopup && <XpPopup amount={50} />}

      {showBadge === 'streak' && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none" style={{ animation: 'badgeIn 0.5s ease-out forwards' }}>
          <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
            <Flame className="w-6 h-6" /><span className="font-bold text-lg">🔥 Achievement Unlocked: Hot Streak!</span>
          </div>
        </div>
      )}

      {showBadge === 'level' && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none" style={{ animation: 'badgeIn 0.5s ease-out forwards' }}>
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
            <Award className="w-6 h-6" /><span className="font-bold text-lg">⬆️ Level Up! Pattern Master!</span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes badgeIn { 0% { transform: translate(-50%, -40px) scale(0.7); opacity: 0; } 50% { transform: translate(-50%, 0px) scale(1.1); opacity: 1; } 100% { transform: translate(-50%, 0px) scale(1); opacity: 1; } }
        @keyframes glowPulse { 0%, 100% { box-shadow: 0 0 15px rgba(245,158,11,0.3), 0 0 30px rgba(245,158,11,0.1); } 50% { box-shadow: 0 0 25px rgba(245,158,11,0.5), 0 0 50px rgba(245,158,11,0.2); } }
        @keyframes streakBounce { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
      `}</style>

      <div className="max-w-2xl mx-auto relative z-10">
        <div className="mb-5 space-y-3">
          <div className="flex items-center justify-between rounded-2xl px-5 py-3 shadow-lg border border-amber-300"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', animation: 'glowPulse 2s ease-in-out infinite' }}>
            <div className="flex items-center gap-3">
              <Star className="w-6 h-6 text-white drop-shadow" />
              <span className="font-extrabold text-white text-xl">{xp} XP</span>
            </div>
            <div className="flex items-center gap-4">
              {streak > 0 && (
                <div className="flex items-center gap-1.5" style={{ animation: 'streakBounce 0.6s ease-in-out' }}>
                  <Flame className="w-5 h-5 text-white" /><span className="font-bold text-white text-sm">{streak} Streak!</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Trophy className="w-5 h-5 text-white" /><span className="text-sm font-bold text-white">+50 XP per correct!</span>
              </div>
            </div>
          </div>
          <div className="relative w-full bg-amber-200 rounded-full h-4 overflow-hidden shadow-inner">
            <div className="h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPercent}%`, background: 'linear-gradient(90deg, #f59e0b, #ef4444, #8b5cf6)' }}>
              <div className="absolute inset-0 rounded-full" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)', animation: 'shimmer 1.5s infinite' }} />
            </div>
          </div>
        </div>

        <h2 className="text-xl font-extrabold text-amber-800 mb-1 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-600" /> ⚡ Reward Round
        </h2>
        <p className="text-sm text-amber-700 mb-5 font-medium">Question {mQuestionIndex + 1} of {questions.length}</p>

        <div className="rounded-2xl shadow-xl p-6 border-2 border-amber-300"
          style={{ background: 'linear-gradient(145deg, #ffffff 0%, #fffbeb 50%, #fef3c7 100%)', animation: 'glowPulse 3s ease-in-out infinite' }}>
          <p className="text-2xl font-bold text-slate-800 mb-5 tracking-widest text-center">{currentQ.prompt}</p>
          <div className="space-y-2">
            {currentQ.options.map((opt, oi) => (
              <button key={oi} data-interactive="true" onClick={() => handleMotivationAnswer(oi)}
                className="w-full py-3.5 px-5 rounded-xl text-left font-semibold transition-all border-2 bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-900 border-amber-200 hover:border-amber-400 hover:from-amber-100 hover:to-yellow-100 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] text-xl tracking-widest">
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 text-center">
          <p className="text-xs text-amber-600 font-medium flex items-center justify-center gap-1.5">
            <PartyPopper className="w-3.5 h-3.5" /> Earn XP, unlock badges, and keep your streak alive!
          </p>
        </div>
      </div>
    </div>
  );
}
