import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Sprout,
  FlaskConical,
  CloudSunRain,
  ShoppingBag,
  Receipt,
  Landmark,
  Sparkles,
  UserCog,
  X,
  PhoneCall,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isMobileOpen, onMobileClose }) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const mainNavItems = [
    { to: '/', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/farms', label: t('nav.farms'), icon: Sprout },
    { to: '/soil', label: t('nav.soil'), icon: FlaskConical },
    { to: '/weather', label: t('nav.weather'), icon: CloudSunRain },
    { to: '/marketplace', label: t('nav.marketplace'), icon: ShoppingBag },
    { to: '/expenses', label: t('nav.expenses'), icon: Receipt },
    { to: '/schemes', label: t('nav.schemes'), icon: Landmark },
    { to: '/ai-assistant', label: t('nav.ai_assistant'), icon: Sparkles, highlight: true },
  ];

  const bottomNavItems = [
    { to: '/profile', label: t('nav.profile'), icon: UserCog },
  ];

  const renderNavLink = (item) => {
    const Icon = item.icon;
    return (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.to === '/'}
        onClick={onMobileClose}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-150 ${
            isActive
              ? item.highlight
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 font-bold'
              : item.highlight
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-200'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <Icon
              className={`h-5 w-5 shrink-0 ${
                isActive
                  ? item.highlight
                    ? 'text-white'
                    : 'text-emerald-600 dark:text-emerald-400'
                  : item.highlight
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            />
            <span className="truncate">{item.label}</span>
            {item.highlight && (
              <span className="ml-auto rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                AI
              </span>
            )}
          </>
        )}
      </NavLink>
    );
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between p-4 overflow-y-auto">
      <div className="space-y-4">
        {/* Mobile Header with KrishiSetu Sprout Logo */}
        <div className="flex items-center justify-between lg:hidden border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 text-white shadow-md shadow-emerald-500/20">
              <Sprout className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-slate-800 dark:text-slate-100 font-heading text-lg">KrishiSetu</span>
          </div>
          <button
            onClick={onMobileClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Main Navigation Items */}
        <nav className="space-y-1">
          {mainNavItems.map(renderNavLink)}
        </nav>

        {/* Divider */}
        <div className="pt-2">
          <div className="border-t border-slate-200 dark:border-slate-800" />
        </div>

        {/* Bottom Nav Items (Profile & Settings) */}
        <nav className="space-y-1">
          {bottomNavItems.map(renderNavLink)}
        </nav>
      </div>

      {/* Kisan Help Card at bottom */}
      <div className="mt-4 rounded-2xl bg-gradient-to-br from-emerald-600 to-green-600 dark:from-emerald-800 dark:to-green-900 p-4 text-white shadow-lg relative overflow-hidden shrink-0">
        <div className="absolute -right-4 -bottom-4 h-20 w-20 rounded-full bg-white/10 blur-xl"></div>
        <div className="flex items-center gap-2 mb-2">
          <PhoneCall className="h-4 w-4 text-emerald-300 animate-pulse" />
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-200">{t('nav.kisan_helpline')}</p>
        </div>
        <p className="text-sm font-extrabold tracking-wide text-white">1800-180-1551</p>
        <p className="text-[11px] text-emerald-100/80 mt-1">{t('nav.helpline_desc')}</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/60 sticky top-16 h-[calc(100vh-4rem)]">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={onMobileClose}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl dark:bg-slate-900 z-50 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
