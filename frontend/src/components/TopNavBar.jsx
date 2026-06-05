import React, { useState, useEffect } from 'react';
import logo from '../assets/logo.png';

function TopNavBar({ onNavigate }) {
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? 'bg-white/80 backdrop-blur-lg shadow-sm'
          : 'bg-transparent'
        }`}
    >
      <div className="max-w-container mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center hover:opacity-80 transition-opacity duration-200"
          >
            <img src={logo} alt="LumynMinds Logo" className="h-8 w-auto object-contain" />
          </button>

          <div className="flex items-center gap-3">
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
          </div>
        </div>
      </div>
    </nav>
  );
}

export default TopNavBar;
