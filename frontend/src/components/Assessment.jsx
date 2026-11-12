import { useState, useRef, useEffect, useCallback } from 'react';
import {
  BrainCircuit, CheckCircle2, Loader2, BookOpen, Eye, Headphones,
  Zap, Star, ArrowRight, Flame, Play,
  Pause, RotateCcw, Volume2, Sparkles, Bell, MessageSquare
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api/assessment/evaluate';
const IDLE_THRESHOLD = 5000;
const REQUIRED_TARGETS = 5;
const RAPID_CLICK_WINDOW = 1000;
const RAPID_CLICK_THRESHOLD = 4;

/* ── Activity 1 Text & Vocabulary (Clean + Cluttered) ── */
/* All genuine space/astronomy/solar-system terms are valid targets (isTarget: true).
   Terrestrial ocean/industrial technologies are distractors (isDistractor: true).
   Every token in the paragraph is interactive with identical cursor and hover styling to eliminate pointer leakage. */
const SHARED_PARAGRAPHS = [
  {
    id: 'p1',
    tokens: [
      { text: 'The', isWord: true },
      { text: 'universe', isTarget: true, phraseId: 'universe', label: 'Cosmic Domain' },
      { text: 'is', isWord: true },
      { text: 'vast', isWord: true },
      { text: 'and', isWord: true },
      { text: 'filled', isWord: true },
      { text: 'with', isWord: true },
      { text: 'billions', isWord: true },
      { text: 'of', isWord: true },
      { text: 'galaxies.', isTarget: true, phraseId: 'galaxies', label: 'Star Systems' },
      { text: 'Our', isWord: true },
      { text: 'home', isWord: true },
      { text: 'spiral', isWord: true },
      { text: 'galaxy', isTarget: true, phraseId: 'galaxy_spiral', label: 'Spiral Galaxy' },
      { text: 'is', isWord: true },
      { text: 'the', isWord: true },
      { text: 'Milky Way.', isTarget: true, phraseId: 'milky_way', label: 'Home Galaxy' },
      { text: 'It', isWord: true },
      { text: 'holds', isWord: true },
      { text: 'our', isWord: true },
      { text: 'entire', isWord: true },
      { text: 'solar system', isTarget: true, phraseId: 'solar_system', label: 'Planetary System' },
      { text: 'together', isWord: true },
      { text: 'through', isWord: true },
      { text: 'the', isWord: true },
      { text: 'immense', isWord: true },
      { text: 'gravitational pull', isTarget: true, phraseId: 'grav_pull', label: 'Cosmic Force' },
      { text: 'of', isWord: true },
      { text: 'the', isWord: true },
      { text: 'Sun,', isTarget: true, phraseId: 'sun', label: 'Central Star' },
      { text: 'which', isWord: true },
      { text: 'provides', isWord: true },
      { text: 'heat', isWord: true },
      { text: 'and', isWord: true },
      { text: 'light.', isWord: true }
    ],
  },
  {
    id: 'p2',
    tokens: [
      { text: 'Earth', isTarget: true, phraseId: 'earth', label: 'Habitable Planet' },
      { text: 'is', isWord: true },
      { text: 'positioned', isWord: true },
      { text: 'in', isWord: true },
      { text: 'the', isWord: true },
      { text: 'habitable', isWord: true },
      { text: 'zone.', isWord: true },
      { text: 'Robotic', isWord: true },
      { text: 'probes', isWord: true },
      { text: 'have', isWord: true },
      { text: 'also', isWord: true },
      { text: 'explored', isWord: true },
      { text: 'the', isWord: true },
      { text: 'dusty', isWord: true },
      { text: 'deserts', isWord: true },
      { text: 'of', isWord: true },
      { text: 'Mars,', isTarget: true, phraseId: 'mars', label: 'Red Planet' },
      { text: 'searching', isWord: true },
      { text: 'for', isWord: true },
      { text: 'traces', isWord: true },
      { text: 'of', isWord: true },
      { text: 'ancient', isWord: true },
      { text: 'water.', isWord: true },
      { text: 'Unlike', isWord: true },
      { text: 'deep-sea', isWord: true },
      { text: 'explorers', isWord: true },
      { text: 'using', isWord: true },
      { text: 'Submarine Sonar,', isDistractor: true, phraseId: 'd_sonar', label: 'Earth Ocean Tech', hint: 'Submarine Sonar is Earth ocean technology — look for stars, planets, and space concepts!' },
      { text: 'planetary', isTarget: true, phraseId: 'planetary', label: 'Planetary Science' },
      { text: 'rovers', isWord: true },
      { text: 'rely', isWord: true },
      { text: 'on', isWord: true },
      { text: 'spectrometers', isWord: true },
      { text: 'and', isWord: true },
      { text: 'high-resolution', isWord: true },
      { text: 'cameras.', isWord: true }
    ],
  },
  {
    id: 'p3',
    tokens: [
      { text: 'Beyond', isWord: true },
      { text: 'the', isWord: true },
      { text: 'rocky', isWord: true },
      { text: 'terrestrial', isWord: true },
      { text: 'planets', isTarget: true, phraseId: 'planets', label: 'Terrestrial Planets' },
      { text: 'lies', isWord: true },
      { text: 'the', isWord: true },
      { text: 'gas giant', isTarget: true, phraseId: 'gas_giant', label: 'Gas Giant' },
      { text: 'Jupiter,', isTarget: true, phraseId: 'jupiter', label: 'Largest Planet' },
      { text: 'crowned', isWord: true },
      { text: 'by', isWord: true },
      { text: 'its', isWord: true },
      { text: 'swirling', isWord: true },
      { text: 'storm', isWord: true },
      { text: 'called', isWord: true },
      { text: 'the', isWord: true },
      { text: 'Great Red Spot.', isTarget: true, phraseId: 'great_red_spot', label: 'Cosmic Jovian Storm' },
      { text: 'In', isWord: true },
      { text: 'the', isWord: true },
      { text: 'gap', isWord: true },
      { text: 'between', isWord: true },
      { text: 'Mars', isTarget: true, phraseId: 'mars_2', label: 'Planet Mars' },
      { text: 'and', isWord: true },
      { text: 'Jupiter', isTarget: true, phraseId: 'jupiter_2', label: 'Planet Jupiter' },
      { text: 'lies', isWord: true },
      { text: 'the', isWord: true },
      { text: 'dense', isWord: true },
      { text: 'Asteroid Belt,', isTarget: true, phraseId: 'asteroid_belt', label: 'Cosmic Belt' },
      { text: 'composed', isWord: true },
      { text: 'of', isWord: true },
      { text: 'millions', isWord: true },
      { text: 'of', isWord: true },
      { text: 'orbiting', isTarget: true, phraseId: 'orbiting', label: 'Orbital Motion' },
      { text: 'rock', isWord: true },
      { text: 'fragments.', isWord: true }
    ],
  },
  {
    id: 'p4',
    tokens: [
      { text: 'Every', isWord: true },
      { text: 'planet,', isTarget: true, phraseId: 'planet_single', label: 'Celestial Planet' },
      { text: 'moon,', isTarget: true, phraseId: 'moon', label: 'Natural Satellite' },
      { text: 'and', isWord: true },
      { text: 'comet', isTarget: true, phraseId: 'comet_single', label: 'Icy Celestial Body' },
      { text: 'is', isWord: true },
      { text: 'locked', isWord: true },
      { text: 'into', isWord: true },
      { text: 'its', isWord: true },
      { text: 'predictable', isWord: true },
      { text: 'orbital path', isTarget: true, phraseId: 'orbital_path', label: 'Cosmic Trajectory' },
      { text: 'by', isWord: true },
      { text: 'Gravity.', isTarget: true, phraseId: 'gravity', label: 'Fundamental Cosmic Force' },
      { text: 'When', isWord: true },
      { text: 'microscopic', isWord: true },
      { text: 'space debris', isTarget: true, phraseId: 'space_debris', label: 'Cosmic Debris' },
      { text: 'collides', isWord: true },
      { text: 'with', isWord: true },
      { text: 'Earth’s', isTarget: true, phraseId: 'earths', label: 'Earth' },
      { text: 'upper', isWord: true },
      { text: 'atmosphere,', isTarget: true, phraseId: 'atmosphere', label: 'Planetary Atmosphere' },
      { text: 'friction', isWord: true },
      { text: 'creates', isWord: true },
      { text: 'a', isWord: true },
      { text: 'glowing', isWord: true },
      { text: 'Meteor Shower,', isTarget: true, phraseId: 'meteor_shower', label: 'Cosmic Phenomenon' },
      { text: 'burning', isWord: true },
      { text: 'brightly', isWord: true },
      { text: 'across', isWord: true },
      { text: 'the', isWord: true },
      { text: 'night', isWord: true },
      { text: 'sky.', isWord: true }
    ],
  },
  {
    id: 'p5',
    tokens: [
      { text: 'Farther', isWord: true },
      { text: 'out', isWord: true },
      { text: 'in', isWord: true },
      { text: 'the', isWord: true },
      { text: 'frozen', isWord: true },
      { text: 'Kuiper Belt,', isTarget: true, phraseId: 'kuiper_belt', label: 'Outer Solar System Belt' },
      { text: 'an', isWord: true },
      { text: 'icy', isWord: true },
      { text: 'Comet', isTarget: true, phraseId: 'comet_p5', label: 'Celestial Body' },
      { text: 'swings', isWord: true },
      { text: 'toward', isWord: true },
      { text: 'the', isWord: true },
      { text: 'inner', isWord: true },
      { text: 'solar system,', isTarget: true, phraseId: 'solar_system_p5', label: 'Solar System' },
      { text: 'outgassing', isWord: true },
      { text: 'vapor', isWord: true },
      { text: 'into', isWord: true },
      { text: 'a', isWord: true },
      { text: 'luminous', isWord: true },
      { text: 'tail.', isWord: true },
      { text: 'Studying', isWord: true },
      { text: 'these', isWord: true },
      { text: 'cosmic relics', isTarget: true, phraseId: 'cosmic_relics', label: 'Cosmic Relics' },
      { text: 'does', isWord: true },
      { text: 'not', isWord: true },
      { text: 'require', isWord: true },
      { text: 'a', isWord: true },
      { text: 'Steam Generator,', isDistractor: true, phraseId: 'd_generator', label: 'Industrial Machine', hint: 'A Steam Generator is an Earth industrial machine — look for celestial bodies and cosmic forces!' },
      { text: 'but', isWord: true },
      { text: 'space telescopes', isTarget: true, phraseId: 'space_telescopes', label: 'Astronomical Instruments' },
      { text: 'and', isWord: true },
      { text: 'orbital', isTarget: true, phraseId: 'orbital_p5', label: 'Orbital Science' },
      { text: 'spectroscopy.', isTarget: true, phraseId: 'spectroscopy', label: 'Cosmic Light Analysis' }
    ],
  }
];

/* Realistic School/Digital Classroom Distractions for Cluttered Phase */
const CLUTTER_NOTIFICATIONS = [
  { icon: Bell, title: 'Classroom Alert', text: 'Science lab worksheets due by Friday at 4:00 PM.', color: 'border-amber-200 bg-amber-50 text-amber-800' },
  { icon: MessageSquare, title: 'Class Chat (3 new)', text: 'Liam: "Are we testing paragraph 3 or 4 right now?"', color: 'border-outline-variant/60 bg-surface-container-low text-on-surface' },
  { icon: Sparkles, title: 'Weekly Challenge', text: 'School Science Olympiad signups open this week!', color: 'border-primary/20 bg-surface-container text-primary' },
  { icon: Zap, title: 'Live Update', text: 'Band practice room moved to Room 204.', color: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
];

/* ── Activity 2 Multi-Modal Content ── */
const LUMA_TEXT = `The Luma Crystal Energy System is a synthetic clean-power storage architecture built for high-demand scientific facilities. It operates through three core synchronized components:

1. The Core Chamber:
The dense spherical cavity located at the exact center of the crystal. It compresses raw resonance energy into a stable quantum state, storing up to 4,700 terajoules in a marble-sized volume. Energy enters through magnetic intake valves and remains trapped inside a resonance containment field.

2. Photon Channels:
A network of luminescent micro-pathways radiating outward from the Core Chamber like wheel spokes. When active, these channels glow a gentle cobalt blue, conducting power directly to external instruments and sensors without conductive wire loss.

3. Concentric Cooling Rings:
Three layered thermal-absorption bands encircling the Core Chamber. High-volume energy transfer produces extreme thermal friction. The Cooling Rings absorb this excess heat and radiate it harmlessly across the surface as low-frequency infrared energy, preventing critical overheating and crystal destabilization.`;

const LUMA_AUDIO_SCRIPT = `Welcome to the Luma Crystal Energy System briefing. 
Picture a tiny glowing marble resting in the center of a glass sphere. That central marble is the Core Chamber — the heart of the system where all raw electrical energy is compressed and stored.

Radiating outward from this Core Chamber are thin, glowing blue lines called Photon Channels. Their job is simple: they act like light highways, carrying energy directly to external devices without any power loss.

When all that energy flows, it generates intense heat. To prevent the crystal from melting or overheating, three concentric Cooling Rings encircle the Core Chamber. These rings absorb thermal spikes and release them as harmless infrared glow. 

Remember these three parts: Core Chamber stores energy, Photon Channels transport it, and Cooling Rings prevent overheating.`;

const QUIZ_QUESTIONS = [
  {
    q: 'Where is raw energy compressed and stored inside a Luma Crystal?',
    options: ['Cooling Rings', 'Core Chamber', 'Photon Channels', 'Intake Valve'],
    answer: 1,
    explanation: 'The Core Chamber sits at the center and compresses raw energy up to 4,700 terajoules.'
  },
  {
    q: 'What is the primary role of the Photon Channels?',
    options: ['Absorb excess heat', 'Lock the resonance field', 'Distribute energy to external devices', 'Regulate crystal temperature'],
    answer: 2,
    explanation: 'Photon Channels radiate outward like spokes to deliver power directly to devices.'
  },
  {
    q: 'What critical danger do the concentric Cooling Rings prevent?',
    options: ['Light leakage', 'Thermal friction & crystal overheating', 'Voltage leakage', 'Magnetic valve blockage'],
    answer: 1,
    explanation: 'Without Cooling Rings, extreme thermal friction would overheat and destabilize the Core Chamber.'
  },
];

/* ── Activity 3 Conceptual & Motivational Challenges ── */
const ANALOGY_QUESTIONS = [
  {
    prompt: 'Atom is to Solar System as...',
    options: [
      'Nucleus is to Sun (Central mass orbited by smaller bodies)',
      'Electron is to Planet mass (Measure of weight)',
      'Proton is to Space vacuum (Empty distance)',
      'Neutron is to Asteroid belt (Outer ring)'
    ],
    answer: 0
  },
  {
    prompt: 'Cell Membrane is to City Border as...',
    options: [
      'Ribosome is to Highway (Transportation line)',
      'Nucleus is to City Hall (Central control center)',
      'Cytoplasm is to Skyscraper (Building structure)',
      'Mitochondria is to Park (Relaxation zone)'
    ],
    answer: 1
  },
  {
    prompt: 'Electric Current is to Water Flow through a pipe as...',
    options: [
      'Voltage is to Water Pressure (Force pushing the flow)',
      'Resistance is to Water Color (Visual appearance)',
      'Wire is to Riverbank (Earth formation)',
      'Battery is to Water Filter (Purification system)'
    ],
    answer: 0
  },
];

/* Pattern matching for Baseline vs Reward motivation */
const PATTERN_TASKS_BASELINE = [
  { prompt: 'Match the target symbol sequence: ★ ▲ ■ ◆', options: ['★ ▲ ■ ◆', '▲ ★ ◆ ■', '■ ◆ ★ ▲', '◆ ■ ▲ ★'], answer: 0 },
  { prompt: 'Match the target symbol sequence: ◯ ✦ △ ▢', options: ['✦ ◯ ▢ △', '◯ ✦ ▢ △', '◯ ✦ △ ▢', '△ ▢ ◯ ✦'], answer: 2 },
  { prompt: 'Match the target symbol sequence: ⬟ ▶ ◈ ✖', options: ['⬟ ▶ ◈ ✖', '▶ ⬟ ✖ ◈', '◈ ✖ ⬟ ▶', '✖ ◈ ▶ ⬟'], answer: 0 },
];

const PATTERN_TASKS_REWARD = [
  { prompt: 'Match the target symbol sequence: ▼ ◇ ● ✖', options: ['◇ ▼ ✖ ●', '▼ ◇ ● ✖', '● ✖ ▼ ◇', '✖ ● ◇ ▼'], answer: 1 },
  { prompt: 'Match the target symbol sequence: ✚ ⬟ ◈ ▶', options: ['⬟ ✚ ▶ ◈', '✚ ◈ ⬟ ▶', '✚ ⬟ ◈ ▶', '▶ ◈ ⬟ ✚'], answer: 2 },
  { prompt: 'Match the target symbol sequence: ✦ ◯ ■ ★', options: ['■ ★ ✦ ◯', '✦ ◯ ■ ★', '◯ ✦ ★ ■', '★ ■ ◯ ✦'], answer: 1 },
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

/* ── Interactive SVG Diagram for Activity 2 ── */
function LumaCrystalSVG({ onInteraction }) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeHighlight, setActiveHighlight] = useState(null);
  const interactionsRef = useRef(0);

  const registerInteraction = (type) => {
    interactionsRef.current++;
    setActiveHighlight(type);
    if (onInteraction) onInteraction(interactionsRef.current, false);
  };

  const handleZoom = (delta) => {
    interactionsRef.current++;
    setZoomLevel(z => Math.max(0.75, Math.min(1.75, z + delta)));
    if (onInteraction) onInteraction(interactionsRef.current, true);
  };

  return (
    <div data-interactive="true" className="space-y-3 select-none">
      <div className="flex items-center justify-between bg-surface-container-low p-2.5 rounded-2xl border border-outline-variant/40">
        <div className="flex gap-2">
          <button data-interactive="true" onClick={() => handleZoom(0.25)}
            className="px-4 py-1.5 bg-white border border-outline-variant hover:bg-surface-container rounded-full text-xs font-semibold text-on-surface shadow-xs transition-all">
            Zoom In +
          </button>
          <button data-interactive="true" onClick={() => handleZoom(-0.25)}
            className="px-4 py-1.5 bg-white border border-outline-variant hover:bg-surface-container rounded-full text-xs font-semibold text-on-surface shadow-xs transition-all">
            Zoom Out −
          </button>
          <button data-interactive="true" onClick={() => { setZoomLevel(1); setActiveHighlight(null); }}
            className="px-4 py-1.5 bg-white border border-outline-variant hover:bg-surface-container rounded-full text-xs font-semibold text-on-surface-variant shadow-xs transition-all">
            Reset View
          </button>
        </div>
        <div className="text-xs font-medium text-on-surface-variant pr-2">
          Scale: <strong className="text-on-surface">{Math.round(zoomLevel * 100)}%</strong>
        </div>
      </div>

      <div className="overflow-auto rounded-3xl border border-outline-variant/40 bg-[#16120e] p-6 flex justify-center" style={{ minHeight: '360px' }}>
        <svg viewBox="0 0 520 480" width={520 * zoomLevel} height={480 * zoomLevel} className="transition-all duration-200">
          <defs>
            <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="40%" stopColor="#f97d36" />
              <stop offset="100%" stopColor="#9f4200" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Cooling Rings (Layer 3, 2, 1) */}
          <circle cx="260" cy="200" r="170" fill="none" stroke="#60a5fa" strokeWidth={activeHighlight === 'rings' ? '4' : '2'} strokeDasharray="8 6" opacity={activeHighlight === 'rings' ? 1 : 0.6}
            className="cursor-pointer hover:opacity-100 transition-opacity" onClick={() => registerInteraction('rings')} />
          <circle cx="260" cy="200" r="125" fill="none" stroke="#38bdf8" strokeWidth={activeHighlight === 'rings' ? '4' : '2'} strokeDasharray="6 4" opacity={activeHighlight === 'rings' ? 1 : 0.75}
            className="cursor-pointer hover:opacity-100 transition-opacity" onClick={() => registerInteraction('rings')} />
          <circle cx="260" cy="200" r="85" fill="none" stroke="#0ea5e9" strokeWidth={activeHighlight === 'rings' ? '4' : '2.5'} opacity={activeHighlight === 'rings' ? 1 : 0.9}
            className="cursor-pointer hover:opacity-100 transition-opacity" onClick={() => registerInteraction('rings')} />

          {/* Photon Channels */}
          <g className="cursor-pointer" onClick={() => registerInteraction('channels')}>
            <line x1="260" y1="200" x2="110" y2="380" stroke="#38bdf8" strokeWidth={activeHighlight === 'channels' ? '5' : '3'} filter="url(#glow)" />
            <line x1="260" y1="200" x2="260" y2="400" stroke="#38bdf8" strokeWidth={activeHighlight === 'channels' ? '5' : '3'} filter="url(#glow)" />
            <line x1="260" y1="200" x2="410" y2="380" stroke="#38bdf8" strokeWidth={activeHighlight === 'channels' ? '5' : '3'} filter="url(#glow)" />
          </g>

          {/* Connected External Devices */}
          <g>
            <rect x="75" y="380" width="70" height="30" rx="6" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
            <text x="110" y="400" fill="#93c5fd" fontSize="10" fontWeight="bold" textAnchor="middle">Sensor Unit</text>

            <rect x="225" y="400" width="70" height="30" rx="6" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
            <text x="260" y="420" fill="#93c5fd" fontSize="10" fontWeight="bold" textAnchor="middle">Power Relay</text>

            <rect x="375" y="380" width="70" height="30" rx="6" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
            <text x="410" y="400" fill="#93c5fd" fontSize="10" fontWeight="bold" textAnchor="middle">Research Pod</text>
          </g>

          {/* Central Core Chamber */}
          <circle cx="260" cy="200" r="45" fill="url(#coreGlow)" stroke="#f97d36" strokeWidth={activeHighlight === 'core' ? '4' : '2'} filter="url(#glow)"
            className="cursor-pointer hover:scale-105 transition-transform" onClick={() => registerInteraction('core')} />
          <text x="260" y="195" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="800">CORE</text>
          <text x="260" y="210" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="700">CHAMBER</text>
          <text x="260" y="224" textAnchor="middle" fill="#ffb692" fontSize="8" fontWeight="600">4,700 TJ</text>

          {/* Labels & Annotations */}
          <text x="260" y="25" textAnchor="middle" fill="#93c5fd" fontSize="11" fontWeight="700">Concentric Cooling Rings (Thermal Absorption)</text>
          <text x="180" y="315" fill="#38bdf8" fontSize="10" fontWeight="600">Photon Channels</text>
          <text x="340" y="315" fill="#38bdf8" fontSize="10" fontWeight="600">Energy Flow →</text>
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <button onClick={() => registerInteraction('core')}
          className={`p-3 rounded-2xl border transition-all ${activeHighlight === 'core' ? 'bg-primary-fixed/40 border-brand-orange text-primary font-bold shadow-xs' : 'bg-surface-container-low border-outline-variant/40 text-on-surface hover:bg-surface-container'}`}>
          🟡 1. Core Chamber
        </button>
        <button onClick={() => registerInteraction('channels')}
          className={`p-3 rounded-2xl border transition-all ${activeHighlight === 'channels' ? 'bg-sky-100 border-sky-400 text-sky-900 font-bold shadow-xs' : 'bg-surface-container-low border-outline-variant/40 text-on-surface hover:bg-surface-container'}`}>
          ⚡ 2. Photon Channels
        </button>
        <button onClick={() => registerInteraction('rings')}
          className={`p-3 rounded-2xl border transition-all ${activeHighlight === 'rings' ? 'bg-primary-fixed/40 border-brand-orange text-primary font-bold shadow-xs' : 'bg-surface-container-low border-outline-variant/40 text-on-surface hover:bg-surface-container'}`}>
          🌀 3. Cooling Rings
        </button>
      </div>
    </div>
  );
}

/* ── Rock-Solid Speech Synthesis Audio Player ── */
function AudioNarrationPlayer({ script, onTelemetry }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [rate, setRate] = useState(1.0);
  const [progress, setProgress] = useState(0);
  const [playCount, setPlayCount] = useState(0);

  const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);
  const utteranceRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const startTimeRef = useRef(0);
  const estimatedDurationRef = useRef(25000);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  const handlePlay = () => {
    if (!synthRef.current) return;

    if (isPlaying) {
      synthRef.current.cancel();
      setIsPlaying(false);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    synthRef.current.cancel();

    const utter = new SpeechSynthesisUtterance(script);
    utter.rate = rate;
    utter.pitch = 1.0;

    // Pick best English voice available
    const voices = synthRef.current.getVoices?.() || [];
    const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.default)) || voices[0];
    if (englishVoice) utter.voice = englishVoice;

    const words = script.split(/\s+/).length;
    estimatedDurationRef.current = ((words / (2.6 * rate)) * 1000);
    startTimeRef.current = Date.now();

    utter.onend = () => {
      setIsPlaying(false);
      setProgress(100);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (onTelemetry) onTelemetry({ completed: true, playCount: playCount + 1, percent: 100 });
    };

    utter.onerror = () => {
      setIsPlaying(false);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };

    synthRef.current.speak(utter);
    utteranceRef.current = utter;
    setIsPlaying(true);
    const newCount = playCount + 1;
    setPlayCount(newCount);
    if (onTelemetry) onTelemetry({ completed: false, playCount: newCount, percent: Math.round(progress) });

    // Progress interval with Chrome keep-alive
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    progressIntervalRef.current = setInterval(() => {
      if (!synthRef.current.speaking) {
        setIsPlaying(false);
        clearInterval(progressIntervalRef.current);
        return;
      }
      // Keep Chrome from timing out long speech
      synthRef.current.pause();
      synthRef.current.resume();

      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(99, Math.round((elapsed / estimatedDurationRef.current) * 100));
      setProgress(pct);
    }, 250);
  };

  const handleStop = () => {
    if (synthRef.current) synthRef.current.cancel();
    setIsPlaying(false);
    setProgress(0);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
  };

  return (
    <div data-interactive="true" className="space-y-4 bg-gradient-to-r from-surface-container-low via-surface-container to-surface p-6 rounded-3xl border border-outline-variant/60 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button data-interactive="true" onClick={handlePlay}
            className="px-6 py-2.5 rounded-full font-semibold text-sm transition-all shadow-card flex items-center gap-2 bg-brand-orange hover:bg-brand-orange-hover text-white">
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? 'Pause Narration' : 'Listen to Narration'}
          </button>
          <button data-interactive="true" onClick={handleStop}
            className="p-2.5 bg-white hover:bg-surface-container text-on-surface-variant rounded-full border border-outline-variant transition-all shadow-xs">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant">
          <span>Speed:</span>
          {[0.85, 1.0, 1.15].map((s) => (
            <button key={s} data-interactive="true" onClick={() => setRate(s)}
              className={`px-3 py-1 rounded-full transition-all ${rate === s ? 'bg-brand-orange text-white font-bold shadow-xs' : 'bg-white text-on-surface-variant hover:bg-surface-container border border-outline-variant'}`}>
              {s}x
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="w-full bg-surface-container rounded-full h-2.5 overflow-hidden">
          <div className="bg-brand-orange h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between text-[11px] text-primary font-medium">
          <span>{isPlaying ? '🔊 Voice Narration Playing...' : progress >= 100 ? '✓ Complete' : 'Ready'}</span>
          <span>Plays: {playCount}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Gamification Burst Visuals ── */
function ConfettiBurst() {
  const [particles] = useState(() => Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.25,
    duration: 0.8 + Math.random() * 0.6,
    color: ['#fbbf24', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#10b981'][Math.floor(Math.random() * 6)],
    size: 5 + Math.random() * 6,
    rotation: Math.random() * 360,
  })));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute', left: `${p.left}%`, top: '-10px',
          width: `${p.size}px`, height: `${p.size}px`,
          backgroundColor: p.color, borderRadius: p.size > 8 ? '50%' : '2px',
          transform: `rotate(${p.rotation}deg)`,
          animation: `confettiFall ${p.duration}s ease-in ${p.delay}s forwards`,
        }} />
      ))}
      <style>{`@keyframes confettiFall { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }`}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN ASSESSMENT ENGINE
   ══════════════════════════════════════════════════════════ */
export default function AssessmentEngine({ onComplete, currentUser }) {
  const [phase, setPhase] = useState('login');
  const [studentName, setStudentName] = useState(currentUser?.name || '');

  // Always scroll to top when assessment phase transitions
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [phase]);

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
  const lastActivityRef = useRef(0);

  const resetIdleTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (idleTimerRef.current) clearInterval(idleTimerRef.current);
    idleTimerRef.current = setInterval(() => {
      telemetryRef.current.idleEvents++;
    }, IDLE_THRESHOLD);
  }, []);

  useEffect(() => {
    const events = ['mousemove', 'touchmove', 'keydown', 'mousedown'];
    const handler = () => resetIdleTimer();
    events.forEach(e => window.addEventListener(e, handler, { passive: true }));
    resetIdleTimer();
    return () => {
      events.forEach(e => window.removeEventListener(e, handler));
      if (idleTimerRef.current) clearInterval(idleTimerRef.current);
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
      e.target.classList.contains('bg-surface') ||
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

  const handleStart = () => {
    if (!studentName.trim() && !currentUser?.name) return;
    telemetryRef.current.assessmentStartTime = Date.now();
    telemetryRef.current.assessmentRestarts = getRestartCount();
    setPhase('activity1_clean');
  };

  const buildPayload = () => {
    const t = telemetryRef.current;
    t.totalTime = Date.now() - t.assessmentStartTime;
    return {
      studentId: currentUser?.id,
      name: studentName || currentUser?.name,
      grade: currentUser?.grade || 'All',
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
    setTimeout(() => setPhase('success'), 2000);
  };

  if (phase === 'login') {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6 select-none" onClick={handleGlobalClick}>
        <div className="w-full max-w-md bg-white rounded-3xl shadow-soft border border-outline-variant/40 p-8 text-center">
          <div className="w-14 h-14 bg-brand-orange rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-card">
            <BrainCircuit className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-on-surface mb-1">Cognitive Calibration</h1>
          <p className="text-sm text-on-surface-variant mb-6">
            A quick, adaptive game to tailor your textbook layout, font, audio narration, and study pace to how your brain works best.
          </p>

          <div className="bg-surface-container-low border border-outline-variant/40 rounded-2xl p-4 text-left mb-6 space-y-2 text-xs text-on-surface">
            <p className="font-bold flex items-center gap-1.5 text-primary"><Sparkles className="w-4 h-4 text-brand-orange" /> Three Quick Micro-Activities (3–4 mins):</p>
            <p>1. <strong>Visual Exploration:</strong> Finding key concepts in clean and active layouts.</p>
            <p>2. <strong>Modality Choice:</strong> Explore information via reading, diagrams, or audio narration.</p>
            <p>3. <strong>Cognitive Reasoning:</strong> Quick pattern and conceptual matching.</p>
          </div>

          <div className="text-left mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Student Name</label>
            <input
              type="text"
              value={studentName}
              onChange={e => setStudentName(e.target.value)}
              placeholder="Enter your name"
              data-interactive="true"
              className="w-full px-4 py-3.5 border border-outline-variant rounded-xl text-on-surface font-semibold focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-brand-orange text-sm bg-surface-container-lowest"
              onKeyDown={e => e.key === 'Enter' && handleStart()}
            />
          </div>

          <button
            onClick={handleStart}
            disabled={!studentName.trim() && !currentUser?.name}
            data-interactive="true"
            className="w-full py-4 rounded-full font-semibold text-white bg-brand-orange hover:bg-brand-orange-hover shadow-card transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5">
            Begin Calibration <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'activity1_clean') {
    return (
      <Activity1Phase
        key="clean"
        title="Activity 1A: Information Retrieval (Clean Layout)"
        paragraphs={SHARED_PARAGRAPHS}
        isCluttered={false}
        onGlobalClick={handleGlobalClick}
        onComplete={(data) => {
          const t = telemetryRef.current;
          t.activity1.tClean = data.tTime;
          t.activity1.wrongClicksClean = data.wrongClicks;
          t.activity1.tInit = data.tInit;
          t.activity1.paragraphViewTime = data.paragraphViewTime;
          t.activity1.uniqueParagraphsViewed = data.uniqueParagraphsViewed;
          setPhase('activity1_clutter');
        }}
      />
    );
  }

  if (phase === 'activity1_clutter') {
    return (
      <Activity1Phase
        key="clutter"
        title="Activity 1B: Information Retrieval (Active Classroom Layout)"
        paragraphs={SHARED_PARAGRAPHS}
        isCluttered={true}
        onGlobalClick={handleGlobalClick}
        onComplete={(data) => {
          const t = telemetryRef.current;
          t.activity1.tClutter = data.tTime;
          t.activity1.wrongClicksClutter = data.wrongClicks;
          t.activity1.scrollBacks = data.scrollBacks;
          t.activity1.rereads = data.rereads;
          t.activity1.activity1Speed = data.tTime > 0 ? (REQUIRED_TARGETS / (data.tTime / 1000)) : 0;
          t.completedActivities++;
          setPhase('activity2');
        }}
      />
    );
  }

  if (phase === 'activity2') {
    return (
      <Activity2
        onGlobalClick={handleGlobalClick}
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
        }}
      />
    );
  }

  if (phase === 'activity3') {
    return (
      <Activity3
        onGlobalClick={handleGlobalClick}
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
        }}
      />
    );
  }

  if (phase === 'analyzing') {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6" onClick={handleGlobalClick}>
        <div className="text-center max-w-sm">
          <Loader2 className="w-14 h-14 text-brand-orange animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-on-surface mb-2">Analyzing Cognitive Vectors</h2>
          <p className="text-sm text-on-surface-variant">Synthesizing behavioral metrics into your 12-dimensional cognitive learning profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6" onClick={handleGlobalClick}>
      <div className="text-center max-w-lg bg-white p-8 md:p-10 rounded-3xl border border-outline-variant/40 shadow-soft">
        <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
        <h2 className="text-3xl font-extrabold text-on-surface mb-2">Calibration Complete!</h2>
        <p className="text-sm text-on-surface-variant mb-8 leading-relaxed">
          Your personalized Cognitive Needs Profile has been established. Your textbook, font hierarchy, sensory themes, and learning aids are now aligned with how you learn best.
        </p>

        <button data-interactive="true" onClick={() => {
          if (onComplete) onComplete(buildPayload());
        }} className="w-full py-4 bg-brand-orange hover:bg-brand-orange-hover text-white font-semibold rounded-full shadow-card transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5">
          Enter Your Tailored Learning Portal <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   ACTIVITY 1: Clean vs Cluttered Layout Search
   ══════════════════════════════════════════════════════════ */
function Activity1Phase({ title, paragraphs, isCluttered, onGlobalClick, onComplete }) {
  const [found, setFound] = useState([]);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [wrongClicks, setWrongClicks] = useState(0);

  const startRef = useRef(0);
  const firstClickRef = useRef(0);
  const scrollBacksRef = useRef(0);
  const rereadsRef = useRef(0);
  const viewedRef = useRef(new Set());
  const containerRef = useRef(null);
  const paraViewStartRef = useRef({});
  const totalParaViewTimeRef = useRef(0);

  useEffect(() => {
    startRef.current = Date.now();
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isCluttered) return;
    let lastScroll = container.scrollTop;
    const handleScroll = () => {
      const current = container.scrollTop;
      if (lastScroll - current > 120) scrollBacksRef.current++;
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

  const finishPhase = useCallback(() => {
    const elapsed = Date.now() - startRef.current;
    Object.keys(paraViewStartRef.current).forEach(id => {
      totalParaViewTimeRef.current += Date.now() - paraViewStartRef.current[id];
    });
    onComplete({
      tTime: Math.max(elapsed, 1000),
      wrongClicks,
      tInit: firstClickRef.current || 1500,
      scrollBacks: scrollBacksRef.current,
      rereads: rereadsRef.current,
      paragraphViewTime: totalParaViewTimeRef.current,
      uniqueParagraphsViewed: viewedRef.current.size,
    });
  }, [onComplete, wrongClicks]);

  const handlePhraseClick = useCallback((tok) => {
    if (tok.phraseId && found.includes(tok.phraseId)) return;

    if (firstClickRef.current === 0) {
      firstClickRef.current = Date.now() - startRef.current;
    }

    if (tok.isTarget) {
      const newFound = [...found, tok.phraseId];
      setFound(newFound);
      setFeedbackMsg(`✓ Identified: ${tok.text.replace(/[,.]/g, '')} (${tok.label || 'Space Concept'})`);

      if (newFound.length >= REQUIRED_TARGETS) {
        setTimeout(() => finishPhase(), 600);
      }
    } else if (tok.isDistractor) {
      setWrongClicks(w => w + 1);
      setFeedbackMsg(tok.hint || `"${tok.text}" is Earth technology — look for stars, planets, and space concepts!`);
      setTimeout(() => setFeedbackMsg(''), 3000);
    } else {
      setWrongClicks(w => w + 1);
      const cleanWord = tok.text.replace(/[^a-zA-Z]/g, '');
      if (cleanWord) {
        setFeedbackMsg(`"${cleanWord}" is not a celestial concept — look for stars, planets, galaxies, or cosmic forces!`);
        setTimeout(() => setFeedbackMsg(''), 2500);
      }
    }
  }, [finishPhase, found]);

  return (
    <div className="min-h-screen bg-surface p-6 select-none" onClick={onGlobalClick}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-on-surface">{title}</h2>
            <p className="text-sm text-on-surface-variant mt-1">
              Read carefully and click any <span className="font-bold text-primary">{REQUIRED_TARGETS} celestial bodies or space concepts</span> mentioned in the text.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-5 py-2 rounded-full text-sm font-bold shadow-xs transition-all ${
              found.length >= REQUIRED_TARGETS ? 'bg-emerald-600 text-white' : 'bg-surface-container text-primary border border-primary/20'
            }`}>
              {found.length} / {REQUIRED_TARGETS} Identified
            </span>
          </div>
        </div>

        {feedbackMsg && (
          <div className="mb-4 px-5 py-2.5 bg-surface-container-low border border-primary/20 text-primary rounded-full text-xs font-semibold animate-fadeIn">
            {feedbackMsg}
          </div>
        )}

        <div className={isCluttered ? 'grid grid-cols-1 lg:grid-cols-4 gap-6' : ''}>
          <div ref={containerRef}
            className={`bg-white rounded-3xl shadow-soft border border-outline-variant/40 p-6 space-y-4 ${
              isCluttered ? 'lg:col-span-3 max-h-[72vh] overflow-y-auto' : ''
            }`}>
            {paragraphs.map((para) => (
              <p key={para.id} data-para-id={para.id}
                className="text-base text-on-surface leading-relaxed p-3 rounded-2xl hover:bg-surface-container-low/40 transition-colors">
                {para.tokens.map((tok, ti) => {
                  const isFound = tok.phraseId && found.includes(tok.phraseId);
                  return (
                    <span
                      key={ti}
                      data-interactive="true"
                      onClick={(e) => { e.stopPropagation(); handlePhraseClick(tok); }}
                      className={`inline-block px-1.5 py-0.5 mx-0.5 rounded-lg font-medium transition-all cursor-pointer ${
                        isFound
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold shadow-2xs'
                          : 'hover:bg-primary-fixed/40 border border-transparent hover:border-primary-fixed text-on-surface'
                      }`}
                    >
                      {isFound ? `✓ ${tok.text}` : tok.text}
                    </span>
                  );
                })}
              </p>
            ))}
          </div>

          {/* Realistic High-Distraction Visual Noise for Cluttered Layout */}
          {isCluttered && (
            <div className="space-y-3.5">
              <div className="text-[11px] font-bold text-on-surface-variant/70 uppercase tracking-wider px-1">
                Classroom Feed (Noise Vector)
              </div>
              {CLUTTER_NOTIFICATIONS.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className={`p-4 rounded-2xl border shadow-xs text-left transition-all hover:scale-[1.02] ${item.color}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-4 h-4" />
                      <span className="font-bold text-xs">{item.title}</span>
                    </div>
                    <p className="text-[11px] opacity-90 leading-tight">{item.text}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   ACTIVITY 2: Modality Selection & Recall
   ══════════════════════════════════════════════════════════ */
function Activity2({ onGlobalClick, onComplete }) {
  const [activeTab, setActiveTab] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState([null, null, null]);
  const [countdown, setCountdown] = useState(10); // 10s study requirement

  const tabEntryRef = useRef(0);
  const timesRef = useRef({ tText: 0, tVisual: 0, tAudio: 0 });
  const switchesRef = useRef(0);
  const firstChoiceRef = useRef('');
  const audioTelemetryRef = useRef({ started: false, completed: false, playCount: 0, percent: 0 });
  const diagramTelemetryRef = useRef({ zooms: 0, interactions: 0 });
  const quizTimesRef = useRef([]);
  const quizQuestionStartRef = useRef(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    if (showQuiz && quizQuestionStartRef.current === 0) {
      quizQuestionStartRef.current = Date.now();
    }
  }, [showQuiz]);

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

  const handleDiagramInteraction = (interactions, isZoom) => {
    diagramTelemetryRef.current.interactions = interactions;
    if (isZoom) diagramTelemetryRef.current.zooms++;
  };

  const handleQuizAnswer = useCallback((qIndex, optIndex) => {
    if (quizQuestionStartRef.current > 0) {
      quizTimesRef.current.push(Date.now() - quizQuestionStartRef.current);
    }
    setQuizAnswers(prev => {
      const next = [...prev];
      next[qIndex] = optIndex;
      return next;
    });
    quizQuestionStartRef.current = Date.now();
  }, []);

  const submitQuiz = () => {
    accumulateTime();
    let correct = 0;
    QUIZ_QUESTIONS.forEach((q, i) => { if (quizAnswers[i] === q.answer) correct++; });
    const avgResp = quizTimesRef.current.length > 0 ? quizTimesRef.current.reduce((a, b) => a + b, 0) / quizTimesRef.current.length : 2500;

    onComplete({
      firstChoice: firstChoiceRef.current || 'text',
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
  };

  if (showQuiz) {
    const allAnswered = quizAnswers.every(a => a !== null);
    return (
      <div className="min-h-screen bg-surface p-6 select-none" onClick={onGlobalClick}>
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-on-surface">Recall Check — Luma Crystal System</h2>
            <p className="text-sm text-on-surface-variant mt-1">Answer from memory. No trick questions.</p>
          </div>

          <div className="space-y-4">
            {QUIZ_QUESTIONS.map((q, qi) => (
              <div key={qi} className="bg-white rounded-3xl border border-outline-variant/40 p-6 shadow-soft space-y-3">
                <p className="font-bold text-on-surface text-sm">{qi + 1}. {q.q}</p>
                <div className="space-y-2">
                  {q.options.map((opt, oi) => {
                    const isSelected = quizAnswers[qi] === oi;
                    return (
                      <button
                        key={oi}
                        data-interactive="true"
                        onClick={() => handleQuizAnswer(qi, oi)}
                        className={`w-full text-left px-5 py-3 rounded-2xl text-sm font-semibold transition-all border ${
                          isSelected
                            ? 'bg-primary-fixed/30 border-brand-orange text-primary shadow-xs ring-2 ring-brand-orange/20'
                            : 'bg-surface-container-low/60 hover:bg-surface-container text-on-surface border-outline-variant/40'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <button
            data-interactive="true"
            onClick={submitQuiz}
            disabled={!allAnswered}
            className={`w-full py-4 rounded-full font-semibold text-white transition-all shadow-card ${
              allAnswered ? 'bg-brand-orange hover:bg-brand-orange-hover hover:-translate-y-0.5' : 'bg-surface-container-high text-on-surface-variant/40 cursor-not-allowed'
            }`}
          >
            Submit Answers & Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface p-6 select-none" onClick={onGlobalClick}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-bold text-on-surface">Activity 2: Modality Preference</h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Choose how you prefer to learn about the <strong>Luma Crystal Energy System</strong>. You can read, view the diagram, or listen to audio.
          </p>
        </div>

        {/* Modality Tabs */}
        <div className="grid grid-cols-3 gap-3">
          <button data-interactive="true" onClick={() => switchTab('text')}
            className={`py-3.5 px-4 rounded-full font-semibold text-sm transition-all border flex items-center justify-center gap-2 ${
              activeTab === 'text' ? 'bg-brand-orange text-white border-brand-orange shadow-card ring-2 ring-brand-orange/20' : 'bg-white text-on-surface border-outline-variant/60 hover:bg-surface-container-low shadow-xs'
            }`}>
            <BookOpen className="w-4 h-4" /> 1. Text Summary
          </button>
          <button data-interactive="true" onClick={() => switchTab('diagram')}
            className={`py-3.5 px-4 rounded-full font-semibold text-sm transition-all border flex items-center justify-center gap-2 ${
              activeTab === 'diagram' ? 'bg-brand-orange text-white border-brand-orange shadow-card ring-2 ring-brand-orange/20' : 'bg-white text-on-surface border-outline-variant/60 hover:bg-surface-container-low shadow-xs'
            }`}>
            <Eye className="w-4 h-4" /> 2. Visual Diagram
          </button>
          <button data-interactive="true" onClick={() => switchTab('audio')}
            className={`py-3.5 px-4 rounded-full font-semibold text-sm transition-all border flex items-center justify-center gap-2 ${
              activeTab === 'audio' ? 'bg-brand-orange text-white border-brand-orange shadow-card ring-2 ring-brand-orange/20' : 'bg-white text-on-surface border-outline-variant/60 hover:bg-surface-container-low shadow-xs'
            }`}>
            <Headphones className="w-4 h-4" /> 3. Audio Narration
          </button>
        </div>

        {/* Tab Content Display */}
        {!activeTab && (
          <div className="bg-white rounded-3xl border border-outline-variant/40 p-12 text-center shadow-soft">
            <Volume2 className="w-12 h-12 text-brand-orange mx-auto mb-3 animate-pulse" />
            <h3 className="text-base font-bold text-on-surface mb-1">Pick a Learning Modality</h3>
            <p className="text-xs text-on-surface-variant">Select any tab above to begin studying the 3 crystal components.</p>
          </div>
        )}

        {activeTab === 'text' && (
          <div className="bg-white rounded-3xl border border-outline-variant/40 p-6 shadow-soft space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
              <h3 className="font-bold text-on-surface text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-brand-orange" /> Technical Reading Passage
              </h3>
            </div>
            <p className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap font-sans">{LUMA_TEXT}</p>
          </div>
        )}

        {activeTab === 'diagram' && (
          <div className="bg-white rounded-3xl border border-outline-variant/40 p-6 shadow-soft space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
              <h3 className="font-bold text-on-surface text-sm flex items-center gap-2">
                <Eye className="w-4 h-4 text-brand-orange" /> Interactive Spatial Diagram
              </h3>
            </div>
            <LumaCrystalSVG onInteraction={handleDiagramInteraction} />
          </div>
        )}

        {activeTab === 'audio' && (
          <div className="bg-white rounded-3xl border border-outline-variant/40 p-6 shadow-soft space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
              <h3 className="font-bold text-on-surface text-sm flex items-center gap-2">
                <Headphones className="w-4 h-4 text-brand-orange" /> Audio Narration Engine
              </h3>
            </div>
            <AudioNarrationPlayer script={LUMA_AUDIO_SCRIPT} onTelemetry={handleAudioTelemetry} />
            <div className="text-xs text-on-surface-variant bg-surface-container-low p-4 rounded-2xl border border-outline-variant/40">
              <span className="font-bold text-on-surface">Audio Transcript Preview:</span> {LUMA_AUDIO_SCRIPT.slice(0, 160)}...
            </div>
          </div>
        )}

        {activeTab && (
          <button
            data-interactive="true"
            onClick={() => { accumulateTime(); setShowQuiz(true); }}
            disabled={countdown > 0}
            className={`w-full py-4 rounded-full font-semibold text-white transition-all shadow-card ${
              countdown <= 0 ? 'bg-brand-orange hover:bg-brand-orange-hover hover:-translate-y-0.5' : 'bg-surface-container-high text-on-surface-variant/40 cursor-not-allowed'
            }`}
          >
            {countdown <= 0 ? 'Ready for Recall Check →' : `Study for ${countdown}s more before quiz`}
          </button>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   ACTIVITY 3: Analogies & Motivation Calibration
   ══════════════════════════════════════════════════════════ */
function Activity3({ onGlobalClick, onComplete }) {
  const [subPhase, setSubPhase] = useState('analogies');
  const [analogyIndex, setAnalogyIndex] = useState(0);
  const [correctAnalogies, setCorrectAnalogies] = useState(0);

  const [motivationRound, setMotivationRound] = useState('normal'); // 'normal' | 'reward'
  const [taskIndex, setTaskIndex] = useState(0);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const normalTimesRef = useRef([]);
  const rewardTimesRef = useRef([]);
  const questionStartRef = useRef(0);
  const activityStartRef = useRef(0);
  const totalQuestionsRef = useRef(0);
  const allHesitationRef = useRef([]);
  const analogyStartRef = useRef(0);

  useEffect(() => {
    const now = Date.now();
    questionStartRef.current = now;
    activityStartRef.current = now;
    analogyStartRef.current = now;
  }, []);

  const handleAnalogyAnswer = useCallback((optIndex) => {
    const hesitation = Date.now() - analogyStartRef.current;
    allHesitationRef.current.push(hesitation);
    if (optIndex === ANALOGY_QUESTIONS[analogyIndex].answer) {
      setCorrectAnalogies(c => c + 1);
    }
    totalQuestionsRef.current++;

    if (analogyIndex < ANALOGY_QUESTIONS.length - 1) {
      setAnalogyIndex(i => i + 1);
      analogyStartRef.current = Date.now();
    } else {
      setSubPhase('motivation_intro');
    }
  }, [analogyIndex]);

  const startMotivationRounds = () => {
    questionStartRef.current = Date.now();
    setSubPhase('motivation');
  };

  const tasks = motivationRound === 'normal' ? PATTERN_TASKS_BASELINE : PATTERN_TASKS_REWARD;

  const handleMotivationAnswer = useCallback((optIndex) => {
    const elapsed = Date.now() - questionStartRef.current;
    allHesitationRef.current.push(elapsed);
    totalQuestionsRef.current++;

    const isCorrect = optIndex === tasks[taskIndex].answer;

    if (motivationRound === 'normal') {
      normalTimesRef.current.push(elapsed);
    } else {
      rewardTimesRef.current.push(elapsed);
      if (isCorrect) {
        setXp(x => x + 50);
        setStreak(s => s + 1);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 1200);
      } else {
        setStreak(0);
      }
    }

    if (taskIndex < tasks.length - 1) {
      setTaskIndex(i => i + 1);
      questionStartRef.current = Date.now();
    } else if (motivationRound === 'normal') {
      setMotivationRound('reward');
      setTaskIndex(0);
      questionStartRef.current = Date.now();
    } else {
      // Completed both rounds
      const avgNormal = normalTimesRef.current.length > 0 ? normalTimesRef.current.reduce((a, b) => a + b, 0) / normalTimesRef.current.length : 2500;
      const avgReward = rewardTimesRef.current.length > 0 ? rewardTimesRef.current.reduce((a, b) => a + b, 0) / rewardTimesRef.current.length : 1800;
      const duration = (Date.now() - activityStartRef.current) / 1000;
      const totalHesitation = allHesitationRef.current;
      const avgAll = totalHesitation.length > 0 ? totalHesitation.reduce((a, b) => a + b, 0) / totalHesitation.length : 2000;

      onComplete({
        correctAnalogies,
        speedBase: avgNormal,
        speedReward: avgReward,
        activity3Speed: duration > 0 ? totalQuestionsRef.current / duration : 0.4,
        averageResponseTime: avgAll,
        questionHesitationTime: totalHesitation,
      });
    }
  }, [correctAnalogies, motivationRound, onComplete, taskIndex, tasks]);

  /* Sub-phase 1: Conceptual Analogies */
  if (subPhase === 'analogies') {
    const currentQ = ANALOGY_QUESTIONS[analogyIndex];
    return (
      <div className="min-h-screen bg-surface p-6 select-none" onClick={onGlobalClick}>
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Cognitive Domain Mapping</span>
            <h2 className="text-xl font-bold text-on-surface mt-1">Conceptual Analogy ({analogyIndex + 1} of 3)</h2>
            <p className="text-sm text-on-surface-variant">Pick the relationship that best matches the conceptual pattern.</p>
          </div>

          <div className="bg-white rounded-3xl border border-outline-variant/40 p-8 shadow-soft space-y-6">
            <div className="p-4 bg-surface-container-low border border-primary/20 rounded-2xl text-center">
              <span className="text-lg font-bold text-on-surface">{currentQ.prompt}</span>
            </div>

            <div className="space-y-3">
              {currentQ.options.map((opt, i) => (
                <button
                  key={i}
                  data-interactive="true"
                  onClick={() => handleAnalogyAnswer(i)}
                  className="w-full p-4 text-left rounded-2xl border border-outline-variant/60 bg-white hover:bg-surface-container-low hover:border-brand-orange font-semibold text-on-surface text-sm transition-all shadow-xs"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* Sub-phase 2: Transition into Motivation Calibration */
  if (subPhase === 'motivation_intro') {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6 select-none" onClick={onGlobalClick}>
        <div className="max-w-md w-full bg-white rounded-3xl border border-outline-variant/40 p-8 text-center shadow-soft space-y-4">
          <Zap className="w-12 h-12 text-brand-orange mx-auto" />
          <h2 className="text-2xl font-bold text-on-surface">Processing Speed & Motivation Calibration</h2>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            You will now see a few rapid symbol sequences. Select the matching sequence as quickly as possible. We will compare your performance in a neutral layout versus a reward layout.
          </p>
          <button data-interactive="true" onClick={startMotivationRounds}
            className="w-full py-4 bg-brand-orange hover:bg-brand-orange-hover text-white font-semibold rounded-full shadow-card transition-all hover:-translate-y-0.5">
            Begin Speed Round →
          </button>
        </div>
      </div>
    );
  }

  /* Sub-phase 3: Neutral Round vs Reward Round */
  const currentTask = tasks[taskIndex];
  const isReward = motivationRound === 'reward';

  if (!isReward) {
    return (
      <div className="min-h-screen bg-surface p-6 select-none" onClick={onGlobalClick}>
        <div className="max-w-xl mx-auto space-y-6">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant/60">Baseline Focus Round</span>
            <h2 className="text-xl font-bold text-on-surface mt-1">Match Sequence ({taskIndex + 1} of {tasks.length})</h2>
          </div>

          <div className="bg-white rounded-3xl border border-outline-variant/40 p-8 text-center shadow-soft space-y-6">
            <div className="text-2xl tracking-widest font-mono text-on-surface p-4 bg-surface-container-low rounded-2xl border border-outline-variant/30">
              {currentTask.prompt.replace('Match the target symbol sequence: ', '')}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {currentTask.options.map((opt, oi) => (
                <button
                  key={oi}
                  data-interactive="true"
                  onClick={() => handleMotivationAnswer(oi)}
                  className="py-4 px-3 rounded-2xl bg-surface-container-low/60 border border-outline-variant/60 hover:bg-surface-container hover:border-brand-orange text-on-surface font-mono text-lg tracking-widest font-bold transition-all shadow-xs"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* Round 2: Reward / Gamified Round */
  return (
    <div className="min-h-screen p-6 relative overflow-hidden select-none" onClick={onGlobalClick}
      style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fffbeb 40%, #fefce8 100%)' }}>
      {showConfetti && <ConfettiBurst />}

      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center justify-between bg-gradient-to-r from-amber-500 to-orange-500 p-4 rounded-2xl text-white shadow-md">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 fill-white text-white" />
            <span className="font-extrabold text-lg">{xp} XP</span>
          </div>
          <div className="flex items-center gap-3">
            {streak > 0 && (
              <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
                <Flame className="w-4 h-4 text-amber-200" /> {streak} Streak!
              </div>
            )}
            <div className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full">+50 XP Per Match!</div>
          </div>
        </div>

        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800">⚡ Reward Accelerated Round</span>
          <h2 className="text-xl font-extrabold text-amber-950 mt-1">Match Sequence ({taskIndex + 1} of {tasks.length})</h2>
        </div>

        <div className="bg-white/95 backdrop-blur rounded-3xl border-2 border-amber-300 p-8 text-center shadow-xl space-y-6">
          <div className="text-3xl tracking-widest font-mono text-on-surface p-5 bg-amber-50 rounded-2xl border border-amber-200 font-bold">
            {currentTask.prompt.replace('Match the target symbol sequence: ', '')}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {currentTask.options.map((opt, oi) => (
              <button
                key={oi}
                data-interactive="true"
                onClick={() => handleMotivationAnswer(oi)}
                className="py-4 px-3 rounded-2xl bg-amber-50/70 border-2 border-amber-200 hover:border-amber-400 hover:bg-amber-100 text-amber-950 font-mono text-xl tracking-widest font-extrabold transition-all shadow-sm active:scale-95"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
