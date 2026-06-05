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
import StudentAuth from './components/StudentAuth';

function App() {
  const [view, setView] = useState('landing');
  const [graphData, setGraphData] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);

  // Store the actual logged-in user
  const [currentUser, setCurrentUser] = useState(null);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRole, setAuthRole] = useState(null); // Tracks if they clicked Teacher or Student

  const handleUploadSuccess = (data) => {
    setGraphData(data);
  };

  const handleAssessmentComplete = (metrics) => {
    setStudentProfile(metrics);
    setView('student-lesson');
  };

  const handleNavigate = (target) => {
    if (target === 'teacher') {
      setAuthRole('teacher');
      setShowAuthModal(true);
    } else if (target === 'student-game') {
      setAuthRole('student');
      setShowAuthModal(true);
    } else {
      setView(target);
    }
  };

  // FIXED: Save the user data safely for BOTH Login and Registration
  const handleAuthSuccess = (backendResponse) => {
    // Backend sends .user on login, but .teacher or .student on register!
    const loggedInUser = backendResponse.user || backendResponse.teacher || backendResponse.student;

    setCurrentUser(loggedInUser);
    setShowAuthModal(false);
    setView(loggedInUser.role === 'teacher' ? 'teacher' : 'student-game');
  };

  // NEW: Logout Function
  const handleLogout = () => {
    setCurrentUser(null);
    setGraphData(null);
    setStudentProfile(null);
    setView('landing');
  };

  return (
    <div className="min-h-screen bg-surface font-inter text-on-surface antialiased">

      {/* FIXED: We are now passing currentUser and onLogout to the NavBar! */}
      <TopNavBar
        onNavigate={handleNavigate}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <main>
        {view === 'landing' && (
          <>
            <HeroSection onNavigate={handleNavigate} />
            <TrustBanner />
            <FeatureSections />
          </>
        )}

        {view === 'teacher' && (
          <div className="pt-32 pb-20 px-6 max-w-5xl mx-auto">
            {/* Show teacher's name if logged in */}
            <h2 className="text-2xl font-bold mb-4">Welcome, Educator {currentUser?.name?.split(' ')[0]}</h2>
            {!graphData ? <FileUpload onUploadSuccess={handleUploadSuccess} /> : <Dashboard graphData={graphData} />}
          </div>
        )}

        {view === 'student-game' && (
          <div className="pt-32 pb-20 px-6">
            <Assessment onComplete={handleAssessmentComplete} studentGrade={parseInt(currentUser?.grade) || 5} />
          </div>
        )}

        {view === 'student-lesson' && (
          <div className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
            <Dashboard graphData={graphData} studentProfile={studentProfile} />
          </div>
        )}
      </main>

      <Footer />

      {/* The Auth Modal Bridge */}
      {showAuthModal && authRole === 'teacher' && (
        <EducatorAuth
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* Render StudentAuth when authRole is 'student' */}
      {showAuthModal && authRole === 'student' && (
        <StudentAuth
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}

export default App;
