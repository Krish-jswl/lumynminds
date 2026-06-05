import React, { useState } from 'react';
import TopNavBar from './components/TopNavBar';
import HeroSection from './components/HeroSection';
import TrustBanner from './components/TrustBanner';
import FeatureSections from './components/FeatureSections';
import Footer from './components/Footer';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import Assessment from './components/Assessment';
import EducatorAuth from './components/EducatorAuth';

function App() {
  const [view, setView] = useState('landing');
  const [graphData, setGraphData] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleUploadSuccess = (data) => {
    setGraphData(data);
  };

  const handleAssessmentComplete = (metrics) => {
    setStudentProfile(metrics);
    setView('student-lesson');
  };

  const handleNavigate = (target) => {
    if (target === 'teacher') {
      setShowAuthModal(true);
    } else {
      setView(target);
    }
  };

  const handleAuthSuccess = (data) => {
    setShowAuthModal(false);
    setView('teacher');
  };

  return (
    <div className="min-h-screen bg-surface font-inter text-on-surface antialiased">
      <TopNavBar onNavigate={handleNavigate} />

      <main>
        {view === 'landing' && (
          <>
            <HeroSection onNavigate={handleNavigate} />
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

      {showAuthModal && (
        <EducatorAuth 
          onClose={() => setShowAuthModal(false)} 
          onSuccess={handleAuthSuccess} 
        />
      )}
    </div>
  );
}

export default App;
