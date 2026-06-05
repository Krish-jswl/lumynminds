import React, { useState } from 'react';
// His imports
import TopNavBar from './components/TopNavBar';
import HeroSection from './components/HeroSection';
import TrustBanner from './components/TrustBanner';
import FeatureSections from './components/FeatureSections';
import Footer from './components/Footer';

// Your imports
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import Assessment from './components/Assessment';

function App() {
  // Your state logic
  const [view, setView] = useState('landing'); // 'landing', 'teacher', 'student-game', 'student-lesson'
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
      {/* Navigation: We added your view toggles into his TopNavBar or right below it */}
      <TopNavBar onNavigate={(v) => setView(v)} />

      {/* Conditional Rendering logic */}
      <main>
        {view === 'landing' && (
          <>
            <HeroSection />
            <TrustBanner />
            <FeatureSections />
            <section className="text-center flex items-center justify-center my-24 lg:my-32 max-w-4xl mx-auto px-6 lg:px-10">
              <p className="font-althera font-bold text-[#1a110d] text-h3 md:text-h2">
                "The purpose of learning is growth, and our minds, unlike our bodies, can continue growing as we continue to live."
              </p>
            </section>
          </>
        )}

        {view === 'teacher' && (
          <div className="py-20 flex flex-col items-center">
            {!graphData ? <FileUpload onUploadSuccess={handleUploadSuccess} /> : <Dashboard graphData={graphData} />}
          </div>
        )}

        {view === 'student-game' && (
          <div className="py-20">
            <Assessment onComplete={handleAssessmentComplete} />
          </div>
        )}

        {view === 'student-lesson' && (
          <div className="py-20">
            {!graphData ? <p className="text-center">Teacher needs to upload a curriculum first!</p> : <Dashboard graphData={graphData} studentProfile={studentProfile} />}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}

export default App;
