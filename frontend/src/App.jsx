import { useState, useEffect } from 'react';
import logo from './assets/logo.png';
import TopNavBar from './components/TopNavBar';
import HeroSection from './components/HeroSection';
import TrustBanner from './components/TrustBanner';
import FeatureSections from './components/FeatureSections';
import Footer from './components/Footer';
import Assessment from './components/Assessment';
import EducatorAuth from './components/EducatorAuth';
import StudentAuth from './components/StudentAuth';
import StudentDashboard, { StudentHomeDashboard } from './components/StudentDashboard';

const API_BASE = 'http://localhost:5000/api';
import EducatorDashboard from './components/EducatorDashboard';
import PastMaterials from './components/PastMaterials';

function App() {
  const [view, setView] = useState('landing');
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRole, setAuthRole] = useState(null);
  const [activeLessonConcept, setActiveLessonConcept] = useState(null);
  const [checkingStudent, setCheckingStudent] = useState(false);

  // Automatically scroll to the top of the page whenever the user switches views or opens a lesson
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [view, activeLessonConcept]);

  const handleAssessmentComplete = () => {
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
      <div className="min-h-screen bg-surface flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-on-surface-variant font-medium text-sm">Calibrating your learning profile...</p>
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
          <div className="pt-24">
            <EducatorDashboard currentUser={currentUser} onNavigate={handleNavigate} />
          </div>
        )}

        {view === 'past-materials' && (
          <PastMaterials />
        )}

        {view === 'student-game' && (
          <div className="pt-28 pb-20 px-6">
           <Assessment onComplete={handleAssessmentComplete} currentUser={currentUser} />
          </div>
        )}

        {view === 'student-home' && (
          <div>
            <div className="bg-surface/90 backdrop-blur-md border-b border-outline-variant/30 px-6 py-3.5 flex items-center justify-between sticky top-0 z-50">
              <div className="flex items-center gap-3">
                <button onClick={() => setView('landing')} className="flex items-center hover:opacity-85 transition-opacity">
                  <img src={logo} alt="LumynMinds Logo" className="h-7 w-auto object-contain" />
                </button>
                <span className="hidden sm:inline-block text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
                  Academy
                </span>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-xs text-on-surface-variant font-medium hidden sm:block">
                  Welcome back, <strong className="text-on-surface font-semibold">{currentUser?.name?.split(' ')[0] || 'Student'}</strong>
                </p>
                <button
                  data-interactive="true"
                  onClick={handleLogout}
                  className="px-5 py-1.5 text-xs font-semibold text-on-surface border border-outline-variant rounded-full hover:text-error hover:border-error/40 hover:bg-error/10 transition-all shadow-xs"
                >
                  Logout
                </button>
              </div>
            </div>
            <StudentHomeDashboard
              onOpenLesson={handleOpenLesson}
              studentId={currentUser?.id}
              currentUser={currentUser}
              onRetakeAssessment={() => setView('student-game')}
            />
          </div>
        )}

        {view === 'student-lesson' && (
          <div>
            <div className="bg-surface/90 backdrop-blur-md border-b border-outline-variant/30 px-6 py-2.5 flex items-center justify-between sticky top-0 z-50">
              <div className="flex items-center gap-3">
                <button
                  data-interactive="true"
                  onClick={handleBackToHome}
                  className="px-4 py-1.5 text-xs font-semibold text-on-surface bg-white/70 border border-outline-variant rounded-full hover:bg-white hover:text-primary hover:border-brand-orange transition-all flex items-center gap-1.5 shadow-xs"
                >
                  ← Back to Subjects
                </button>
                <img src={logo} alt="LumynMinds" className="h-6 w-auto object-contain hidden md:inline ml-2" />
              </div>
              <span className="text-[11px] font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full uppercase tracking-wider">
                Adaptive Concept Lesson
              </span>
            </div>
            <StudentDashboard
              conceptFilter={activeLessonConcept}
              studentId={currentUser?.id}
              onBackToDashboard={handleBackToHome}
            />
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
