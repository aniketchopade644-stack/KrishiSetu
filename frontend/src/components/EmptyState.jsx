import React from 'react';
import { PackageOpen } from 'lucide-react';

const EmptyState = ({ title, message, icon: Icon = PackageOpen, actionText, onAction }) => {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center bg-white/40 dark:bg-slate-900/40">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
        <Icon className="h-7 w-7" />
      </div>
      <h4 className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200 font-heading">{title}</h4>
      <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">{message}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
