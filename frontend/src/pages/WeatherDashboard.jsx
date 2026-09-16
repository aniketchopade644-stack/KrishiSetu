import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CloudSunRain,
  Search,
  Droplets,
  Wind,
  Sun,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Compass,
  MapPin,
  Sparkles,
  ShieldAlert,
  History,
  TrendingUp,
  BarChart2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatWeatherCondition, formatAdvisoryTitle } from '../utils/weatherUtils';

const PRESET_LOCATIONS = [
  'Nashik',
  'Pune',
  'Nagpur',
  'Ludhiana',
  'Indore',
  'Varanasi',
  'Hyderabad',
  'Jaipur',
  'Amravati',
  'Kolhapur',
];

const WeatherDashboard = () => {
  const { t, i18n } = useTranslation();
  const [location, setLocation] = useState('Nashik');
  const [searchInput, setSearchInput] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('forecast'); // 'forecast' | 'history'

  const fetchWeather = async (loc) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/weather/${encodeURIComponent(loc)}`);
      if (res.data.success) {
        setWeatherData(res.data.data);
      }
    } catch (err) {
      setError('Could not fetch weather data. Please check location name.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(location);
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setLocation(searchInput.trim());
      setSearchInput('');
    }
  };

  // Prepare Historical Rain Chart Data
  const pastRainChartData = (weatherData?.pastWeek || []).map((d) => ({
    date: d.dayName,
    rainfall: d.precipitationSum,
    maxTemp: d.maxTemp,
    minTemp: d.minTemp,
  }));

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading">
            {t('weather.title')}
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Live Hyperlocal Telemetry • Past 7-Day Rainfall History • 7-Day Future Forecast
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t('weather.search_placeholder')}
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-slate-800 shadow-sm focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          />
        </form>
      </div>

      {/* Preset Location Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
        <span className="font-bold text-slate-400 uppercase text-[10px] shrink-0">Agro Regions:</span>
        {PRESET_LOCATIONS.map((loc) => (
          <button
            key={loc}
            onClick={() => setLocation(loc)}
            className={`shrink-0 rounded-xl px-3 py-1.5 font-semibold transition ${
              location.toLowerCase() === loc.toLowerCase()
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300'
            }`}
          >
            {loc}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner message="Querying live meteorological telemetry and historical archives..." />
      ) : error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50/70 p-8 text-center text-xs text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
          {error}
        </div>
      ) : weatherData ? (
        <>
          {/* Main Weather Hero Card (Live Real-Time Telemetry) */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-600 dark:from-emerald-900 dark:via-teal-800 dark:to-slate-900 p-6 sm:p-8 text-white shadow-2xl">
            <div className="absolute right-0 bottom-0 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-200 border border-emerald-400/30">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping mr-1"></span>
                    {t('weather.live_telemetry')}
                  </span>
                  <span className="text-xs font-bold uppercase text-emerald-200">
                    {weatherData.location}
                  </span>
                </div>

                <div className="mt-4 flex items-baseline gap-4">
                  <span className="text-5xl sm:text-6xl font-black font-heading tracking-tight">
                    {weatherData.current?.temperature}°C
                  </span>
                  <div className="text-xs text-emerald-200/90">
                    <p className="font-semibold text-white text-sm">{formatWeatherCondition(weatherData.current?.conditionText, i18n.language)}</p>
                    <p>{t('weather.feels_like')} {weatherData.current?.feelsLike}°C • Max {weatherData.current?.maxTemp}°C / Min {weatherData.current?.minTemp}°C</p>
                  </div>
                </div>
              </div>

              {/* 4 Metric Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
                <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-md border border-white/15 text-center">
                  <Droplets className="mx-auto h-5 w-5 text-sky-300 mb-1" />
                  <p className="text-[10px] text-emerald-200 uppercase font-bold">{t('weather.humidity')}</p>
                  <p className="text-sm font-extrabold font-heading mt-0.5">{weatherData.current?.humidity}%</p>
                </div>

                <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-md border border-white/15 text-center">
                  <CloudSunRain className="mx-auto h-5 w-5 text-teal-300 mb-1" />
                  <p className="text-[10px] text-emerald-200 uppercase font-bold">{t('weather.rain_chance')}</p>
                  <p className="text-sm font-extrabold font-heading mt-0.5">{weatherData.current?.rainProbability}%</p>
                </div>

                <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-md border border-white/15 text-center">
                  <Wind className="mx-auto h-5 w-5 text-emerald-300 mb-1" />
                  <p className="text-[10px] text-emerald-200 uppercase font-bold">{t('weather.wind')}</p>
                  <p className="text-sm font-extrabold font-heading mt-0.5">{weatherData.current?.windSpeed} km/h</p>
                </div>

                <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-md border border-white/15 text-center">
                  <Sun className="mx-auto h-5 w-5 text-amber-300 mb-1" />
                  <p className="text-[10px] text-emerald-200 uppercase font-bold">{t('weather.uv_index')}</p>
                  <p className="text-sm font-extrabold font-heading mt-0.5">{weatherData.current?.uvIndex}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actionable Agro-Weather Advisories (Combining Past Accumulation + Future Predictions) */}
          {weatherData.advisories && weatherData.advisories.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-heading flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                {t('weather.advisories_title')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {weatherData.advisories.map((adv, idx) => (
                  <div
                    key={idx}
                    className={`rounded-2xl border p-4 backdrop-blur-md flex items-start gap-3 transition ${
                      adv.type === 'danger'
                        ? 'border-red-200 bg-red-50/70 dark:border-red-900/60 dark:bg-red-950/40 text-red-900 dark:text-red-200'
                        : adv.type === 'warning'
                        ? 'border-amber-200 bg-amber-50/70 dark:border-amber-900/60 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200'
                        : 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                    }`}
                  >
                    {adv.type === 'danger' ? (
                      <ShieldAlert className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                    ) : adv.type === 'warning' ? (
                      <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h4 className="text-xs font-extrabold font-heading">{formatAdvisoryTitle(adv.title, i18n.language)}</h4>
                      <p className="mt-1 text-xs leading-relaxed opacity-90">{adv.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Time Navigation Tabs: Future 7-Day Forecast vs Past 7-Day History */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <button
              onClick={() => setActiveTab('forecast')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === 'forecast'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              <Calendar className="h-4 w-4" />
              📅 7-Day Future Forecast & Advisory
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === 'history'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              <History className="h-4 w-4" />
              📊 {t('weather.past_7days_tab')}
            </button>
          </div>

          {/* Tab 1: Future Forecast View */}
          {activeTab === 'forecast' && (
            <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 backdrop-blur-md animate-in fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-heading">
                  {t('weather.forecast_7day')}
                </h3>
                <span className="text-xs text-slate-500">{t('weather.upcoming_outlook')}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {weatherData.forecast?.map((day, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 text-center dark:border-slate-800 dark:bg-slate-800/40 hover:border-emerald-200 dark:hover:border-emerald-800 transition"
                  >
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{day.dayName}</p>
                    <p className="text-[10px] text-slate-400">{new Date(day.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}</p>

                    <div className="my-3">
                      <CloudSunRain className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                    </div>

                    <p className="text-xs font-bold text-slate-800 dark:text-white">
                      {day.maxTemp}° <span className="text-slate-400 font-normal">/ {day.minTemp}°</span>
                    </p>

                    <div className="mt-2 flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                      <Droplets className="h-2.5 w-2.5" />
                      <span>{day.rainProbability}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Past 7 Days History View */}
          {activeTab === 'history' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Past Rain Accumulation Metric Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-5 dark:border-sky-900/40 dark:bg-sky-950/30">
                  <p className="text-xs font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300">
                    {t('weather.past_rain_total')}
                  </p>
                  <p className="mt-2 text-2xl font-extrabold text-sky-950 dark:text-white font-heading">
                    {weatherData.pastRainAccumulated} mm
                  </p>
                  <p className="text-[11px] text-sky-700/80 dark:text-sky-400 mt-1">
                    {t('weather.past_rain_desc')}
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5 dark:border-emerald-900/40 dark:bg-emerald-950/30">
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                    {t('weather.soil_status')}
                  </p>
                  <p className="mt-2 text-2xl font-extrabold text-emerald-950 dark:text-white font-heading">
                    {weatherData.pastRainAccumulated > 35 ? t('weather.saturated') : weatherData.pastRainAccumulated > 10 ? t('weather.adequate') : t('weather.deficit')}
                  </p>
                  <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400 mt-1">
                    {t('weather.soil_status_desc')}
                  </p>
                </div>

                <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-5 dark:border-amber-900/40 dark:bg-amber-950/30">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                    {t('weather.past_mean_temp')}
                  </p>
                  <p className="mt-2 text-2xl font-extrabold text-amber-950 dark:text-white font-heading">
                    {Math.round(
                      (weatherData.pastWeek || []).reduce((s, d) => s + d.maxTemp, 0) /
                        (weatherData.pastWeek?.length || 1)
                    )}°C Max / {Math.round(
                      (weatherData.pastWeek || []).reduce((s, d) => s + d.minTemp, 0) /
                        (weatherData.pastWeek?.length || 1)
                    )}°C Min
                  </p>
                  <p className="text-[11px] text-amber-700/80 dark:text-amber-400 mt-1">
                    {t('weather.thermal_range_desc')}
                  </p>
                </div>
              </div>

              {/* Historical Rainfall Bar Chart */}
              <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 backdrop-blur-md">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading mb-1">
                  {t('weather.daily_rainfall_title')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  {t('weather.daily_rainfall_desc')}
                </p>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pastRainChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                      <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" label={{ value: 'Rain (mm)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                      <Tooltip
                        formatter={(val) => [`${val} mm`, 'Rainfall']}
                        contentStyle={{
                          borderRadius: '12px',
                          backgroundColor: '#0f172a',
                          border: 'none',
                          color: '#fff',
                          fontSize: '11px',
                        }}
                      />
                      <Bar dataKey="rainfall" fill="#0284c7" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Past 7-Day Day-by-Day Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {weatherData.pastWeek?.map((day, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 text-center dark:border-slate-800 dark:bg-slate-800/40"
                  >
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{day.dayName}</p>
                    <p className="text-[10px] text-slate-400">{new Date(day.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}</p>

                    <div className="my-2">
                      <CloudSunRain className="h-6 w-6 text-slate-500" />
                    </div>

                    <p className="text-xs font-bold text-slate-800 dark:text-white">
                      {day.maxTemp}° / {day.minTemp}°
                    </p>

                    <div className="mt-2 flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                      <span>{day.precipitationSum} mm rain</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
};

export default WeatherDashboard;
