import React, { useState } from 'react';
import { User, Mail, IdCard, GraduationCap, Lock, X } from 'lucide-react';

function EducatorAuth({ onClose, onSuccess }) {
  const [activeTab, setActiveTab] = useState('signup');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    teacherId: '',
    institute: '',
    password: '',
  });
  const [touched, setTouched] = useState({});

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setTouched({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Strict numeric-only mask for teacherId — blocks letters entirely
    if (name === 'teacherId') {
      if (/^\d{0,6}$/.test(value)) {
        setFormData((prev) => ({ ...prev, teacherId: value }));
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

  // Validation
  const idValid = formData.teacherId.length === 6;
  const showIdError = touched.teacherId && formData.teacherId.length > 0 && !idValid;

  const canSubmit =
    activeTab === 'signup'
      ? formData.name && formData.email && idValid && formData.institute && formData.password
      : idValid && formData.password;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    const endpoint =
      activeTab === 'signup'
        ? '/api/auth/teacher/register'
        : '/api/auth/teacher/login';

    const payload =
      activeTab === 'signup'
        ? { name: formData.name, email: formData.email, teacherId: formData.teacherId, institute: formData.institute, password: formData.password }
        : { teacherId: formData.teacherId, password: formData.password };

    console.log(`POST ${endpoint}`, payload);
    if (onSuccess) onSuccess(payload);
  };

  /* ── shared input classes ── */
  const inputBase =
    'w-full pl-12 pr-4 py-3.5 bg-white border rounded-lg text-body-md text-on-surface placeholder:text-[#e3c9bf] focus:outline-none transition-all duration-200';
  const inputNormal =
    'border-outline-variant focus:border-primary-container focus:ring-2 focus:ring-primary-container/20';
  const inputError =
    'border-error focus:border-error focus:ring-2 focus:ring-error/20 text-error';

  /* ── shared icon classes ── */
  const iconClass = 'absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant';

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-on-surface/10 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Centered wrapper */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none">
        {/* ── Modal card ── */}
        <div className="bg-surface-container-lowest w-full max-w-[550px] max-h-[90vh] rounded-[24px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.06)] border border-outline-variant/40 pointer-events-auto overflow-hidden flex flex-col">
          {/* ── Tabs (fixed at top) ── */}
          <div className="flex bg-surface-container-low border-b border-outline-variant/50 shrink-0">
            <button
              onClick={() => handleTabSwitch('signup')}
              className={`flex-1 py-5 text-center text-[14px] font-semibold tracking-wide border-b-2 transition-all duration-300 ${
                activeTab === 'signup'
                  ? 'border-primary-container text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => handleTabSwitch('login')}
              className={`flex-1 py-5 text-center text-[14px] font-semibold tracking-wide border-b-2 transition-all duration-300 ${
                activeTab === 'login'
                  ? 'border-primary-container text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Login
            </button>
          </div>

          {/* ── Body (scrollable) ── */}
          <div className="py-6 px-8 sm:px-10 overflow-y-auto">
            {/* ─────── SIGN UP VIEW ─────── */}
            {activeTab === 'signup' && (
              <div className="animate-fade-in">
                <h2 className="text-[26px] font-bold text-on-surface tracking-[-0.02em] leading-tight">
                  Join as an Educator
                </h2>
                <p className="mt-2 mb-8 text-on-surface-variant text-[15px] leading-relaxed">
                  Create your account to start personalizing learning paths.
                </p>

                <form className="space-y-5" onSubmit={handleSubmit}>
                  {/* Name */}
                  <div>
                    <label className="block text-[12px] font-semibold text-on-surface-variant tracking-wider mb-1.5 pl-0.5">
                      Name
                    </label>
                    <div className="relative">
                      <User className={iconClass} strokeWidth={1.5} />
                      <input
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Dr. Sarah Jenkins"
                        className={`${inputBase} ${inputNormal}`}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-[12px] font-semibold text-on-surface-variant tracking-wider mb-1.5 pl-0.5">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className={iconClass} strokeWidth={1.5} />
                      <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="sarah.j@institute.edu"
                        className={`${inputBase} ${inputNormal}`}
                      />
                    </div>
                  </div>

                  {/* Teacher ID + Institute row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12px] font-semibold text-on-surface-variant tracking-wider mb-1.5 pl-0.5">
                        Teacher ID
                      </label>
                      <div className="relative">
                        <IdCard className={iconClass} strokeWidth={1.5} />
                        <input
                          name="teacherId"
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={formData.teacherId}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          placeholder="992347"
                          className={`${inputBase} ${showIdError ? inputError : inputNormal}`}
                        />
                      </div>
                      {showIdError && (
                        <p className="text-error text-[12px] font-medium mt-1 pl-0.5">
                          Must be exactly 6 digits.
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[12px] font-semibold text-on-surface-variant tracking-wider mb-1.5 pl-0.5">
                        Institute
                      </label>
                      <div className="relative">
                        <GraduationCap className={iconClass} strokeWidth={1.5} />
                        <input
                          name="institute"
                          type="text"
                          value={formData.institute}
                          onChange={handleInputChange}
                          placeholder="Central Academy"
                          className={`${inputBase} ${inputNormal}`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-[12px] font-semibold text-on-surface-variant tracking-wider mb-1.5 pl-0.5">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className={iconClass} strokeWidth={1.5} />
                      <input
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        className={`${inputBase} ${inputNormal}`}
                      />
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className={`w-full py-3.5 rounded-lg text-[15px] font-semibold mt-2 transition-all duration-300 ${
                      canSubmit
                        ? 'bg-primary-container text-white hover:bg-primary shadow-sm hover:shadow-md'
                        : 'bg-surface-container-high text-on-surface-variant/50 cursor-not-allowed'
                    }`}
                  >
                    Create Account
                  </button>
                </form>
              </div>
            )}

            {/* ─────── LOGIN VIEW ─────── */}
            {activeTab === 'login' && (
              <div className="animate-fade-in">
                <h2 className="text-[26px] font-bold text-on-surface tracking-[-0.02em] leading-tight">
                  Welcome Back
                </h2>
                <p className="mt-2 mb-8 text-on-surface-variant text-[15px] leading-relaxed">
                  Enter your credentials to access your dashboard.
                </p>

                <form className="space-y-5" onSubmit={handleSubmit}>
                  {/* Teacher ID */}
                  <div>
                    <label className="block text-[12px] font-semibold text-on-surface-variant tracking-wider mb-1.5 pl-0.5">
                      Teacher ID
                    </label>
                    <div className="relative">
                      <IdCard className={iconClass} strokeWidth={1.5} />
                      <input
                        name="teacherId"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={formData.teacherId}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="992347"
                        className={`${inputBase} ${showIdError ? inputError : inputNormal}`}
                      />
                    </div>
                    {showIdError && (
                      <p className="text-error text-[12px] font-medium mt-1 pl-0.5">
                        Must be exactly 6 digits.
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5 pl-0.5">
                      <label className="text-[12px] font-semibold text-on-surface-variant tracking-wider">
                        Password
                      </label>
                      <a
                        href="#forgot"
                        className="text-[12px] font-medium text-primary hover:underline"
                      >
                        Forgot Password?
                      </a>
                    </div>
                    <div className="relative">
                      <Lock className={iconClass} strokeWidth={1.5} />
                      <input
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        className={`${inputBase} ${inputNormal}`}
                      />
                    </div>
                  </div>

                  {/* Remember */}
                  <div className="flex items-center gap-2.5 pl-0.5">
                    <input
                      id="remember"
                      type="checkbox"
                      className="w-4 h-4 rounded border-outline-variant text-primary-container focus:ring-primary-container/40"
                    />
                    <label
                      htmlFor="remember"
                      className="text-[13px] text-on-surface-variant cursor-pointer select-none"
                    >
                      Remember me on this device
                    </label>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className={`w-full py-3.5 rounded-lg text-[15px] font-semibold mt-2 transition-all duration-300 ${
                      canSubmit
                        ? 'bg-primary-container text-white hover:bg-primary shadow-sm hover:shadow-md'
                        : 'bg-surface-container-high text-on-surface-variant/50 cursor-not-allowed'
                    }`}
                  >
                    Login
                  </button>
                </form>
              </div>
            )}

            {/* Footer */}
            <div className="mt-8 pt-6 text-center">
              <p className="text-[12px] text-on-surface-variant leading-relaxed">
                By continuing, you agree to LumynMinds{' '}
                <a href="#tos" className="text-primary font-medium hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#privacy" className="text-primary font-medium hover:underline">
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </div>
        </div>

        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="fixed top-6 right-6 z-[60] bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full p-2 text-on-surface-variant hover:text-on-surface transition-all pointer-events-auto"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        )}
      </div>
    </>
  );
}

export default EducatorAuth;
