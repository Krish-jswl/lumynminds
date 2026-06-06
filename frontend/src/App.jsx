import React, { useState, useEffect } from 'react';
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
<<<<<<< HEAD
import StudentDashboard, { StudentHomeDashboard } from './components/StudentDashboard';

const API_BASE = 'http://localhost:5000/api';
=======
import EducatorDashboard from './components/EducatorDashboard';
import PastMaterials from './components/PastMaterials';
>>>>>>> 69cd1cd1f14792f908f737c714c2628bea68259f

function App() {
  const [view, setView] = useState('landing');
  const [graphData, setGraphData] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRole, setAuthRole] = useState(null);
  const [activeLessonConcept, setActiveLessonConcept] = useState(null);
  const [checkingStudent, setCheckingStudent] = useState(false);

  const handleUploadSuccess = (data) => {
    setGraphData(data);
  };

  const handleAssessmentComplete = (metrics) => {
    setStudentProfile(metrics);
    setView('student-home');
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

  const handleAuthSuccess = (backendResponse) => {
    const loggedInUser = backendResponse.user || backendResponse.teacher || backendResponse.student;
    setCurrentUser(loggedInUser);
    setShowAuthModal(false);

    if (loggedInUser.role === 'teacher') {
      setView('teacher');
    } else {
      setCheckingStudent(true);
      checkStudentStatus(loggedInUser);
    }
  };

  const checkStudentStatus = async (user) => {
    try {
      const res = await fetch(`${API_BASE}/adaptation/student-status/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.needsAssessment) {
          setView('student-game');
        } else {
          setView('student-home');
        }
      } else {
        setView('student-game');
      }
    } catch {
      setView('student-game');
    } finally {
      setCheckingStudent(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setGraphData(null);
    setStudentProfile(null);
    setActiveLessonConcept(null);
    setView('landing');
  };

  const handleOpenLesson = (conceptId) => {
    setActiveLessonConcept(conceptId);
    setView('student-lesson');
  };

  const handleBackToHome = () => {
    setActiveLessonConcept(null);
    setView('student-home');
  };

  if (checkingStudent) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Checking your learning profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface font-inter text-on-surface antialiased">

      {view !== 'student-lesson' && view !== 'student-home' && (
        <TopNavBar
          onNavigate={handleNavigate}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      )}

      <main>
        {view === 'landing' && (
          <>
            <HeroSection onNavigate={handleNavigate} />
            <TrustBanner />
            <FeatureSections />
          </>
        )}

        {view === 'teacher' && (
<<<<<<< HEAD
          <div className="pt-32 pb-20 px-6 max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Welcome, Educator {currentUser?.name?.split(' ')[0]}</h2>
            {!graphData ? <FileUpload onUploadSuccess={handleUploadSuccess} /> : <Dashboard graphData={graphData} />}
=======
          <div className="pt-24">
            <EducatorDashboard currentUser={currentUser} onNavigate={handleNavigate} />
>>>>>>> 69cd1cd1f14792f908f737c714c2628bea68259f
          </div>
        )}

        {view === 'past-materials' && (
          <PastMaterials />
        )}

        {view === 'student-game' && (
          <div className="pt-32 pb-20 px-6">
           <Assessment onComplete={handleAssessmentComplete} currentUser={currentUser} />
          </div>
        )}

        {view === 'student-home' && (
          <div>
            <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
              <div>
                <h1 className="text-lg font-bold text-slate-800">LumynMinds Academy</h1>
                <p className="text-xs text-slate-500">Welcome back, {currentUser?.name?.split(' ')[0] || 'Student'}</p>
              </div>
              <button data-interactive="true" onClick={handleLogout}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                Logout
              </button>
            </div>
            <StudentHomeDashboard onOpenLesson={handleOpenLesson} studentId={currentUser?.id} currentUser={currentUser} />
          </div>
        )}

        {view === 'student-lesson' && (
          <div>
            <div className="bg-white border-b border-slate-200 px-6 py-2 flex items-center gap-4 sticky top-0 z-50">
              <button data-interactive="true" onClick={handleBackToHome}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all flex items-center gap-1">
                ← Back to Subjects
              </button>
              <span className="text-xs text-slate-400">|</span>
              <span className="text-xs text-slate-500 font-medium">Adaptive Lesson</span>
            </div>
            <StudentDashboard conceptFilter={activeLessonConcept} studentId={currentUser?.id} />
          </div>
        )}
      </main>

      {view !== 'student-lesson' && view !== 'student-home' && <Footer />}

      {showAuthModal && authRole === 'teacher' && (
        <EducatorAuth
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}

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
