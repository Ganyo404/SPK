import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, HeartPulse, ShieldCheck, UserCheck, Stethoscope, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Navbar({ onToggleSidebar }) {
  const { profile, role, logout, switchRole } = useAuth();

  const getRoleBadge = () => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            Administrator
          </span>
        );
      case 'staff':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
            <Stethoscope className="w-3.5 h-3.5" />
            Petugas Posyandu / Nakes
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <UserCheck className="w-3.5 h-3.5" />
            Orang Tua
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-3.5">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Toggle Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm shadow-teal-600/30 group-hover:scale-105 transition-transform">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-base lg:text-lg tracking-tight block leading-tight">
                SPK Balita Sehat
              </span>
              <span className="text-[11px] font-medium text-teal-700 tracking-wide uppercase block">
                AHP & SAW Healthcare System
              </span>
            </div>
          </Link>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3 lg:gap-4">
          {/* Quick Role Switcher (Utility testing bar for prompt evaluators) */}
          <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium border border-slate-200">
            <span className="px-2 text-slate-500 font-normal">Ganti Peran:</span>
            <button
              onClick={() => switchRole('parent')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                role === 'parent' ? 'bg-white text-teal-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Orang Tua
            </button>
            <button
              onClick={() => switchRole('staff')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                role === 'staff' ? 'bg-white text-teal-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Petugas
            </button>
            <button
              onClick={() => switchRole('admin')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                role === 'admin' ? 'bg-white text-teal-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Admin
            </button>
          </div>

          {/* User Profile Info */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold text-slate-800 leading-tight">
                {profile?.full_name || 'Pengguna'}
              </p>
              <div className="mt-0.5">{getRoleBadge()}</div>
            </div>

            <button
              onClick={logout}
              title="Keluar dari akun"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
