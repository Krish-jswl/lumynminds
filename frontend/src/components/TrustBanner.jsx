import React, { useEffect, useRef, useState } from 'react';

const features = [
  {
    id: 'feature-neuro-profiles',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 4a7 7 0 0 1 7 7c0 1.5-.6 2.8-1.5 3.8L16 17v4H9v-3H7l-1.5-2A7 7 0 0 1 12 4z" />
        <circle cx="12" cy="11.5" r="2" />
        <path d="M12 8.5v1M12 13.5v1M9 11.5h1M14 11.5h1M9.5 9.5l1 1M14.5 13.5l-1-1M9.5 13.5l1-1M14.5 9.5l-1 1" />
      </svg>
    ),
    title: 'Neuro-Inclusive Profiles',
  },
  {
    id: 'feature-zero-latency',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
      </svg>
    ),
    title: 'Zero-Latency Adaptation',
  },
  {
    id: 'feature-human-loop',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
      </svg>
    ),
    title: 'Human-in-the-Loop Validation',
  },
  {
    id: 'feature-sensory-safe',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </svg>
    ),
    title: 'Sensory-Safe Interfaces',
  },
];

function TrustBanner() {
  const bannerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (bannerRef.current) {
      observer.observe(bannerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="trust-banner"
      ref={bannerRef}
      className="relative py-16 lg:py-24"
    >
      {/* Subtle divider */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-container">
        <div className="h-px bg-gradient-to-r from-transparent via-outline-variant/40 to-transparent" />
      </div>

      <div className="max-w-container mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              id={feature.id}
              className={`group flex flex-col items-start gap-4 transition-all duration-700 ease-out ${
                isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-6'
              }`}
              style={{
                transitionDelay: isVisible ? `${index * 150}ms` : '0ms',
              }}
            >
              {/* Icon container */}
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-container/15 text-primary-container transition-colors duration-300 group-hover:bg-brand-orange group-hover:text-white">
                {feature.icon}
              </div>
              {/* Feature label */}
              <span className="text-label-md font-medium text-on-surface leading-snug">
                {feature.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TrustBanner;
