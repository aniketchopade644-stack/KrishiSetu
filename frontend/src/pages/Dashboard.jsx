import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Sprout,
  FlaskConical,
  CloudSun,
  TrendingUp,
  Receipt,
  Sparkles,
  ShoppingBag,
  PlusCircle,
  ArrowUpRight,
  ArrowDownRight,
  Droplets,
  Wind,
  Layers,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import api from '../services/api';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { formatWeatherCondition } from '../utils/weatherUtils';

const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [farms, setFarms] = useState([]);
  const [soilRecords, setSoilRecords] = useState([]);
  const [crops, setCrops] = useState([]);
  const [financialSummary, setFinancialSummary] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [recentExpenses, setRecentExpenses] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [farmsRes, soilRes, cropsRes, expenseRes, expenseListRes] = await Promise.all([
          api.get('/farms').catch(() => ({ data: { data: [] } })),
          api.get('/soil').catch(() => ({ data: { data: [] } })),
          api.get('/crops').catch(() => ({ data: { data: [] } })),
          api.get('/expenses/summary').catch(() => ({ data: { data: null } })),
          api.get('/expenses?limit=5').catch(() => ({ data: { data: [] } })),
        ]);

        const fetchedFarms = farmsRes.data.data || [];
        setFarms(fetchedFarms);
        setSoilRecords(soilRes.data.data || []);
        setCrops(cropsRes.data.data || []);
        setFinancialSummary(expenseRes.data.data);
        setRecentExpenses(expenseListRes.data.data || []);

        // Fetch weather for first farm location or user's city
        const targetCity =
          fetchedFarms.length > 0
            ? fetchedFarms[0].location?.villageOrCity || 'Nashik'
            : user?.location?.city || 'Nashik';

        const weatherRes = await api.get(`/weather/${encodeURIComponent(targetCity)}`);
        if (weatherRes.data.success) {
          setWeatherData(weatherRes.data.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return <LoadingSpinner message="Assembling farm telemetry and live analytics..." />;
  }

  const totalAcres = farms.reduce((sum, f) => sum + (Number(f.area) || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner & Agro-Weather Widget */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-600 dark:from-emerald-800 dark:via-emerald-700 dark:to-green-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 h-96 w-96 -translate-y-24 translate-x-24 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/30 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-200 backdrop-blur-md">
                <Sprout className="h-3.5 w-3.5" />
                {user?.role === 'seller' ? t('dashboard.agri_business') : t('dashboard.precision_farming')}
              </span>
              <span className="text-xs text-emerald-200/80">
                {new Date().toLocaleDateString(i18n.language === 'mr' ? 'mr-IN' : i18n.language === 'hi' ? 'hi-IN' : 'en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
              {t('dashboard.welcome') || (i18n.language === 'mr' ? 'नमस्कार' : i18n.language === 'hi' ? 'नमस्ते' : 'Welcome')}, {user?.name || 'Farmer'}! 👋
            </h1>
            <p className="mt-1 max-w-xl text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              {t('dashboard.subtitle')}
            </p>

            {/* Quick action bar */}
            <div className="mt-5 flex flex-wrap items-center gap-2 sm:gap-3">
              <Link
                to="/farms"
                className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-emerald-800 shadow-md hover:bg-emerald-50 transition"
              >
                <PlusCircle className="h-4 w-4" />
                {t('dashboard.add_farm')}
              </Link>
              <Link
                to="/soil"
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600/60 px-3.5 py-2 text-xs font-bold text-white backdrop-blur-md hover:bg-emerald-600 transition border border-emerald-400/30"
              >
                <FlaskConical className="h-4 w-4" />
                {t('dashboard.log_soil_test')}
              </Link>
              <Link
                to="/ai-assistant"
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-slate-900 shadow-md hover:bg-amber-400 transition"
              >
                <Sparkles className="h-4 w-4" />
                {t('dashboard.ask_ai')}
              </Link>
            </div>
          </div>

          {/* Hyperlocal Weather Capsule */}
          {weatherData && (
            <div className="w-full lg:w-auto shrink-0 rounded-2xl bg-white/10 p-4 sm:p-5 backdrop-blur-md border border-white/15">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-200">
                    {weatherData.location}
                  </p>
                  <p className="text-3xl font-extrabold font-heading mt-1">
                    {weatherData.current?.temperature}°C
                  </p>
                  <p className="text-xs text-emerald-100/90 font-medium">
                    {formatWeatherCondition(weatherData.current?.conditionText, i18n.language)}
                  </p>
                </div>
                <CloudSun className="h-12 w-12 text-amber-300 animate-pulse-subtle" />
              </div>

              <div className="mt-3 grid grid-cols-3 gap-3 border-t border-white/15 pt-3 text-[11px] text-emerald-100">
                <div className="flex items-center gap-1.5">
                  <Droplets className="h-3.5 w-3.5 text-sky-300" />
                  <span>{weatherData.current?.humidity}% {t('dashboard.hum')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Wind className="h-3.5 w-3.5 text-teal-300" />
                  <span>{weatherData.current?.windSpeed} km/h</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-amber-300" />
                  <span>{weatherData.current?.rainProbability}% {t('dashboard.rain')}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('dashboard.total_farms')}
          value={`${farms.length} ${t('dashboard.plots')}`}
          subtitle={`${totalAcres.toFixed(1)} ${t('dashboard.acres_cultivated')}`}
          icon={Sprout}
          color="emerald"
          trend={t('dashboard.active')}
        />
        <StatCard
          title={t('dashboard.total_revenue')}
          value={`₹${(financialSummary?.totalRevenue || 0).toLocaleString('en-IN')}`}
          subtitle={t('dashboard.revenue')}
          icon={TrendingUp}
          color="amber"
          trend=""
        />
        <StatCard
          title={t('dashboard.total_expenses')}
          value={`₹${(financialSummary?.totalExpenses || 0).toLocaleString('en-IN')}`}
          subtitle={t('dashboard.full_ledger')}
          icon={Receipt}
          color="emerald"
          trend=""
        />
        <StatCard
          title={t('dashboard.net_profit')}
          value={`₹${(financialSummary?.estimatedProfit || 0).toLocaleString('en-IN')}`}
          subtitle={`${t('dashboard.revenue')} - ${t('dashboard.total_expenses')}`}
          icon={Layers}
          color={financialSummary?.estimatedProfit >= 0 ? "emerald" : "red"}
          trend=""
        />
      </div>



      {/* Farms, Crops & Live Advisory Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Farm Plots */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
              {t('dashboard.active_farm_plots')}
            </h3>
            <Link
              to="/farms"
              className="text-xs font-bold text-emerald-600 hover:underline dark:text-emerald-400"
            >
              {t('dashboard.manage_farms')}
            </Link>
          </div>

          {farms.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              {t('dashboard.no_farms_yet')}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {farms.slice(0, 4).map((farm) => (
                <div
                  key={farm._id}
                  className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40 hover:border-emerald-200 dark:hover:border-emerald-800 transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 font-heading">
                        {farm.farmName}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {farm.location?.villageOrCity || 'Plot'}, {farm.area} {farm.areaUnit || 'acres'}
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {farm.irrigationType}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-200/60 pt-2 text-[11px] dark:border-slate-700/60">
                    <span className="text-slate-500 dark:text-slate-400">{t('dashboard.crop_label')}:</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">{farm.currentCrop || t('dashboard.fallow')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Agro Advisory Alert Card */}
        <div className="rounded-3xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50 to-white p-6 shadow-sm dark:border-emerald-900/60 dark:from-emerald-950/40 dark:to-slate-900/90 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
              <Sparkles className="h-5 w-5" />
              <h3 className="text-sm font-bold uppercase tracking-wider font-heading">{t('dashboard.ai_advisory')}</h3>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              {weatherData?.advisories?.[0]?.message ||
                t('dashboard.equilibrium_advisory')}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-emerald-100 dark:border-emerald-900/60">
            <Link
              to="/ai-assistant"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:from-emerald-700 hover:to-green-700 transition"
            >
              {t('dashboard.consult_ai')}
              <Sparkles className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
