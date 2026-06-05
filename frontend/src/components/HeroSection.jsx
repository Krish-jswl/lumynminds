import React, { useEffect, useRef, useState } from 'react';
import heroImage from '../assets/hero-children.png';

function HeroSection() {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      id="hero-section"
      ref={sectionRef}
      className="relative min-h-[90vh] flex items-center overflow-hidden pt-20 lg:pt-24"
    >
      {/* Subtle background radial glow */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-primary-container/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary-container/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-container mx-auto px-6 lg:px-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left: Text Content */}
          <div
            className={`flex flex-col gap-8 transition-all duration-[800ms] ease-out ${
              isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="flex flex-col gap-6">
              <h1 className="text-h1 font-bold text-brand-heading mb-4">
                Imagine a textbook that reads a student's mind
              </h1>
              <p className="text-body-lg text-brand-body max-w-lg leading-relaxed">
                Every student's brain is unique, and their UI should be, too.
                LumynMinds tracks real-time interaction metrics to seamlessly
                adapt reading support, chunking, and layout ensuring
                zero-latency personalization to prevent cognitive fatigue.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#educators"
                id="hero-cta-educators"
                className="group inline-flex items-center gap-2 px-7 py-3.5 bg-brand-orange text-white font-semibold text-body-md rounded-full hover:bg-brand-orange-hover hover:text-brand-heading shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5"
              >
                For Educators
                <span className="transition-transform duration-200 group-hover:translate-x-1">
                  &gt;
                </span>
              </a>
              <a
                href="#learners"
                id="hero-cta-learners"
                className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 text-on-surface font-medium text-body-md border border-outline-variant rounded-full bg-transparent hover:border-primary-container hover:bg-surface-container-lowest transition-all duration-300 hover:-translate-y-0.5"
              >
                For Learners
                <span className="transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </a>
            </div>
          </div>

          {/* Right: Hero Image Card */}
          <div
            className={`relative flex justify-center lg:justify-end transition-all duration-[1000ms] ease-out delay-200 ${
              isVisible
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 translate-x-8'
            }`}
          >
            {/* Radial glow behind the card */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[90%] h-[90%] bg-gradient-radial from-primary-container/15 via-secondary-container/8 to-transparent rounded-full blur-[60px]" />
            </div>

            {/* Image Card */}
            <div className="relative w-full max-w-md lg:max-w-lg">
              <div className="relative bg-white rounded-xl overflow-hidden shadow-soft border border-outline-variant/30">
                <img
                  src={heroImage}
                  alt="Diverse children holding hands and jumping joyfully — representing inclusive, neuro-adaptive learning"
                  className="w-full h-auto object-cover aspect-[4/3]"
                  loading="eager"
                />
              </div>

              {/* Floating "Learner-Calibrated" Badge */}
              <div
                id="badge-learner-calibrated"
                className={`absolute -bottom-4 left-1/2 -translate-x-1/2 z-10 transition-all duration-[1200ms] ease-out delay-500 ${
                  isVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-4'
                }`}
              >
                <div className="bg-white/90 backdrop-blur-md border border-outline-variant/40 rounded-full px-6 py-2.5 shadow-card animate-float">
                  <span className="text-label-sm font-semibold text-on-surface tracking-widest uppercase">
                    Learner-Calibrated
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
