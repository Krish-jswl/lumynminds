import React, { useState, useRef, useEffect } from 'react';
import {
  CloudUpload,
  CheckCircle,
  ArrowRight,
  ChevronRight,
  X,
  Info,
  UserPlus,
  BookOpen,
  Loader2,
  AlertCircle
} from 'lucide-react';

/* ── Static Data ── */
const knowledgeGraphRows = [
  { id: 'BIO-C01', difficulty: 'Introductory', diffColor: 'bg-green-100 text-green-700', load: '1.2 (Low)', blocks: 'Cell Theory, Membrane Struct.' },
  { id: 'BIO-C02', difficulty: 'Intermediate', diffColor: 'bg-orange-100 text-orange-700', load: '4.8 (Med)', blocks: 'Mitosis Phases, ATP Cycle' },
  { id: 'BIO-C03', difficulty: 'Advanced', diffColor: 'bg-red-100 text-red-700', load: '8.9 (High)', blocks: 'CRISPR Editing, RNA Seq.' },
];

const sliderGroups = [
  {
    title: 'Cognitive & Focus Weights',
    sliders: [
      { label: 'Attention Support', defaultValue: 75 },
      { label: 'Sensory Support', defaultValue: 40 },
      { label: 'Executive Function', defaultValue: 60 },
      { label: 'Engagement Threshold', defaultValue: 85 },
    ],
  },
  {
    title: 'Communication & Output',
    sliders: [
      { label: 'Verbal Processing', defaultValue: 50 },
      { label: 'Written Expression', defaultValue: 30 },
      { label: 'Visual Aid Density', defaultValue: 90 },
      { label: 'Social Interaction', defaultValue: 45 },
    ],
  },
  {
    title: 'Emotional Support',
    sliders: [
      { label: 'Resilience Support', defaultValue: 65 },
      { label: 'Anxiety Buffer', defaultValue: 70 },
      { label: 'Break Frequency', defaultValue: 50 },
      { label: 'Positive Reinforcement', defaultValue: 95 },
    ],
  },
];

function EducatorDashboard({ onNavigate, currentUser }) {
  /* ── State ── */
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [showGraph, setShowGraph] = useState(false);
  const [activeStudent, setActiveStudent] = useState(null);



  // NOTE: This sets the default dropdown value. Change to '7' or '9' if you prefer!
  const [selectedGrade, setSelectedGrade] = useState('10');

  const [sliderValues, setSliderValues] = useState(
    sliderGroups.flatMap((g) => g.sliders.map((s) => s.defaultValue))
  );
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  /* ── Dynamic Student State ── */
  const [students, setStudents] = useState([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [fetchError, setFetchError] = useState('');

  /* ── Effect: Fetch Students from MongoDB ── */
  useEffect(() => {
    const fetchStudents = async () => {
      if (!currentUser || !currentUser.institute) {
        setIsLoadingStudents(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/auth/students?institute=${encodeURIComponent(currentUser.institute)}`);
        const data = await response.json();

        if (data.success) {
          const bgColors = ['bg-secondary-container', 'bg-tertiary-fixed', 'bg-primary-fixed', 'bg-surface-variant'];
          const textColors = ['text-on-secondary-container', 'text-on-tertiary-fixed', 'text-on-primary-fixed', 'text-on-surface-variant'];

          const formattedStudents = data.students.map((student, index) => {
            const initials = student.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            return {
              id: student._id,
              name: student.name,
              initials: initials,
              profile: 'Pending Assessment',
              grade: `Grade ${student.grade}`, // We format it as "Grade X" here
              bg: bgColors[index % bgColors.length],
              text: textColors[index % textColors.length]
            };
          });

          setStudents(formattedStudents);
        } else {
          setFetchError(data.message || 'Failed to fetch students.');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setFetchError('Could not connect to the database.');
      } finally {
        setIsLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [currentUser]);

  /* ── FILTER LOGIC: This creates a new list based on the dropdown ── */
  const filteredStudents = students.filter(student => student.grade === `Grade ${selectedGrade}`);

  /* ── Handlers ── */
  const simulateUpload = () => {
    setUploadStatus('uploading');
    setTimeout(() => setUploadStatus('success'), 2000);
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop = (e) => { e.preventDefault(); setIsDragOver(false); simulateUpload(); };
  const handleFileChange = (e) => { if (e.target.files.length > 0) simulateUpload(); };

  const openHitlPanel = (student) => {
    setActiveStudent(student);
    setSliderValues(sliderGroups.flatMap((g) => g.sliders.map((s) => s.defaultValue)));
    document.body.classList.add('overflow-hidden');
  };

  const closeHitlPanel = () => {
    setActiveStudent(null);
    document.body.classList.remove('overflow-hidden');
  };

  const updateSlider = (index, value) => {
    setSliderValues((prev) => {
      const next = [...prev];
      next[index] = Number(value);
      return next;
    });
  };

  /* ── Render ── */
  return (
    <main className="flex-grow max-w-[1280px] mx-auto w-full px-6 py-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-h1 text-h1 text-on-surface">
          {currentUser?.institute || 'Educator Portal'}
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          Educator Portal &amp; Knowledge Management
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-start">
        {/* ── Left Column (60%) ── */}
        <section className="lg:col-span-6 space-y-6">
          <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 transition-all hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.05)]">
            <h2 className="font-h3 text-h3 text-on-surface mb-4">Content Ingestion Zone</h2>

            {/* Dropdown controls selectedGrade state */}
            <div className="mb-6">
              <label className="block font-label-md text-label-md text-on-surface-variant mb-1">
                Select Target Grade
              </label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="w-full max-w-xs bg-surface-container-low border border-outline-variant rounded-[5px] p-4 font-label-md text-on-surface focus:ring-2 focus:ring-primary-container focus:border-primary-container transition-all cursor-pointer hover:bg-surface-container-high"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1} className="rounded-[8px]">
                    Grade {i + 1}
                  </option>
                ))}
              </select>
            </div>

            {/* Upload States */}
            {uploadStatus === 'idle' && (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-16 text-center flex flex-col items-center justify-center cursor-pointer transition-all group ${isDragOver ? 'border-primary-container bg-surface-container' : 'border-outline-variant bg-surface-container-low hover:border-primary-container hover:bg-surface-container'}`}
              >
                <div className="w-16 h-16 bg-primary-fixed rounded-full flex items-center justify-center text-primary-container mb-4 group-hover:scale-110 transition-transform">
                  <CloudUpload className="w-8 h-8" strokeWidth={1.5} />
                </div>
                <p className="font-body-lg text-body-lg text-on-surface-variant mb-1">Drag and drop course material</p>
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
                <button onClick={() => fileInputRef.current?.click()} className="mt-6 px-10 py-3 bg-primary-container text-on-primary font-bold rounded-full shadow-lg hover:bg-primary transition-all">Select Files</button>
              </div>
            )}
            {uploadStatus === 'uploading' && (
              <div className="border-2 border-dashed border-outline-variant bg-surface-container-low rounded-2xl p-16 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary-container border-t-transparent rounded-full animate-spin" />
                <p className="mt-4 font-label-md text-primary">Mapping knowledge nodes...</p>
              </div>
            )}
            {uploadStatus === 'success' && (
              <div className="mt-4 p-4 bg-tertiary-fixed rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <CheckCircle className="w-6 h-6 text-tertiary" strokeWidth={2} />
                  <span className="font-label-md text-label-md text-on-tertiary-fixed">Material processed successfully.</span>
                </div>
                <button onClick={() => setShowGraph(true)} className="bg-surface-container-lowest text-tertiary px-6 py-2 rounded-lg font-bold text-label-md hover:bg-white transition-all shadow-sm">View Knowledge Graph</button>
              </div>
            )}
          </div>

          {/* Knowledge Graph */}
          {showGraph && (
            <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 transition-all duration-500 animate-fade-in-up hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.05)]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-h3 text-h3 text-on-surface">Knowledge Graph</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-label-md text-label-md">
                  <thead className="text-on-surface-variant border-b border-outline-variant">
                    <tr><th className="py-4 px-4">ID</th><th className="py-4 px-4">Difficulty</th><th className="py-4 px-4">Load</th><th className="py-4 px-4">Blocks</th></tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {knowledgeGraphRows.map((row) => (
                      <tr key={row.id} className="hover:bg-surface-container-low transition-colors">
                        <td className="py-4 px-4 font-mono text-primary">{row.id}</td>
                        <td className="py-4 px-4"><span className={`px-2 py-0.5 ${row.diffColor} rounded-full text-[10px] uppercase font-bold`}>{row.difficulty}</span></td>
                        <td className="py-4 px-4">{row.load}</td>
                        <td className="py-4 px-4">{row.blocks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Past Study Material */}
          <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 flex items-center justify-between bg-surface-container-low border-dashed border-2 border-outline-variant hover:border-primary-container transition-all cursor-pointer group hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary-container rounded-full flex items-center justify-center text-on-secondary-container"><BookOpen className="w-6 h-6" strokeWidth={1.5} /></div>
              <div><h3 className="font-label-md text-label-md text-on-surface">Past Study Material</h3></div>
            </div>
            <button onClick={() => onNavigate?.('past-materials')} className="px-10 py-3 border-2 border-primary-container text-primary font-bold rounded-xl hover:bg-primary-container hover:text-white transition-all flex items-center gap-2">
              Assess Past Study Material <ArrowRight className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>
        </section>

        {/* ── Right Column (40%) ── */}
        <section className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 h-full flex">
          <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 h-full flex flex-col flex-grow transition-all hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-h3 text-h3 text-on-surface">Student Rosters</h2>
              <span className="text-label-sm font-label-sm px-4 py-1 bg-surface-container rounded-full text-on-surface-variant">
                {/* Shows count of FILTERED students */}
                {filteredStudents.length} Enrolled
              </span>
            </div>

            <div className="flex-grow overflow-y-auto pr-2 space-y-2 custom-scrollbar">
              {isLoadingStudents ? (
                <div className="flex flex-col items-center justify-center py-10 text-primary">
                  <Loader2 className="w-8 h-8 animate-spin mb-2" />
                  <p className="text-sm">Loading students...</p>
                </div>
              ) : fetchError ? (
                <div className="flex items-start gap-2 p-4 bg-error/10 text-error rounded-xl">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-medium">{fetchError}</p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-10 bg-surface-container-lowest border-2 border-dashed border-outline-variant rounded-xl">
                  <p className="text-on-surface-variant font-medium text-sm">
                    No students registered in Grade {selectedGrade} yet.
                  </p>
                </div>
              ) : (
                /* Loops over FILTERED students, not all students */
                filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => openHitlPanel(student)}
                    className="p-4 bg-surface-container-lowest border border-outline-variant rounded-xl flex items-center justify-between cursor-pointer hover:border-primary-container hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full ${student.bg} flex items-center justify-center ${student.text} font-bold`}>
                        {student.initials}
                      </div>
                      <div>
                        <p className="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors">
                          {student.name} <span className="text-xs font-normal text-on-surface-variant ml-1">({student.grade})</span>
                        </p>
                        <p className="font-label-sm text-label-sm text-on-surface-variant">
                          Profile: {student.profile}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-outline group-hover:text-primary-container transition-all" strokeWidth={2} />
                  </div>
                ))
              )}
            </div>

            <button className="mt-6 w-full py-3 border-2 border-primary-container text-primary font-bold rounded-xl hover:bg-primary-container hover:text-white transition-all flex items-center justify-center gap-2">
              <UserPlus className="w-5 h-5" strokeWidth={2} />
              Bulk Add Students
            </button>
          </div>
        </section>
      </div>

      {/* ── HITL Overlay & Drawer logic stays here... ── */}
      {activeStudent && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 transition-opacity duration-300" onClick={closeHitlPanel} />
      )}
      <div className={`fixed inset-y-0 right-0 w-full md:w-[450px] bg-white shadow-2xl z-[60] transform transition-transform duration-300 ease-in-out flex flex-col border-l border-outline-variant ${activeStudent ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low shrink-0">
          <div>
            <h3 className="font-h3 text-h3 text-on-surface">{activeStudent ? activeStudent.name : 'Student Profile'}</h3>
            <p className="font-label-sm text-label-sm text-on-surface-variant">{activeStudent ? `${activeStudent.grade} • Cognitive Mapping` : 'Validation & Support Layer'}</p>
          </div>
          <button onClick={closeHitlPanel} className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-outline hover:text-primary hover:shadow transition-all">
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>
        <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {(() => {
            let globalIndex = 0;
            return sliderGroups.map((group) => (
              <div key={group.title} className="space-y-4">
                <h4 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">{group.title}</h4>
                {group.sliders.map((slider) => {
                  const idx = globalIndex++;
                  return (
                    <div key={slider.label} className="space-y-1">
                      <div className="flex justify-between font-label-md text-label-md"><span>{slider.label}</span><span className="text-primary font-bold">{sliderValues[idx]}%</span></div>
                      <input type="range" min={0} max={100} value={sliderValues[idx]} onChange={(e) => updateSlider(idx, e.target.value)} className="w-full h-2 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary-container" />
                    </div>
                  );
                })}
              </div>
            ));
          })()}
        </div>
        <div className="p-6 border-t border-outline-variant bg-white flex gap-4 shrink-0">
          <button onClick={closeHitlPanel} className="flex-1 py-3 border-2 border-outline text-on-surface-variant font-bold rounded-xl hover:bg-surface-variant transition-all">Discard</button>
          <button onClick={closeHitlPanel} className="flex-1 py-3 bg-primary-container text-on-primary font-bold rounded-xl shadow-lg hover:bg-primary transition-all">Save Profile</button>
        </div>
      </div>
    </main>
  );
}

export default EducatorDashboard;
