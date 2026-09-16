import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Sun,
  Moon,
  ShieldCheck,
  ShoppingBag,
  CheckCircle2,
  Calendar,
  Save,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile = () => {
  const { t } = useTranslation();
  const { user, updateProfileState } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { currentLanguage, changeLanguage } = useLanguage();

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    city: user?.location?.city || 'Nashik',
    state: user?.location?.state || 'Maharashtra',
    role: user?.role || 'farmer',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        city: user.location?.city || 'Nashik',
        state: user.location?.state || 'Maharashtra',
        role: user.role || 'farmer',
      });
    }

    const fetchOrders = async () => {
      try {
        setLoadingOrders(true);
        const res = await api.get('/orders');
        if (res.data.success) {
          setOrders(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.put('/auth/profile', {
        name: formData.name,
        phone: formData.phone,
        role: formData.role,
        location: {
          city: formData.city,
          state: formData.state,
        },
      });

      if (res.data.success) {
        updateProfileState(res.data.data);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      alert('Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading">
          {t('profile.title')}
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {t('profile.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card & Preferences */}
        <div className="space-y-6">
          {/* Identity Capsule */}
          <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 backdrop-blur-md text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-emerald-600 to-green-500 text-3xl font-extrabold text-white shadow-lg shadow-emerald-600/30">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white font-heading">
              {user?.name}
            </h3>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <span className="mt-2 inline-block rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 capitalize">
              Role: {user?.role}
            </span>
          </div>

          {/* Regional & App Settings */}
          <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 backdrop-blur-md space-y-4">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-heading">
              {t('profile.app_preferences')}
            </h4>

            {/* Language Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-emerald-600" />
                {t('profile.interface_lang')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { code: 'en', label: 'English' },
                  { code: 'hi', label: 'हिन्दी' },
                  { code: 'mr', label: 'मराठी' },
                ].map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => changeLanguage(l.code)}
                    className={`rounded-xl py-2 text-xs font-bold transition ${
                      currentLanguage === l.code
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Toggle */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                {theme === 'dark' ? <Moon className="h-4 w-4 text-amber-400" /> : <Sun className="h-4 w-4 text-amber-500" />}
                {t('profile.color_theme')}
              </label>
              <button
                type="button"
                onClick={toggleTheme}
                className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <span className="capitalize">{theme === 'dark' ? t('profile.dark_mode') : t('profile.light_mode')}</span>
                <span className="text-emerald-600 dark:text-emerald-400">Toggle Theme →</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Details Form & Order History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edit Profile Form */}
          <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 backdrop-blur-md">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-heading mb-4">
              Farmer Profile Details
            </h3>

            {savedSuccess && (
              <div className="mb-4 flex items-center gap-2 rounded-2xl bg-emerald-50 p-3 text-xs font-bold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                <CheckCircle2 className="h-4 w-4" />
                Profile updated successfully!
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    {t('profile.full_name')}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    {t('profile.phone_number')}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    {t('profile.city_village')}
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    {t('profile.state')}
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition"
                >
                  <Save className="h-4 w-4" />
                  {saving ? t('common.loading') : t('profile.save_btn')}
                </button>
              </div>
            </form>
          </div>

          {/* Order History Table */}
          <div className="rounded-3xl border border-slate-200/80 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 backdrop-blur-md overflow-hidden">
            <div className="border-b border-slate-100 p-5 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-heading">
                Marketplace Order History ({orders.length})
              </h3>
            </div>

            {loadingOrders ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading order history...</div>
            ) : orders.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No orders placed yet. Products purchased from the Agri-Store will appear here.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {orders.map((order) => (
                  <div key={order._id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                          Order #{order.orderNumber}
                        </span>
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {order.orderStatus}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                        {order.items?.map((i) => `${i.title} (x${i.quantity})`).join(', ')}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Placed on {new Date(order.createdAt).toLocaleDateString()} • Payment: {order.paymentMethod}
                      </p>
                    </div>

                    <div className="text-right sm:shrink-0">
                      <p className="text-sm font-extrabold text-slate-900 dark:text-white font-heading">
                        ₹{order.totalAmount?.toLocaleString('en-IN')}
                      </p>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                        ⚡ Auto-Logged as Expense
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
