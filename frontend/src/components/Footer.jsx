import logo from '../assets/logo.png';

function Footer() {
  return (
    <footer
      id="footer"
      className="relative bg-inverse-surface text-inverse-on-surface border-t border-inverse-surface/40"
    >
      <div className="max-w-container mx-auto px-6 lg:px-10 py-8 lg:py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <a
            href="/"
            id="footer-logo"
            className="flex items-center hover:opacity-80 transition-opacity duration-200"
          >
            <img src={logo} alt="LumynMinds" className="h-7 w-auto object-contain brightness-0 invert opacity-90" />
          </a>

          {/* Copyright */}
          <p className="text-label-md text-inverse-on-surface/70 font-normal">
            © {new Date().getFullYear()} LumynMinds. Designed for Neuro-Inclusive Learning.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
