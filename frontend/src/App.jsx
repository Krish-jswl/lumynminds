import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import Assessment from './components/Assessment';
import { BrainCircuit } from 'lucide-react';

function App() {
  const [graphData, setGraphData] = useState(null);
  const [view, setView] = useState('teacher'); // 'teacher' or 'student'

  // Triggered by FileUpload when Groq finishes parsing
  const handleUploadSuccess = (data) => {
    setGraphData(data);
  };

  // Triggered by Assessment when the 15-second game ends
  const handleAssessmentComplete = (metrics) => {
    console.log("Extracted CNV Metrics:", metrics);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans p-8 flex flex-col items-center relative">

      {/* Hackathon Demo Toggle */}
      <div className="absolute top-6 right-8 bg-white rounded-full p-1 shadow-sm border border-slate-200 flex gap-1 z-50">
        <button
          onClick={() => setView('teacher')}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${view === 'teacher' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          Teacher View
        </button>
        <button
          onClick={() => setView('student')}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${view === 'student' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          Student View
        </button>
      </div>

      {/* Global Header */}
      <header className="mb-12 text-center mt-10">
        <div className="flex justify-center mb-4">
          <div className="bg-slate-900 p-3 rounded-2xl shadow-lg">
            <BrainCircuit className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">LumynMinds</h1>
        <p className="text-lg text-slate-500 font-medium">Adaptive Cognitive Learning Infrastructure</p>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-5xl flex-1 flex flex-col items-center">
        {view === 'teacher' ? (
          !graphData ? (
            <FileUpload onUploadSuccess={handleUploadSuccess} />
          ) : (
            <>
              <Dashboard graphData={graphData} />
              <button
                onClick={() => setGraphData(null)}
                className="mt-12 px-6 py-3 bg-white shadow-sm border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
              >
                Upload New Curriculum
              </button>
            </>
          )
        ) : (
          <Assessment onComplete={handleAssessmentComplete} />
        )}
      </main>

    </div>
  );
}

export default App;
