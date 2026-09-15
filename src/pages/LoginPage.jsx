import React, { useState } from 'react';
import {
  Shield,
  GraduationCap,
  Briefcase,
  Lock,
  Mail,
  ArrowRight,
  Info,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';

export default function LoginPage({ onNavigate }) {
  const { login, loginAsRole } = useAuth();
  const toast = useToast();
  const { isDark } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleManualLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      const res = login(email, password);
      setIsLoading(false);
      if (res.success) {
        toast.success(`Welcome back, ${res.user.name}!`);
        if (res.user.role === 'student') onNavigate('student-dashboard');
        else if (res.user.role === 'teacher') onNavigate('teacher-dashboard');
        else onNavigate('dashboard');
      } else {
        setErrorMsg(res.message);
        toast.error(res.message);
      }
    }, 400);
  };

  const handleQuickLogin = (roleName) => {
    setIsLoading(true);
    setTimeout(() => {
      const res = loginAsRole(roleName);
      setIsLoading(false);
      if (res.success) {
        toast.success(`Logged in as ${res.user.role.toUpperCase()}: ${res.user.name}`);
        if (roleName === 'student') onNavigate('student-dashboard');
        else if (roleName === 'teacher') onNavigate('teacher-dashboard');
        else onNavigate('dashboard');
      }
    }, 300);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-slate-100">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left column: Branding & Showcase */}
        <div className="lg:col-span-6 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Frontend-Only Smart Attendance System
          </div>

          <div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Attend<span className="text-indigo-400">X</span>
            </h1>
            <p className="text-lg text-slate-300 mt-2 font-medium">
              Next-generation college attendance management, analytics, and reporting engine.
            </p>
          </div>

          <div className="space-y-3.5 pt-2">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="text-sm text-slate-300">
                <strong className="text-white font-semibold">100% Browser Persistence</strong> — Stores all students, subjects, and attendance history in LocalStorage with zero backend setup.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="text-sm text-slate-300">
                <strong className="text-white font-semibold">Role-Based Experience</strong> — Tailored portals for Administrators, Faculty Teachers, and Students.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="text-sm text-slate-300">
                <strong className="text-white font-semibold">Analytics & Reports</strong> — Interactive charts, monthly calendar, CSV Blob export, and printable attendance slips.
              </p>
            </div>
          </div>

          {/* Local Storage Disclaimer */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-md flex items-start gap-3">
            <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-white font-semibold block mb-0.5">Demo / Local-Only Notice:</strong>
              This is a frontend demonstration app. All data is saved inside your browser's LocalStorage and will persist across page refreshes.
            </div>
          </div>
        </div>

        {/* Right column: Login Card & Quick Demo Access */}
        <div className="lg:col-span-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
            
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Sign In to AttendX</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Choose a 1-click demo role or sign in with your credentials.
              </p>
            </div>

            {/* Quick 1-Click Role Login Buttons */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Instant Demo Access (1-Click)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                
                {/* Admin Role */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin')}
                  disabled={isLoading}
                  className="flex flex-col items-center text-center p-3.5 rounded-2xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-800/50 text-purple-200 transition-all hover:scale-102 hover:shadow-lg hover:shadow-purple-950/50 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-600/30 text-purple-300 flex items-center justify-center mb-2 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <Shield className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-white">Admin Portal</span>
                  <span className="text-[10px] text-purple-300/80 font-mono mt-0.5">admin@attendx.com</span>
                </button>

                {/* Teacher Role */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('teacher')}
                  disabled={isLoading}
                  className="flex flex-col items-center text-center p-3.5 rounded-2xl bg-blue-950/40 hover:bg-blue-900/60 border border-blue-800/50 text-blue-200 transition-all hover:scale-102 hover:shadow-lg hover:shadow-blue-950/50 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-600/30 text-blue-300 flex items-center justify-center mb-2 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-white">Teacher Portal</span>
                  <span className="text-[10px] text-blue-300/80 font-mono mt-0.5">teacher@attendx.com</span>
                </button>

                {/* Student Role */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('student')}
                  disabled={isLoading}
                  className="flex flex-col items-center text-center p-3.5 rounded-2xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/50 text-emerald-200 transition-all hover:scale-102 hover:shadow-lg hover:shadow-emerald-950/50 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-600/30 text-emerald-300 flex items-center justify-center mb-2 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-white">Student Portal</span>
                  <span className="text-[10px] text-emerald-300/80 font-mono mt-0.5">student@attendx.com</span>
                </button>

              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-slate-900 px-3 text-xs text-slate-500 uppercase font-semibold">Or enter manually</span>
            </div>

            {/* Manual Login Form */}
            <form onSubmit={handleManualLogin} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    placeholder="e.g. admin@attendx.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-101"
              >
                <span>{isLoading ? 'Signing In...' : 'Sign In with Demo Credentials'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Credentials helper footnote */}
            <div className="pt-2 text-center text-xs text-slate-400">
              Demo passwords: <span className="font-mono text-indigo-400 font-bold">admin123</span> / <span className="font-mono text-indigo-400 font-bold">teacher123</span> / <span className="font-mono text-indigo-400 font-bold">student123</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
