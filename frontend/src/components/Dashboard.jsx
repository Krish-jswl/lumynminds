import React from 'react';
import { Target, Zap, AlertCircle, Eye, ShieldAlert } from 'lucide-react';

export default function Dashboard({ graphData, studentProfile }) {
  if (!graphData || !graphData.data) return null;
  const blocks = graphData.data;

  // --- THE ADAPTIVE RULE ENGINE ---
  // If no profile exists (Teacher View), default to standard UI.
  const isSafeMode = studentProfile?.fatigue_sensitivity >= 0.5;
  const isFocusMode = studentProfile?.attention_support >= 0.5;

  // Adaptive Styling Variables
  const containerBg = isSafeMode ? 'bg-stone-900 border-stone-800' : 'bg-slate-900 border-slate-800';
  const textColor = isSafeMode ? 'text-stone-300' : 'text-slate-300';
  const headingColor = isSafeMode ? 'text-stone-100' : 'text-white';

  // Helper function to turn a decimal into a CSS width percentage
  const getWidth = (decimal) => `${Math.max(5, decimal * 100)}%`;

  const getColor = (val) => {
    if (val < 0.4) return 'bg-emerald-500';
    if (val < 0.7) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="w-full max-w-5xl mx-auto mt-8 animate-in fade-in duration-500">

      {/* Active Adaptation Alerts */}
      {studentProfile && (
        <div className="flex gap-4 mb-6">
          {isFocusMode && (
            <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500 text-sm font-bold flex items-center gap-2 animate-pulse">
              <Eye className="w-4 h-4" /> Focus Mode Engaged: High Distraction Vector Detected
            </div>
          )}
          {isSafeMode && (
            <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 text-sm font-bold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> Safe Mode Engaged: Visuals Muted to Reduce Cognitive Load
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className={`text-3xl font-extrabold ${studentProfile ? 'text-blue-600' : 'text-slate-900'}`}>
            {studentProfile ? 'Your Adaptive Workspace' : 'Curriculum Map'}
          </h2>
          <p className="text-slate-500 font-medium">Analyzed {blocks.length} atomic learning concepts</p>
        </div>
      </div>

      {/* Grid Layout changes based on Focus Mode */}
      <div className={`grid gap-6 ${isFocusMode ? 'grid-cols-1 max-w-2xl mx-auto' : 'grid-cols-1 md:grid-cols-2'}`}>
        {blocks.map((block) => (
          <div key={block.concept_id} className={`${containerBg} rounded-2xl p-6 shadow-xl border transition-all duration-500 flex flex-col h-full hover:border-slate-600`}>

            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <h3 className={`text-xl font-bold tracking-tight ${headingColor} ${isSafeMode ? 'text-2xl' : ''}`}>{block.concept}</h3>
              {block.requires_visualization && !isSafeMode && (
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold rounded-full border border-blue-500/30 flex items-center gap-1">
                  <Target className="w-3 h-3" /> Visual Required
                </span>
              )}
            </div>

            {/* Metrics (Hidden in Focus Mode to reduce overwhelm) */}
            {!isFocusMode && (
              <div className="space-y-5 mb-8">
                <div>
                  <div className={`flex justify-between text-xs font-semibold ${textColor} mb-1.5 uppercase tracking-wider`}>
                    <span>Difficulty</span>
                  </div>
                  <div className={`w-full ${isSafeMode ? 'bg-stone-800' : 'bg-slate-800'} rounded-full h-2.5 overflow-hidden`}>
                    <div className={`h-2.5 rounded-full ${getColor(block.difficulty)}`} style={{ width: getWidth(block.difficulty) }}></div>
                  </div>
                </div>
              </div>
            )}

            {/* Arrays */}
            <div className="mt-auto space-y-4">
              {block.learning_objectives?.length > 0 && (
                <div className={`${isSafeMode ? 'bg-stone-800/50 border-stone-700/50' : 'bg-slate-800/50 border-slate-700/50'} rounded-xl p-4 border`}>
                  <h4 className={`text-xs font-bold uppercase flex items-center gap-2 mb-2 ${isSafeMode ? 'text-stone-400' : 'text-slate-400'}`}>
                    <Zap className="w-3.5 h-3.5 text-yellow-400" /> Objectives
                  </h4>
                  <ul className={`text-sm ${textColor} space-y-2 list-disc pl-4 ${isSafeMode ? 'text-base leading-relaxed' : ''}`}>
                    {block.learning_objectives.map((obj, i) => <li key={i}>{obj}</li>)}
                  </ul>
                </div>
              )}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
