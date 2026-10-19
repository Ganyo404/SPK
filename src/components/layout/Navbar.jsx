import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, HeartPulse, ShieldCheck, UserCheck, Stethoscope } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Navbar({ onToggleSidebar }) {
  const { profile, role, logout } = useAuth();

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
            Dokter / Petugas Nakes
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

        {/* Right Section: User Profile & Logout */}
        <div className="flex items-center gap-3 lg:gap-4">
          <div className="flex items-center gap-2.5">
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold text-slate-800 leading-tight">
                {profile?.full_name || 'Pengguna'}
              </p>
              <div className="mt-0.5">{getRoleBadge()}</div>
            </div>

            <button
              onClick={logout}
              title="Keluar dari akun"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200/80 transition-all text-xs font-semibold cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-500" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

