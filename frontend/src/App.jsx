import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import Assessment from './components/Assessment';
import { BrainCircuit } from 'lucide-react';

function App() {
  const [graphData, setGraphData] = useState(null);
  const [view, setView] = useState('teacher'); // 'teacher', 'student-game', 'student-lesson'
  const [studentProfile, setStudentProfile] = useState(null);

  const handleUploadSuccess = (data) => setGraphData(data);

  const handleAssessmentComplete = (metrics) => {
    setStudentProfile(metrics);
    setView('student-lesson'); // Instantly transition to the adapted curriculum
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans p-8 flex flex-col items-center relative">

      {/* Navigation */}
      <div className="absolute top-6 right-8 bg-white rounded-full p-1 shadow-sm border border-slate-200 flex gap-1 z-50">
        <button
          onClick={() => setView('teacher')}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${view === 'teacher' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          Teacher View
        </button>
        <button
          onClick={() => {
            setStudentProfile(null);
            setView('student-game');
          }}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${view.startsWith('student') ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          Student View
        </button>
      </div>

      <header className="mb-12 text-center mt-10">
        <div className="flex justify-center mb-4">
          <div className="bg-slate-900 p-3 rounded-2xl shadow-lg">
            <BrainCircuit className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">LumynMinds</h1>
      </header>

      <main className="w-full max-w-5xl flex-1 flex flex-col items-center">
        {view === 'teacher' && (
          !graphData ? <FileUpload onUploadSuccess={handleUploadSuccess} /> : <Dashboard graphData={graphData} />
        )}

        {view === 'student-game' && (
          <Assessment onComplete={handleAssessmentComplete} />
        )}

        {view === 'student-lesson' && (
          !graphData ? (
            <div className="text-center mt-20 text-slate-500">
              <p>Teacher needs to upload a curriculum first!</p>
            </div>
          ) : (
            <Dashboard graphData={graphData} studentProfile={studentProfile} />
          )
        )}
      </main>

    </div>
  );
}

export default App;
