import React, { useState } from 'react';
import TopNavBar from './components/TopNavBar';
import HeroSection from './components/HeroSection';
import TrustBanner from './components/TrustBanner';
import FeatureSections from './components/FeatureSections';
import Footer from './components/Footer';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import Assessment from './components/Assessment';

function App() {
  const [view, setView] = useState('landing');
  const [graphData, setGraphData] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);

  const handleUploadSuccess = (data) => {
    setGraphData(data);
    setView('teacher');
  };

  const handleAssessmentComplete = (metrics) => {
    setStudentProfile(metrics);
    setView('student-lesson');
  };

  return (
    <div className="min-h-screen bg-surface font-inter text-on-surface antialiased">
      <TopNavBar onNavigate={setView} />

      <main>
        {view === 'landing' && (
          <>
            <HeroSection onNavigate={setView} />
            <TrustBanner />
            <FeatureSections />
          </>
        )}

        {view === 'teacher' && (
          <div className="pt-32 pb-20 px-6 max-w-5xl mx-auto">
            {!graphData ? <FileUpload onUploadSuccess={handleUploadSuccess} /> : <Dashboard graphData={graphData} />}
          </div>
        )}

        {view === 'student-game' && (
          <div className="pt-32 pb-20 px-6">
            <Assessment onComplete={handleAssessmentComplete} />
          </div>
        )}

        {view === 'student-lesson' && (
          <div className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
            <Dashboard graphData={graphData} studentProfile={studentProfile} />
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}

export default App;
