import React from 'react';

export function StatusBadge({ status, type = 'general' }) {
  const getBadgeStyle = () => {
    switch (status) {
      // Status Pendaftaran Balita
      case 'active':
      case 'registered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20';
      case 'pending_registration':
        return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20';
      case 'rejected':
      case 'inactive':
        return 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20';

      // Status Pemeriksaan
      case 'verified':
        return 'bg-teal-50 text-teal-700 border-teal-200 ring-teal-500/20';
      case 'pending_verification':
        return 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/20';
      case 'draft':
        return 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-500/20';

      // Status Skrining Kesehatan
      case 'Sangat Baik':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 ring-emerald-500/30';
      case 'Baik':
        return 'bg-teal-100 text-teal-800 border-teal-300 ring-teal-500/30';
      case 'Cukup Baik':
        return 'bg-amber-100 text-amber-800 border-amber-300 ring-amber-500/30';
      case 'Perlu Penanganan':
        return 'bg-rose-100 text-rose-800 border-rose-300 ring-rose-500/30';

      default:
        return 'bg-slate-100 text-slate-600 border-slate-200 ring-slate-400/20';
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'pending_registration':
        return 'Menunggu Verifikasi Pendaftaran';
      case 'registered':
        return 'Terdaftar';
      case 'verified':
        return 'Terverifikasi';
      case 'pending_verification':
        return 'Menunggu Verifikasi Medis';
      case 'draft':
        return 'Draf';
      case 'open':
        return 'Terbuka';
      case 'in_progress':
        return 'Sedang Berlangsung';
      case 'closed':
        return 'Selesai';
      default:
        return status;
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border shadow-xs transition-colors ${getBadgeStyle()}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70"></span>
      {getLabel()}
    </span>
  );
}
