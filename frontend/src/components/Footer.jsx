import React from 'react';

function Footer() {
  return (
    <footer
      id="footer"
      className="relative bg-inverse-surface text-inverse-on-surface"
    >
      <div className="max-w-container mx-auto px-6 lg:px-10 py-8 lg:py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <a
            href="/"
            id="footer-logo"
            className="text-xl font-bold tracking-tight text-white hover:text-inverse-primary transition-colors duration-200"
          >
            LumynMinds
          </a>

          {/* Copyright */}
          <p className="text-label-md text-inverse-on-surface/70 font-normal">
            © {new Date().getFullYear()} LumynMinds. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
