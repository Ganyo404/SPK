import React from 'react';

export function SummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'teal',
  trend,
  onClick,
  isActive = false,
}) {
  const colorMap = {
    teal: 'bg-teal-50 text-teal-600 border-teal-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  };

  const activeMap = {
    teal: 'ring-2 ring-teal-500 border-teal-400 bg-teal-50/30 shadow-xs',
    blue: 'ring-2 ring-blue-500 border-blue-400 bg-blue-50/30 shadow-xs',
    amber: 'ring-2 ring-amber-500 border-amber-400 bg-amber-50/30 shadow-xs',
    rose: 'ring-2 ring-rose-500 border-rose-400 bg-rose-50/30 shadow-xs',
    emerald: 'ring-2 ring-emerald-500 border-emerald-400 bg-emerald-50/30 shadow-xs',
  };

  const isClickable = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
      className={`rounded-2xl p-6 border transition-all duration-200 select-none ${
        isActive
          ? `${activeMap[color] || activeMap.teal} bg-white`
          : 'bg-white border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-md'
      } ${isClickable ? 'cursor-pointer active:scale-[0.98]' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            {isActive && (
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
            )}
          </div>
          <p className="text-3xl font-bold text-slate-900 mt-2 tracking-tight">{value}</p>
        </div>
        {Icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${colorMap[color] || colorMap.teal}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      {(subtitle || trend) && (
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center truncate">
            {trend && (
              <span className={`font-semibold mr-1.5 ${trend.type === 'up' ? 'text-emerald-600' : 'text-slate-600'}`}>
                {trend.value}
              </span>
            )}
            <span className="truncate">{subtitle}</span>
          </div>
          {isClickable && (
            <span className={`text-[10px] font-semibold ml-2 px-1.5 py-0.5 rounded transition-colors ${
              isActive ? 'bg-slate-900 text-white' : 'text-slate-400 bg-slate-100'
            }`}>
              {isActive ? 'Aktif' : 'Pilih'}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
