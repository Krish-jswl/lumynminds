import { useState, useEffect } from 'react';
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
        scrolled ? 'bg-surface/85 backdrop-blur-md border-b border-outline-variant/30 shadow-xs' : 'bg-transparent'
      }`}
    >
      <div className="max-w-container mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-16 lg:h-20">

          {/* Logo */}
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center hover:opacity-85 transition-opacity duration-200"
          >
            <img src={logo} alt="LumynMinds Logo" className="h-8 lg:h-9 w-auto object-contain" />
          </button>

          {/* Nav Buttons (Dynamic based on login status) */}
          <div className="flex items-center gap-3">

            {currentUser ? (
              /* --- LOGGED IN VIEW --- */
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-on-surface-variant hidden sm:block">
                  Hi, <strong className="text-on-surface font-semibold">{currentUser.name.split(' ')[0]}</strong>
                </span>

                <button
                  onClick={onLogout}
                  className="inline-flex items-center px-4 py-2 text-label-md font-semibold text-error border border-error/30 rounded-full hover:bg-error/10 hover:border-error transition-all duration-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              /* --- LOGGED OUT VIEW --- */
              <>
                <button
                  onClick={() => onNavigate('teacher')}
                  className="inline-flex items-center px-6 py-2.5 text-label-md font-semibold text-on-surface border border-outline-variant rounded-full bg-white/60 hover:bg-white hover:border-brand-orange hover:text-primary transition-all duration-300 shadow-xs hover:-translate-y-0.5"
                >
                  For Educators
                </button>
                <button
                  onClick={() => onNavigate('student-game')}
                  className="inline-flex items-center px-6 py-2.5 text-label-md font-semibold text-on-surface border border-outline-variant rounded-full bg-white/60 hover:bg-white hover:border-brand-orange hover:text-primary transition-all duration-300 shadow-xs hover:-translate-y-0.5"
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
