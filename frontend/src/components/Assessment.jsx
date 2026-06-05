import React, { useState, useRef } from 'react';
import { BrainCircuit, ShieldAlert, CheckCircle2, Search } from 'lucide-react';

export default function Assessment({ onComplete }) {
  const [gameState, setGameState] = useState('intro'); // intro, playing, analyzing, complete, rejected
  const [foundFacts, setFoundFacts] = useState([]);

  // Telemetry
  const misclicks = useRef(0);
  const spamClicks = useRef(0);
  const startTime = useRef(0);

  // The Narrative Data
  const storyParts = [
    { id: 's1', text: "The crew of the Artemis mission prepared for their long journey. ", type: 'distractor' },
    { id: 'f1', text: "Jupiter is the largest planet in our solar system.", type: 'target' },
    { id: 's2', text: " The ship's hull was painted a bright, metallic silver to reflect the harsh light. ", type: 'distractor' },
    { id: 's3', text: "Navigation calculated the complex trajectory, keeping in mind that ", type: 'neutral' },
    { id: 'f2', text: "Venus rotates in the opposite direction to most planets.", type: 'target' },
    { id: 's4', text: " Engineer Vance quietly ate a turkey sandwich in the mess hall. ", type: 'distractor' },
    { id: 's5', text: "Finally, the team calibrated the orbital sensors for the red planet, knowing well that ", type: 'neutral' },
    { id: 'f3', text: "Mars has two small moons named Phobos and Deimos.", type: 'target' },
    { id: 's6', text: " Outside the viewport, the distant stars twinkled brightly.", type: 'distractor' }
  ];

  const startGame = () => {
    setGameState('playing');
    setFoundFacts([]);
    misclicks.current = 0;
    spamClicks.current = 0;
    startTime.current = Date.now();
  };

  const handleSpanClick = (e, part) => {
    e.stopPropagation(); // Stop background click from registering

    if (part.type === 'target') {
      if (!foundFacts.includes(part.id)) {
        const newFound = [...foundFacts, part.id];
        setFoundFacts(newFound);
        if (newFound.length === 3) finishGame();
      }
    } else {
      misclicks.current += 1;
    }
  };

  const handleBackgroundClick = () => {
    spamClicks.current += 1;
  };

  const finishGame = () => {
    setGameState('analyzing');
    const timeTaken = (Date.now() - startTime.current) / 1000;

    setTimeout(() => {
      // THE BOUNCER: Filter out garbage data
      if (timeTaken < 3 || spamClicks.current > 5) {
        setGameState('rejected');
        return;
      }

      // Generate the 12-Dimensional Profile (Simulated for Hackathon)
      const metrics = {
        validity: 1, // Passed the Bouncer
        attention_support: Math.min(1.0, misclicks.current * 0.25),
        pace_support: timeTaken > 20 ? 0.8 : 0.3,
        fatigue_sensitivity: (spamClicks.current * 0.2),
        confidence_score: misclicks.current === 0 ? 0.95 : 0.60,
        need_for_visuals: timeTaken > 15 ? 0.85 : 0.40
      };

      setGameState('complete');
      if (onComplete) onComplete(metrics);
    }, 2000);
  };

  if (gameState === 'intro') {
    return (
      <div className="max-w-2xl mx-auto mt-12 bg-slate-900 rounded-3xl p-10 text-center shadow-2xl border border-slate-800 text-slate-100">
        <BrainCircuit className="w-16 h-16 text-blue-500 mx-auto mb-6" />
        <h2 className="text-3xl font-extrabold mb-4">First Day Calibration</h2>
        <p className="text-slate-400 mb-8 text-lg">
          Let's see how you process information. Read the short log below and click on the <span className="text-blue-400 font-bold">3 hidden space facts</span>.
        </p>
        <button onClick={startGame} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-12 rounded-xl transition-all shadow-lg">
          Begin Assessment
        </button>
      </div>
    );
  }

  if (gameState === 'playing') {
    return (
      <div
        className="max-w-3xl mx-auto mt-8 bg-white p-10 rounded-3xl shadow-xl border border-slate-200 cursor-text select-none"
        onClick={handleBackgroundClick}
      >
        <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-500"/> Find the 3 Facts
          </h3>
          <span className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full font-bold text-sm">
            {foundFacts.length} / 3 Found
          </span>
        </div>

        <p className="text-xl leading-loose text-slate-700">
          {storyParts.map((part, i) => {
            const isFound = foundFacts.includes(part.id);
            return (
              <span
                key={i}
                onClick={(e) => handleSpanClick(e, part)}
                className={`transition-colors duration-200 rounded-md px-1
                  ${isFound ? 'bg-emerald-100 text-emerald-800 font-semibold' : 'hover:bg-slate-100 cursor-pointer'}`
                }
              >
                {part.text}
              </span>
            );
          })}
        </p>
      </div>
    );
  }

  if (gameState === 'analyzing') {
    return (
      <div className="max-w-xl mx-auto mt-20 text-center animate-pulse">
        <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-8"></div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Analyzing Reading Patterns...</h3>
        <p className="text-slate-500 font-medium">Running telemetry through The Bouncer validation gate.</p>
      </div>
    );
  }

  if (gameState === 'rejected') {
    return (
      <div className="max-w-2xl mx-auto mt-12 bg-rose-50 rounded-3xl p-10 text-center shadow-xl border border-rose-200">
        <ShieldAlert className="w-20 h-20 text-rose-500 mx-auto mb-6" />
        <h2 className="text-3xl font-extrabold text-rose-900 mb-4">Assessment Invalidated</h2>
        <p className="text-rose-700 mb-8 font-medium text-lg">
          The Bouncer detected erratic clicking or insufficient time spent on the task. We need accurate data to build your profile.
        </p>
        <button onClick={startGame} className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-12 bg-white rounded-3xl p-10 text-center shadow-xl border border-slate-200">
      <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
      <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Profile Calibrated</h2>
      <p className="text-slate-500 mb-8 font-medium">Valid effort detected. Your cognitive parameters have been mapped.</p>
    </div>
  );
}
