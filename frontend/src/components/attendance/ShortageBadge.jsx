import React from 'react';
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

export default function ShortageBadge({ percentage, requiredPercentage = 75 }) {
  if (percentage >= requiredPercentage) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
        Satisfactory ({percentage}%)
      </span>
    );
  }

  if (percentage >= 65) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
        Warning ({percentage}%)
      </span>
    );
  }

  const shortageMargin = requiredPercentage - percentage;

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
      <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
      Attendance Shortage ({percentage}% - Short by {shortageMargin}%)
    </span>
  );
}
