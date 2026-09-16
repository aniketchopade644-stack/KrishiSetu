import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'emerald', trend, trendLabel }) => {
  const colorStyles = {
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-emerald-100 dark:border-emerald-900/50',
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-100 dark:border-amber-900/50',
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300',
    },
    blue: {
      bg: 'bg-white dark:bg-slate-900',
      border: 'border-slate-200 dark:border-slate-800',
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-950/40',
      border: 'border-purple-100 dark:border-purple-900/50',
      iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300',
    },
  };

  const currentTheme = colorStyles[color] || colorStyles.emerald;

  return (
    <div className={`rounded-2xl border p-5 transition-all duration-200 hover:shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-md ${currentTheme.border}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
        {Icon && (
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${currentTheme.iconBg}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      <div className="mt-3">
        <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading">{value}</h3>
        {subtitle && (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{subtitle}</p>
        )}
      </div>

      {(trend || trendLabel) && (
        <div className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
          {trend && (
            <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold ${currentTheme.badge}`}>
              {trend}
            </span>
          )}
          {trendLabel && <span className="text-[11px] text-slate-500 dark:text-slate-400">{trendLabel}</span>}
        </div>
      )}
    </div>
  );
};

export default StatCard;
