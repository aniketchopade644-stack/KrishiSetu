import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sprout, ShieldCheck, Heart } from 'lucide-react';

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-slate-200/80 bg-white/80 dark:border-slate-800 dark:bg-slate-900/40 py-6 px-4 sm:px-6 lg:px-8 mt-auto backdrop-blur-md">
      <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <Sprout className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="font-bold text-slate-700 dark:text-slate-200 font-heading">KrishiSetu</span>
          <span>• {t('common.footer_tagline')}</span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
            <ShieldCheck className="h-3.5 w-3.5" />
            {t('common.kisan_centre')}
          </span>
          <span>© {new Date().getFullYear()} KrishiSetu Platform. {t('common.all_rights')}</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
