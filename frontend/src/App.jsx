import React from 'react';
import TopNavBar from './components/TopNavBar';
import HeroSection from './components/HeroSection';
import TrustBanner from './components/TrustBanner';
import FeatureSections from './components/FeatureSections';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-surface font-inter text-on-surface antialiased">
      <TopNavBar />
      <main>
        <HeroSection />
        <TrustBanner />
        <FeatureSections />
        
        <section className="text-center flex items-center justify-center my-24 lg:my-32 max-w-4xl mx-auto px-6 lg:px-10">
          <p className="font-althera font-bold text-[#1a110d] text-h3 md:text-h2">
            "The purpose of learning is growth, and our minds, unlike our bodies, can continue growing as we continue to live."
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default App;
