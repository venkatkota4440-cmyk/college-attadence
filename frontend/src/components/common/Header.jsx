import React from 'react';
import { Menu, LogOut, User as UserIcon, Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="hidden sm:block">
          <h2 className="text-base font-semibold text-slate-800">
            Narasaraopet Engineering College
          </h2>
          <p className="text-xs text-slate-500">Autonomous Institution &bull; NAAC A+ Grade</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Notifications Button */}
        <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl relative transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
        </button>

        {/* User Profile Pill */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="hidden md:block text-right">
            <p className="text-xs font-semibold text-slate-800">{user?.name}</p>
            <p className="text-[11px] text-slate-500">{user?.role}</p>
          </div>

          <div className="w-9 h-9 rounded-xl bg-primary-100 border border-primary-200 text-primary-700 flex items-center justify-center font-bold text-sm shadow-sm">
            {user?.name?.charAt(0) || 'U'}
          </div>

          <button
            onClick={handleLogout}
            title="Logout"
            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors ml-1"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
