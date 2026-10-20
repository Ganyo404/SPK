import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Baby,
  Stethoscope,
  ClipboardList,
  CheckCircle2,
  Users,
  Calculator,
  MessageSquare,
  Shield,
  Building2,
  Sliders,
  History,
  User,
  Info
} from 'lucide-react';

export function Sidebar({ isOpen, onClose }) {
  const { role } = useAuth();

  const getNavLinks = () => {
    if (role === 'admin') {
      return [
        { label: 'Dashboard Admin', to: '/admin', icon: LayoutDashboard },
        { label: 'Manajemen Pengguna', to: '/admin/users', icon: Users },
        { label: 'Manajemen Posyandu', to: '/admin/posyandu', icon: Building2 },
        { label: 'Konfigurasi AHP', to: '/admin/ahp-config', icon: Sliders },
        { label: 'Log Audit & Aktivitas', to: '/admin/audit-logs', icon: History },
      ];
    }

    if (role === 'staff') {
      return [
        { label: 'Dashboard Petugas', to: '/staff', icon: LayoutDashboard },
        { label: 'Data & Riwayat Balita', to: '/staff/children', icon: Baby },
        { label: 'Verifikasi Pendaftaran', to: '/staff/registration-queue', icon: ClipboardList },
        { label: 'Catat Pemeriksaan', to: '/staff/examination/new', icon: Stethoscope },
        { label: 'Draf & Verifikasi', to: '/staff/examinations/pending', icon: CheckCircle2 },
        { label: 'Kelompok Kelahiran', to: '/staff/cohorts', icon: Users },
        { label: 'Perhitungan & Ranking SPK', to: '/staff/spk-calculation', icon: Calculator },
        { label: 'Konsultasi Balita', to: '/staff/consultations', icon: MessageSquare },
      ];
    }

    // Default: Orang Tua
    return [
      { label: 'Dashboard Saya', to: '/parent', icon: LayoutDashboard },
      { label: 'Daftar Anak Saya', to: '/parent/children', icon: Baby },
      { label: 'Konsultasi Nakes', to: '/parent/consultations', icon: MessageSquare },
      { label: 'Profil Akun', to: '/parent/profile', icon: User },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-0 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-slate-100 flex items-center justify-between lg:hidden">
          <span className="font-bold text-slate-800">Menu Navigasi</span>
          <button onClick={onClose} className="p-1 rounded-md text-slate-500 hover:bg-slate-100">
            ✕
          </button>
        </div>

        {/* Role Header Banner */}
        <div className="px-4 py-3 mx-3 mt-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs">
          <p className="text-slate-500 font-medium">Navigasi Akses</p>
          <p className="font-bold text-teal-800 uppercase tracking-wider text-[11px] mt-0.5">
            {role === 'admin' ? 'Administrator' : role === 'staff' ? 'Petugas Posyandu' : 'Orang Tua Balita'}
          </p>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/parent' || item.to === '/staff' || item.to === '/admin'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-xs shadow-teal-600/30 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Medical Disclaimer in Sidebar */}
        <div className="p-3 m-3 rounded-xl bg-teal-50/70 border border-teal-100 text-[11px] text-teal-900 leading-relaxed">
          <div className="flex items-center gap-1.5 font-bold text-teal-800 mb-1">
            <Info className="w-3.5 h-3.5" />
            <span>Pemberitahuan Medis</span>
          </div>
          Sistem SPK adalah instrumen skrining dan pendukung keputusan, bukan pengganti diagnosis medis resmi.
        </div>
      </aside>
    </>
  );
}
