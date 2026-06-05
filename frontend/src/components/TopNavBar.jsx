import React, { useState, useEffect } from 'react';
import logo from '../assets/logo.png';

function TopNavBar({ onNavigate, currentUser, onLogout }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      id="top-nav"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/80 backdrop-blur-lg shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="max-w-container mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-16 lg:h-20">

          {/* Logo */}
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center hover:opacity-80 transition-opacity duration-200"
          >
            <img src={logo} alt="LumynMinds Logo" className="h-8 w-auto object-contain" />
          </button>

          {/* Nav Buttons (Dynamic based on login status) */}
          <div className="flex items-center gap-3">

            {currentUser ? (
              /* --- LOGGED IN VIEW --- */
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-slate-600 hidden sm:block">
                  Hi, <strong className="text-slate-900">{currentUser.name.split(' ')[0]}</strong>
                </span>
                <button
                  onClick={() => onNavigate(currentUser.role === 'teacher' ? 'teacher' : 'student-game')}
                  className="hidden sm:inline-flex items-center px-4 py-2 text-label-md font-medium text-white bg-brand-orange hover:bg-orange-600 rounded-[0.5rem] transition-all duration-200"
                >
                  Dashboard
                </button>
                <button
                  onClick={onLogout}
                  className="hidden sm:inline-flex items-center px-4 py-2 text-label-md font-medium text-rose-600 border border-rose-200 rounded-[0.5rem] hover:bg-rose-50 transition-all duration-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              /* --- LOGGED OUT VIEW --- */
              <>
                <button
                  onClick={() => onNavigate('teacher')}
                  className="hidden sm:inline-flex items-center px-5 py-2.5 text-label-md font-medium text-on-surface-variant border border-outline-variant rounded-[0.5rem] hover:bg-surface-container-low hover:border-primary-container transition-all duration-200"
                >
                  For Educators
                </button>
                <button
                  onClick={() => onNavigate('student-game')}
                  className="hidden sm:inline-flex items-center px-5 py-2.5 text-label-md font-medium text-on-surface-variant border border-outline-variant rounded-[0.5rem] hover:bg-surface-container-low hover:border-primary-container transition-all duration-200"
                >
                  For Learners
                </button>
              </>
            )}

          </div>
        </div>
      </div>
    </nav>
  );
}

export default TopNavBar;
