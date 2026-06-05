import React, { useEffect, useRef, useState } from 'react';
import educatorImg from '../assets/educator.png';
import learnerImg from '../assets/learner.png';

function FeatureSections() {
  return (
    <div className="py-16 lg:py-24">
      <div className="max-w-container mx-auto px-6 lg:px-10 flex flex-col gap-24 lg:gap-32">
        
        {/* Section 1: Educator Section (Text Left, Image Right) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left Column (Text) */}
          <div className="flex flex-col">
            <h2 className="text-h2 bg-gradient-to-r from-brand-orange to-primary bg-clip-text text-transparent mb-6">
              Command the Classroom with Cognitive Telemetry
            </h2>
            <p className="text-body-lg text-on-surface-variant mb-8">
              Give educators unprecedented visibility into how their students process information. Because the educator and learner dashboards are perfectly synchronized, any insights gathered or manual adjustments made are instantly reflected in the student's digital environment.
            </p>
            <ul className="flex flex-col gap-5">
              <li className="flex items-start gap-3">
                <div className="mt-1.5 w-2 h-2 rounded-full bg-brand-orange shrink-0" />
                <p className="text-body-md text-on-surface-variant">
                  <span className="font-semibold text-on-surface">Smart Content Ingestion:</span> Upload standard PDFs and let the AI automatically map them into dynamic, adaptable "Lego blocks" of knowledge.
                </p>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1.5 w-2 h-2 rounded-full bg-brand-orange shrink-0" />
                <p className="text-body-md text-on-surface-variant">
                  <span className="font-semibold text-on-surface">Unified Real-Time Insights:</span> Monitor live cognitive load, fatigue meters, and engagement metrics across your entire classroom.
                </p>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1.5 w-2 h-2 rounded-full bg-brand-orange shrink-0" />
                <p className="text-body-md text-on-surface-variant">
                  <span className="font-semibold text-on-surface">Human-in-the-Loop Override:</span> Retain absolute pedagogical authority. Lock, tweak, or approve the system's structural adaptations with a single click.
                </p>
              </li>
            </ul>
          </div>
          
          {/* Right Column (Image) */}
          <div className="relative flex justify-center md:justify-end">
            <img 
              src={educatorImg} 
              alt="Educator Dashboard" 
              className="w-full h-auto rounded-2xl border border-outline-variant shadow-xl object-cover aspect-[4/3]" 
            />
          </div>
        </section>

        {/* Section 2: Learner Section (Image Left, Text Right) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left Column (Image) - Visual order reversed on md+ using order classes */}
          <div className="relative flex justify-center md:justify-start order-last md:order-first">
            <img 
              src={learnerImg} 
              alt="Student Learning" 
              className="w-full h-auto rounded-2xl border border-outline-variant shadow-xl object-cover aspect-[4/3]" 
            />
          </div>

          {/* Right Column (Text) */}
          <div className="flex flex-col">
            <h2 className="text-h2 bg-gradient-to-r from-brand-orange to-primary bg-clip-text text-transparent mb-6">
              A Digital Workspace That Adapts to Your Mind
            </h2>
            <p className="text-body-lg text-on-surface-variant mb-8">
              Education shouldn't cause cognitive overload. The platform monitors your real-time interaction patterns, seamlessly reconstructing the interface on the fly to match your unique focus, reading preferences, and energy levels.
            </p>
            <ul className="flex flex-col gap-5">
              <li className="flex items-start gap-3">
                <div className="mt-1.5 w-2 h-2 rounded-full bg-brand-orange shrink-0" />
                <p className="text-body-md text-on-surface-variant">
                  <span className="font-semibold text-on-surface">Zero-Friction Profiling:</span> No tedious questionnaires. The system builds your 12-point Cognitive Needs Vector through a quick, 4-minute interactive baseline game.
                </p>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1.5 w-2 h-2 rounded-full bg-brand-orange shrink-0" />
                <p className="text-body-md text-on-surface-variant">
                  <span className="font-semibold text-on-surface">Dynamic Scaffolding:</span> Struggling with a dense paragraph? The UI automatically injects visual analogies, audio support, or checkpoint quizzes exactly when frustration hits.
                </p>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1.5 w-2 h-2 rounded-full bg-brand-orange shrink-0" />
                <p className="text-body-md text-on-surface-variant">
                  <span className="font-semibold text-on-surface">Sensory-Safe Mode:</span> If your fatigue meter spikes, the interface actively calms down—muting bright colors, increasing line spacing, and isolating text to prevent burnout.
                </p>
              </li>
            </ul>
          </div>
        </section>

      </div>
    </div>
  );
}

export default FeatureSections;
