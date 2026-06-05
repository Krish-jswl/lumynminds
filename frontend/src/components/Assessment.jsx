import React, { useState, useEffect, useRef } from 'react';
import { Target, AlertTriangle, Zap, CheckCircle2, BrainCircuit } from 'lucide-react';

export default function Assessment({ onComplete }) {
  const [gameState, setGameState] = useState('intro'); // intro, playing, analyzing, complete
  const [targets, setTargets] = useState([]);
  const [score, setScore] = useState(0);
  const [misclicks, setMisclicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);

  // Telemetry refs
  const startTime = useRef(0);
  const clickDelays = useRef([]);
  const lastClickTime = useRef(0);

  // Generate a random grid of targets and distractors
  const generateGrid = () => {
    const newTargets = Array.from({ length: 16 }).map(() => ({
      id: Math.random().toString(36).substring(7),
      isTarget: Math.random() > 0.7, // 30% chance to be a valid target
      color: Math.random() > 0.5 ? 'bg-emerald-500' : 'bg-rose-500',
      shape: Math.random() > 0.5 ? 'rounded-full' : 'rounded-lg'
    }));
    // Force at least one valid target to exist
    newTargets[Math.floor(Math.random() * 16)] = { id: 'force', isTarget: true, color: 'bg-emerald-500', shape: 'rounded-full' };
    setTargets(newTargets);
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setMisclicks(0);
    setTimeLeft(15);
    startTime.current = Date.now();
    lastClickTime.current = Date.now();
    clickDelays.current = [];
    generateGrid();
  };

  const handleClick = (isTarget) => {
    const now = Date.now();
    clickDelays.current.push(now - lastClickTime.current);
    lastClickTime.current = now;

    if (isTarget) {
      setScore(s => s + 1);
    } else {
      setMisclicks(m => m + 1);
    }
    generateGrid();
  };

  // Game Timer
  useEffect(() => {
    let timer;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (gameState === 'playing' && timeLeft === 0) {
      finishGame();
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  const finishGame = () => {
    setGameState('analyzing');

    // Simulate the background worker analyzing the telemetry
    setTimeout(() => {
      const avgDelay = clickDelays.current.reduce((a, b) => a + b, 0) / (clickDelays.current.length || 1);

      // Calculate the blueprint's CNV metrics based on actual gameplay
      const metrics = {
        attention_support: Math.min(1.0, misclicks * 0.15), // More misclicks = needs more attention support
        pace_support: avgDelay > 1200 ? 0.8 : 0.3, // Slow clicks = needs slower pace
        gamification_support: score > 10 ? 0.8 : 0.4, // High engagement = responds well to gamification
        fatigue_sensitivity: (misclicks + (avgDelay > 1000 ? 2 : 0)) * 0.1,
        validity: clickDelays.current.length < 3 ? 0 : 1 // The "Bouncer" validation gate
      };

      setGameState('complete');
      if (onComplete) onComplete(metrics);
    }, 2000);
  };

  if (gameState === 'intro') {
    return (
      <div className="max-w-2xl mx-auto mt-12 bg-slate-900 rounded-3xl p-10 text-center shadow-2xl border border-slate-800 text-slate-100">
        <BrainCircuit className="w-16 h-16 text-blue-500 mx-auto mb-6" />
        <h2 className="text-3xl font-extrabold mb-4">Cognitive Calibration</h2>
        <p className="text-slate-400 mb-8 text-lg">
          Before we build your custom workspace, let's see how you process information.
          <br/><br/>
          <span className="text-emerald-400 font-bold">Rule:</span> Click the <span className="px-2 py-1 bg-emerald-500 text-white rounded-full text-sm">Green Circles</span> as fast as you can. Ignore everything else.
        </p>
        <button onClick={startGame} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-12 rounded-xl transition-all shadow-lg hover:shadow-blue-500/25">
          Start 15-Second Engine
        </button>
      </div>
    );
  }

  if (gameState === 'playing') {
    return (
      <div className="max-w-3xl mx-auto mt-8">
        <div className="flex justify-between items-center mb-6 bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <div className="flex gap-6">
            <span className="text-emerald-400 font-bold flex items-center gap-2"><Target className="w-5 h-5"/> {score}</span>
            <span className="text-rose-400 font-bold flex items-center gap-2"><AlertTriangle className="w-5 h-5"/> {misclicks}</span>
          </div>
          <span className="text-2xl font-mono font-bold text-white flex items-center gap-2">
            <Zap className={`w-6 h-6 ${timeLeft < 5 ? 'text-rose-500 animate-pulse' : 'text-yellow-400'}`} />
            00:{timeLeft.toString().padStart(2, '0')}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-4 bg-slate-100 p-6 rounded-3xl shadow-inner border border-slate-200">
          {targets.map((t, i) => (
            <button
              key={`${t.id}-${i}`}
              onClick={() => handleClick(t.color === 'bg-emerald-500' && t.shape === 'rounded-full')}
              className={`aspect-square w-full flex items-center justify-center transition-transform active:scale-95 hover:scale-105 shadow-sm ${t.color} ${t.shape}`}
            />
          ))}
        </div>
      </div>
    );
  }

  if (gameState === 'analyzing') {
    return (
      <div className="max-w-xl mx-auto mt-20 text-center animate-pulse">
        <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-8"></div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Analyzing Telemetry...</h3>
        <p className="text-slate-500 font-medium">Extracting distraction vectors and cognitive load capacity.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-12 bg-white rounded-3xl p-10 text-center shadow-xl border border-slate-200">
      <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
      <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Profile Calibrated</h2>
      <p className="text-slate-500 mb-8 font-medium">Your 12-dimensional Cognitive Needs Vector has been generated.</p>
      <div className="grid grid-cols-2 gap-4 text-left">
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Target Accuracy</p>
          <p className="text-2xl font-black text-slate-800">{score} Hits</p>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Impulse Clicks</p>
          <p className="text-2xl font-black text-rose-500">{misclicks} Misses</p>
        </div>
      </div>
    </div>
  );
}
