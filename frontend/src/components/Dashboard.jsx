import React from 'react';
import { Target, Zap, AlertCircle } from 'lucide-react';

export default function Dashboard({ graphData }) {
  if (!graphData || !graphData.data) return null;
  const blocks = graphData.data;

  // Helper function to turn a decimal into a CSS width percentage
  const getWidth = (decimal) => `${Math.max(5, decimal * 100)}%`;

  // Helper to color-code based on difficulty severity
  const getColor = (val) => {
    if (val < 0.4) return 'bg-emerald-500';
    if (val < 0.7) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="w-full max-w-5xl mx-auto mt-8 animate-in fade-in duration-500">

      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900">Curriculum Map</h2>
          <p className="text-slate-500 font-medium">Analyzed {blocks.length} atomic learning concepts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {blocks.map((block) => (
          <div key={block.concept_id} className="bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-800 text-slate-100 flex flex-col h-full hover:border-slate-700 transition-colors">

            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold tracking-tight text-white">{block.concept}</h3>
              {block.requires_visualization && (
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold rounded-full border border-blue-500/30 flex items-center gap-1">
                  <Target className="w-3 h-3" /> Visual Required
                </span>
              )}
            </div>

            {/* Metrics */}
            <div className="space-y-5 mb-8">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  <span>Difficulty</span>
                  <span>{(block.difficulty * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full ${getColor(block.difficulty)}`}
                    style={{ width: getWidth(block.difficulty) }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  <span>Cognitive Load</span>
                  <span>{(block.cognitive_load * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full ${getColor(block.cognitive_load)}`}
                    style={{ width: getWidth(block.cognitive_load) }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Arrays (Objectives & Misconceptions) */}
            <div className="mt-auto space-y-4">
              {block.learning_objectives?.length > 0 && (
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                  <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2 mb-2">
                    <Zap className="w-3.5 h-3.5 text-yellow-400" /> Objectives
                  </h4>
                  <ul className="text-sm text-slate-300 space-y-1 list-disc pl-4">
                    {block.learning_objectives.map((obj, i) => (
                      <li key={i}>{obj}</li>
                    ))}
                  </ul>
                </div>
              )}

              {block.misconceptions?.length > 0 && (
                <div className="bg-rose-950/30 rounded-xl p-4 border border-rose-900/50">
                  <h4 className="text-xs font-bold text-rose-400 uppercase flex items-center gap-2 mb-2">
                    <AlertCircle className="w-3.5 h-3.5" /> Misconceptions
                  </h4>
                  <ul className="text-sm text-rose-200/80 space-y-1 list-disc pl-4">
                    {block.misconceptions.map((misc, i) => (
                      <li key={i}>{misc}</li>
                    ))}
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
