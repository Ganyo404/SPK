import React from 'react';
import { FolderOpen } from 'lucide-react';

export function EmptyState({ 
  icon: Icon = FolderOpen, 
  title = 'Tidak Ada Data', 
  description = 'Belum ada data yang tersedia pada kategori ini.', 
  action 
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl bg-white border border-dashed border-slate-300">
      <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500 max-w-sm">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function LoadingState({ text = 'Memuat data...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-10 h-10 border-3 border-teal-500/20 border-t-teal-600 rounded-full animate-spin"></div>
      <p className="mt-4 text-sm font-medium text-slate-500">{text}</p>
    </div>
  );
}
