import React, { useEffect, useState } from 'react';
import { fetchApi } from '../../services/api';
import { CardSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { Clock, Calendar, MapPin, User, BookOpen } from 'lucide-react';

export default function StudentTimetable() {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const res = await fetchApi('/student/dashboard');
        if (res.success) setTimetable(res.data.timetable || []);
      } catch (err) {
        console.error('Failed to load timetable:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTimetable();
  }, []);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  if (loading) return <div className="p-6"><CardSkeleton /></div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Class Timetable</h1>
        <p className="text-xs text-slate-500">Weekly schedule of subject lectures and assigned faculty.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {days.map((day) => {
          const daySlots = timetable.filter((t) => t.dayOfWeek === day);

          return (
            <div key={day} className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 font-bold text-slate-800 text-sm">
                <Calendar className="w-4 h-4 text-primary-600" />
                <span>{day}</span>
              </div>

              {daySlots.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No scheduled classes</p>
              ) : (
                daySlots.map((slot) => (
                  <div key={slot.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-primary-700">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {slot.startTime} - {slot.endTime}
                      </span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <MapPin className="w-3 h-3" />
                        {slot.roomNumber || 'LH-301'}
                      </span>
                    </div>

                    <h5 className="font-bold text-slate-900 text-xs">{slot.subject.name}</h5>
                    <p className="text-[10px] text-slate-500 font-medium">Faculty: {slot.faculty.name}</p>
                  </div>
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
