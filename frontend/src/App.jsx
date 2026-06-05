// Tracked by Git
import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import { BrainCircuit } from 'lucide-react';

function App() {
  const [graphData, setGraphData] = useState(null);

  // This function is triggered by our FileUpload component when Groq finishes
  const handleUploadSuccess = (data) => {
    console.log("Success! Received blocks:", data);
    setGraphData(data);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans p-8 flex flex-col items-center">
      
      {/* Header */}
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
      <main className="w-full max-w-4xl flex-1">
        {!graphData ? (
          <FileUpload onUploadSuccess={handleUploadSuccess} />
        ) : (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold mb-2 text-slate-800 flex items-center gap-2">
              <span className="text-green-500">✓</span> Ingestion Complete
            </h2>
            <p className="text-slate-500 mb-6 font-medium">Successfully processed {graphData.blocksProcessed} atomic learning blocks.</p>
            
            {/* Temporary raw data view */}
            <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto shadow-inner">
              <pre className="text-green-400 text-sm font-mono">
                {JSON.stringify(graphData.data, null, 2)}
              </pre>
            </div>
            
            <button 
              onClick={() => setGraphData(null)}
              className="mt-6 px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors"
            >
              Upload Another Curriculum
            </button>
          </div>
        )}
      </main>
      
    </div>
  );
}

export default App;
