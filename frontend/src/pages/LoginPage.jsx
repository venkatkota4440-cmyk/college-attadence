import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { GraduationCap, ShieldCheck, UserCheck, Lock, Mail, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const { showError, showSuccess } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showError('Please fill in both email and password.');
      return;
    }

    setSubmitting(true);
    try {
      const loggedUser = await login(email, password);
      showSuccess(`Welcome back, ${loggedUser.name}!`);

      if (loggedUser.role === 'ADMIN') navigate('/admin/dashboard');
      else if (loggedUser.role === 'FACULTY') navigate('/faculty/dashboard');
      else navigate('/student/dashboard');
    } catch (err) {
      showError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoFill = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password123!');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Dynamic Academic Background Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white font-extrabold text-2xl shadow-xl shadow-primary-900/50">
            CA
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold text-white tracking-tight">
          Campus<span className="text-primary-400">Attend</span>
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400 uppercase tracking-widest font-semibold">
          Smart College Attendance Management System
        </p>
        <p className="mt-1 text-center text-xs text-slate-400">
          Narasaraopet Engineering College
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-slate-800/80 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl border border-slate-700/60 sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email / College ID
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@campusattend.local"
                  className="block w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-lg shadow-primary-600/30 transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                'Signing in...'
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Cards */}
          <div className="mt-8 pt-6 border-t border-slate-700/60">
            <p className="text-center text-xs font-semibold text-slate-400 mb-3">
              DEMO ACCOUNTS (Click to autofill)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill('admin@campusattend.local')}
                className="flex flex-col items-center p-2.5 bg-slate-900/60 hover:bg-slate-700/60 border border-slate-700 rounded-xl transition-colors text-center group cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-rose-400 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-white">Admin</span>
                <span className="text-[9px] text-slate-400">Principal</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill('faculty@campusattend.local')}
                className="flex flex-col items-center p-2.5 bg-slate-900/60 hover:bg-slate-700/60 border border-slate-700 rounded-xl transition-colors text-center group cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-emerald-400 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-white">Faculty</span>
                <span className="text-[9px] text-slate-400">Dr. Sharma</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill('student@campusattend.local')}
                className="flex flex-col items-center p-2.5 bg-slate-900/60 hover:bg-slate-700/60 border border-slate-700 rounded-xl transition-colors text-center group cursor-pointer"
              >
                <GraduationCap className="w-4 h-4 text-sky-400 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-white">Student</span>
                <span className="text-[9px] text-slate-400">Rahul (21A01)</span>
              </button>
            </div>
            <p className="text-center text-[10px] text-slate-500 mt-3">
              Default password for all demo accounts: <code className="text-slate-300">Password123!</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
