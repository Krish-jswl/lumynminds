import React, { useState, useEffect } from 'react';
import logo from '../assets/logo.png';

function TopNavBar() {
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
          {/* Logo */}
          <a
            href="/"
            id="nav-logo"
            className="flex items-center hover:opacity-80 transition-opacity duration-200"
          >
            <img src={logo} alt="LumynMinds Logo" className="h-8 w-auto object-contain" />
          </a>

          {/* Nav Buttons */}
          <div className="flex items-center gap-3">
            <a
              href="#educators"
              id="nav-educators"
              className="hidden sm:inline-flex items-center px-5 py-2.5 text-label-md font-medium text-on-surface-variant border border-outline-variant rounded-[0.5rem] hover:bg-surface-container-low hover:border-primary-container transition-all duration-200"
            >
              For Educators
            </a>
            <a
              href="#learners"
              id="nav-learners"
              className="hidden sm:inline-flex items-center px-5 py-2.5 text-label-md font-medium text-on-surface-variant border border-outline-variant rounded-[0.5rem] hover:bg-surface-container-low hover:border-primary-container transition-all duration-200"
            >
              For Learners
            </a>
            {/* Mobile menu button */}
            <button
              id="nav-mobile-menu"
              className="sm:hidden p-2 rounded-md text-on-surface-variant hover:bg-surface-container-low transition-colors"
              aria-label="Open menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default TopNavBar;
