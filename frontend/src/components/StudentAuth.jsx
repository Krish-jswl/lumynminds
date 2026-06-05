import React, { useState } from 'react';
import { User, Mail, BookOpen, GraduationCap, Lock, X, AlertCircle, Loader2 } from 'lucide-react';

function StudentAuth({ onClose, onSuccess }) {
  const [activeTab, setActiveTab] = useState('signup');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    grade: '',
    institute: '',
    password: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Ensure grade is numeric and limits length to 2 characters (1-12)
    if (name === 'grade') {
      if (/^\d{0,2}$/.test(value)) {
        setFormData((prev) => ({ ...prev, grade: value }));
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const canSubmit =
    activeTab === 'signup'
      ? formData.name && formData.email && formData.grade && formData.institute && formData.password
      : formData.email && formData.password;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsLoading(true);
    setError('');

    // Ensure this matches your backend port and API structure!
    const baseUrl = 'http://localhost:5000';
    const endpoint =
      activeTab === 'signup'
        ? '/api/auth/student/register'
        : '/api/auth/student/login';

    const payload =
      activeTab === 'signup'
        ? { name: formData.name, email: formData.email, grade: formData.grade, institute: formData.institute, password: formData.password }
        : { email: formData.email, password: formData.password };

    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        if (onSuccess) onSuccess(data);
      } else {
        setError(data.message || 'Authentication failed.');
      }
    } catch (err) {
      console.error(err);
      setError('Cannot connect to server. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  };

  /* ── shared input classes ── */
  const inputBase =
    'w-full pl-12 pr-4 py-3.5 bg-white border rounded-lg text-body-md text-on-surface placeholder:text-[#e3c9bf] focus:outline-none transition-all duration-200';
  const inputNormal =
    'border-outline-variant focus:border-primary-container focus:ring-2 focus:ring-primary-container/20';

  /* ── shared icon classes ── */
  const iconClass = 'absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant';

  const ErrorBanner = () => error ? (
    <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg flex items-center gap-2 text-error text-[13px] font-medium">
      <AlertCircle className="w-4 h-4 shrink-0" />
      <p>{error}</p>
    </div>
  ) : null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-on-surface/10 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none">
        <div className="bg-surface-container-lowest w-full max-w-[550px] max-h-[90vh] rounded-[24px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.06)] border border-outline-variant/40 pointer-events-auto overflow-hidden flex flex-col">

          {/* Tabs */}
          <div className="flex bg-surface-container-low border-b border-outline-variant/50 shrink-0">
            <button
              onClick={() => handleTabSwitch('signup')}
              className={`flex-1 py-5 text-center text-[14px] font-semibold tracking-wide border-b-2 transition-all duration-300 ${
                activeTab === 'signup' ? 'border-primary-container text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => handleTabSwitch('login')}
              className={`flex-1 py-5 text-center text-[14px] font-semibold tracking-wide border-b-2 transition-all duration-300 ${
                activeTab === 'login' ? 'border-primary-container text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Login
            </button>
          </div>

          <div className="py-6 px-8 sm:px-10 overflow-y-auto">
            {/* SIGN UP VIEW */}
            {activeTab === 'signup' && (
              <div className="animate-fade-in">
                <h2 className="text-[26px] font-bold text-on-surface tracking-[-0.02em] leading-tight">
                  Join as a Learner
                </h2>
                <p className="mt-2 mb-6 text-on-surface-variant text-[15px] leading-relaxed">
                  Create your account to start your personalized journey.
                </p>

                <ErrorBanner />

                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div>
                    <label className="block text-[12px] font-semibold text-on-surface-variant tracking-wider mb-1.5 pl-0.5">Name</label>
                    <div className="relative">
                      <User className={iconClass} strokeWidth={1.5} />
                      <input name="name" type="text" value={formData.name} onChange={handleInputChange} placeholder="Alex Chen" className={`${inputBase} ${inputNormal}`} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-on-surface-variant tracking-wider mb-1.5 pl-0.5">Email</label>
                    <div className="relative">
                      <Mail className={iconClass} strokeWidth={1.5} />
                      <input name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="alex@student.edu" className={`${inputBase} ${inputNormal}`} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1">
                      <label className="block text-[12px] font-semibold text-on-surface-variant tracking-wider mb-1.5 pl-0.5">Grade (1-12)</label>
                      <div className="relative">
                        <BookOpen className={iconClass} strokeWidth={1.5} />
                        <input name="grade" type="text" inputMode="numeric" value={formData.grade} onChange={handleInputChange} placeholder="9" className={`${inputBase} ${inputNormal}`} />
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[12px] font-semibold text-on-surface-variant tracking-wider mb-1.5 pl-0.5">Institute / School</label>
                      <div className="relative">
                        <GraduationCap className={iconClass} strokeWidth={1.5} />
                        <input name="institute" type="text" value={formData.institute} onChange={handleInputChange} placeholder="Central High" className={`${inputBase} ${inputNormal}`} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-on-surface-variant tracking-wider mb-1.5 pl-0.5">Password</label>
                    <div className="relative">
                      <Lock className={iconClass} strokeWidth={1.5} />
                      <input name="password" type="password" value={formData.password} onChange={handleInputChange} placeholder="••••••••" className={`${inputBase} ${inputNormal}`} />
                    </div>
                  </div>

                  <button type="submit" disabled={!canSubmit || isLoading} className={`w-full py-3.5 rounded-lg text-[15px] font-semibold mt-2 transition-all duration-300 flex items-center justify-center gap-2 ${canSubmit && !isLoading ? 'bg-primary-container text-white hover:bg-primary shadow-sm hover:shadow-md' : 'bg-surface-container-high text-on-surface-variant/50 cursor-not-allowed'}`}>
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
                  </button>
                </form>
              </div>
            )}

            {/* LOGIN VIEW */}
            {activeTab === 'login' && (
              <div className="animate-fade-in">
                <h2 className="text-[26px] font-bold text-on-surface tracking-[-0.02em] leading-tight">
                  Welcome Back
                </h2>
                <p className="mt-2 mb-6 text-on-surface-variant text-[15px] leading-relaxed">
                  Enter your email to resume your learning path.
                </p>

                <ErrorBanner />

                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div>
                    <label className="block text-[12px] font-semibold text-on-surface-variant tracking-wider mb-1.5 pl-0.5">Email</label>
                    <div className="relative">
                      <Mail className={iconClass} strokeWidth={1.5} />
                      <input name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="alex@student.edu" className={`${inputBase} ${inputNormal}`} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5 pl-0.5">
                      <label className="text-[12px] font-semibold text-on-surface-variant tracking-wider">Password</label>
                    </div>
                    <div className="relative">
                      <Lock className={iconClass} strokeWidth={1.5} />
                      <input name="password" type="password" value={formData.password} onChange={handleInputChange} placeholder="••••••••" className={`${inputBase} ${inputNormal}`} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 pl-0.5">
                    <input id="remember" type="checkbox" className="w-4 h-4 rounded border-outline-variant text-primary-container focus:ring-primary-container/40" />
                    <label htmlFor="remember" className="text-[13px] text-on-surface-variant cursor-pointer select-none">Remember me on this device</label>
                  </div>

                  <button type="submit" disabled={!canSubmit || isLoading} className={`w-full py-3.5 rounded-lg text-[15px] font-semibold mt-2 transition-all duration-300 flex items-center justify-center gap-2 ${canSubmit && !isLoading ? 'bg-primary-container text-white hover:bg-primary shadow-sm hover:shadow-md' : 'bg-surface-container-high text-on-surface-variant/50 cursor-not-allowed'}`}>
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Login'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {onClose && (
          <button onClick={onClose} className="fixed top-6 right-6 z-[60] bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full p-2 text-on-surface-variant hover:text-on-surface transition-all pointer-events-auto">
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        )}
      </div>
    </>
  );
}

export default StudentAuth;
