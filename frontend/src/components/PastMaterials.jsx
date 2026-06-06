import React, { useState } from 'react';
import { Search, Share2 } from 'lucide-react';

/* ── Mock Data ── */
const mockMaterials = [
  { id: 1, title: 'Biology 101 - Cell Structure',       grade: '10' },
  { id: 2, title: 'World History - The Silk Road',       grade: '9'  },
  { id: 3, title: 'Advanced Physics - Mechanics',        grade: '11' },
  { id: 4, title: 'English Lit - Hamlet Analysis',       grade: '12' },
  { id: 5, title: 'Chemistry - Periodic Table Basics',   grade: '8'  },
  { id: 6, title: 'Mathematics - Calculus Intro',        grade: '12' },
  { id: 7, title: 'Geography - Climate Systems',         grade: '7'  },
  { id: 8, title: 'Computer Science - Algorithms',       grade: '11' },
];

/* ── Unique grade options derived from data ── */
const gradeOptions = [...new Set(mockMaterials.map((m) => m.grade))].sort(
  (a, b) => Number(a) - Number(b)
);

function PastMaterials() {
  const [searchTerm, setSearchTerm]       = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');

  /* ── Derived filtered list ── */
  const filteredMaterials = mockMaterials.filter((m) => {
    const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade  = selectedGrade === '' || m.grade === selectedGrade;
    return matchesSearch && matchesGrade;
  });

  return (
    <main className="mt-16 flex-grow max-w-[1280px] mx-auto w-full px-6 pt-10 pb-16">

      {/* ── Page Header ── */}
      <header className="mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-h1 text-h1 text-on-surface">Past Study Materials</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">
              Review and manage previously mapped knowledge nodes.
            </p>
          </div>

          {/* ── Filters ── */}
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-outline"
                strokeWidth={2}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Find materials by name..."
                className="pl-10 pr-4 py-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-4 focus:ring-primary/10 w-full md:w-80 font-body-md transition-all outline-none"
              />
            </div>

            {/* Grade Filter */}
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="appearance-none bg-surface-container-lowest border border-outline-variant rounded-xl px-6 py-4 pr-10 font-body-md text-on-surface focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none cursor-pointer transition-all"
            >
              <option value="">Filter by Grade</option>
              {gradeOptions.map((g) => (
                <option key={g} value={g}>Grade {g}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* ── Card Grid ── */}
      {filteredMaterials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((material) => (
            <article
              key={material.id}
              className="bg-surface-container-lowest rounded-[24px] border border-outline-variant overflow-hidden flex flex-col group hover:border-primary/30 hover:-translate-y-1 transition-all duration-300"
              style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.05)' }}
            >
              <div className="p-6 flex flex-col flex-grow">
                {/* Grade Badge */}
                <div className="flex items-start mb-4 justify-end">
                  <div className="bg-primary/10 backdrop-blur-sm px-4 py-1 rounded-full">
                    <span className="text-primary font-label-sm">Grade {material.grade}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-h3 text-h3 text-on-surface mb-1">{material.title}</h3>

                {/* Actions */}
                <div className="mt-10 flex flex-col gap-2">
                  <button className="w-full bg-primary text-on-primary py-4 rounded-xl font-label-md flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all">
                    <Share2 className="w-5 h-5" strokeWidth={2} />
                    View Knowledge Graph
                  </button>
                  <button className="w-full border border-outline-variant text-on-surface-variant py-4 rounded-xl font-label-md flex items-center justify-center gap-2 hover:bg-surface-container-low active:scale-95 transition-all">
                    View Learning Block
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        /* ── Empty State ── */
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-primary" strokeWidth={1.5} />
          </div>
          <h3 className="font-h3 text-h3 text-on-surface mb-2">No materials found</h3>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Try adjusting your search term or grade filter.
          </p>
        </div>
      )}
    </main>
  );
}

export default PastMaterials;
