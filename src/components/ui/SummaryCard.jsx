import React from 'react';

export function SummaryCard({ title, value, subtitle, icon: Icon, color = 'teal', trend }) {
  const colorMap = {
    teal: 'bg-teal-50 text-teal-600 border-teal-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2 tracking-tight">{value}</p>
        </div>
        {Icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${colorMap[color] || colorMap.teal}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      {(subtitle || trend) && (
        <div className="mt-4 flex items-center text-xs text-slate-500">
          {trend && (
            <span className={`font-semibold mr-1.5 ${trend.type === 'up' ? 'text-emerald-600' : 'text-slate-600'}`}>
              {trend.value}
            </span>
          )}
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  );
}
