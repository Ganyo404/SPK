import React from 'react';

export function LoadingState({ text = 'Memuat data...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-10 h-10 border-3 border-teal-500/20 border-t-teal-600 rounded-full animate-spin"></div>
      <p className="mt-4 text-sm font-medium text-slate-500">{text}</p>
    </div>
  );
}
