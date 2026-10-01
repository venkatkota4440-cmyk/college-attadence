import React, { useState } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { Settings, Shield, Sliders } from 'lucide-react';

export default function SettingsPage() {
  const [minAttendance, setMinAttendance] = useState(75);
  const [warningThreshold, setWarningThreshold] = useState(65);
  const { showSuccess } = useNotification();

  const handleSave = (e) => {
    e.preventDefault();
    showSuccess('System attendance threshold configuration updated.');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
        <p className="text-xs text-slate-500">Configure global attendance rules and shortage threshold percentages.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-6">
        <h3 className="font-bold text-slate-900 text-base">Attendance Rules & Thresholds</h3>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Minimum Required Attendance Percentage (%)
            </label>
            <input
              type="number"
              value={minAttendance}
              onChange={(e) => setMinAttendance(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            />
            <p className="text-[10px] text-slate-400 mt-1">Students below this threshold are flagged with Attendance Shortage warning.</p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Warning Attendance Threshold (%)
            </label>
            <input
              type="number"
              value={warningThreshold}
              onChange={(e) => setWarningThreshold(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            />
            <p className="text-[10px] text-slate-400 mt-1">Yellow alert threshold level.</p>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <button
              type="submit"
              className="px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl shadow-md cursor-pointer"
            >
              Save System Rules
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
