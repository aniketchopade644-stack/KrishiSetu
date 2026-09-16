import React from 'react';
import { Sprout } from 'lucide-react';

const LoadingSpinner = ({ message = 'Loading farming intelligence...' }) => {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <div className="absolute h-full w-full animate-ping rounded-full bg-emerald-400/20 duration-1000"></div>
        <div className="flex h-12 w-12 animate-bounce items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-500/30">
          <Sprout className="h-6 w-6" />
        </div>
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {message}
      </p>
    </div>
  );
};

export default LoadingSpinner;
