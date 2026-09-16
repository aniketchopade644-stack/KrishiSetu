import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Sprout,
  Lock,
  Mail,
  ArrowRight,
  Globe,
  Sun,
  Moon,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const Login = () => {
  const { t } = useTranslation();
  const { login, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { currentLanguage, changeLanguage } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const languages = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'mr', label: 'Marathi', native: 'मराठी' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white dark:bg-slate-950 flex flex-col justify-between transition-colors">
      {/* Top Header: Brand Logo, Language Selector & Theme Toggle */}
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 text-white shadow-md shadow-emerald-500/20">
            <Sprout className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-700 via-green-600 to-teal-600 bg-clip-text text-transparent dark:from-emerald-400 dark:via-green-300 dark:to-teal-300 font-heading">
              KrishiSetu
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800 transition"
              title="Change Language"
            >
              <Globe className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="uppercase">{currentLanguage}</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {langDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-36 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setLangDropdownOpen(false)}
              >
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition ${
                      currentLanguage === lang.code
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{lang.native}</span>
                    <span className="text-[10px] uppercase text-slate-400">({lang.code})</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 transition"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-slate-600 hover:text-emerald-600" />
            )}
          </button>
        </div>
      </header>

      {/* Main Container: Centered Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
          
          {/* Brand Logo & Heading */}
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-500 text-white shadow-lg shadow-emerald-500/25">
              <Sprout className="h-8 w-8" />
            </div>

            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-heading">
                KrishiSetu
              </h2>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                Connecting Farmers to Better Farming
              </p>
            </div>
          </div>

          {/* Login / Register Toggle Tabs */}
          <div className="mt-5 grid grid-cols-2 rounded-2xl bg-slate-100 p-1 dark:bg-slate-800">
            <button
              type="button"
              className="rounded-xl bg-white py-2 text-xs font-bold text-slate-800 shadow-sm dark:bg-slate-900 dark:text-white"
            >
              {t('nav.login')}
            </button>
            <Link
              to="/register"
              className="rounded-xl py-2 text-center text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition"
            >
              {t('nav.register')}
            </Link>
          </div>

          {error && (
            <div className="mt-4 rounded-2xl bg-red-50 p-3 text-xs font-semibold text-red-600 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900">
              {error}
            </div>
          )}

          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="farmer@krishisetu.com"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:from-emerald-700 hover:to-green-700 transition duration-150 disabled:opacity-50"
            >
              {loading ? t('common.loading') : `${t('nav.login')} to Dashboard`}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-emerald-600 hover:underline dark:text-emerald-400">
              {t('nav.register')} here
            </Link>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} KrishiSetu Platform. All Rights Reserved.
      </footer>
    </div>
  );
};

export default Login;
