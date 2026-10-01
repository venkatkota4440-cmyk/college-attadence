import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Phone, GraduationCap, Building2, BookOpen, Hash } from 'lucide-react';

export default function StudentProfile() {
  const { user } = useAuth();
  const profile = user?.studentProfile;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Student Profile</h1>
        <p className="text-xs text-slate-500">Academic & personal details registered with college administration.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-5 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
            {user?.name?.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <span className="inline-block px-2.5 py-0.5 mt-2 rounded-full bg-primary-50 text-primary-700 text-xs font-bold border border-primary-200">
              Student ID: {profile?.studentId || 'STU-2026'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-center gap-3">
            <Hash className="w-5 h-5 text-primary-600" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Roll Number</p>
              <p className="font-bold text-slate-900 text-sm">{profile?.rollNumber}</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-center gap-3">
            <Building2 className="w-5 h-5 text-primary-600" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Department</p>
              <p className="font-bold text-slate-900 text-sm">{profile?.department?.name}</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-center gap-3">
            <GraduationCap className="w-5 h-5 text-primary-600" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Course & Branch</p>
              <p className="font-bold text-slate-900 text-sm">{profile?.course?.name}</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-primary-600" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Section & Semester</p>
              <p className="font-bold text-slate-900 text-sm">
                Section {profile?.section?.name} &bull; Year {profile?.year}, Sem {profile?.semester}
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-center gap-3">
            <Mail className="w-5 h-5 text-primary-600" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Email Address</p>
              <p className="font-bold text-slate-900 text-sm">{user?.email}</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-center gap-3">
            <Phone className="w-5 h-5 text-primary-600" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Phone Number</p>
              <p className="font-bold text-slate-900 text-sm">{user?.phone || 'Not provided'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
