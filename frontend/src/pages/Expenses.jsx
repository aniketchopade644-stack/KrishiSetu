import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Receipt,
  Plus,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Sparkles,
  Calendar,
  Filter,
  Trash2,
  Printer,
  Search,
  CheckCircle2,
  DollarSign,
  Tag,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import api from '../services/api';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';

const CATEGORIES = [
  'Seeds',
  'Fertilizers',
  'Pesticides',
  'Labour',
  'Irrigation',
  'Equipment',
  'Transportation',
  'Other',
];

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#f97316', '#64748b'];

const Expenses = () => {
  const { t } = useTranslation();
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [selectedFarmFilter, setSelectedFarmFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    farmId: '',
    title: '',
    category: 'Labour',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMode: 'Cash',
    notes: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [expRes, sumRes, farmsRes] = await Promise.all([
        api.get('/expenses'),
        api.get('/expenses/summary'),
        api.get('/farms'),
      ]);
      setExpenses(expRes.data.data || []);
      setSummary(sumRes.data.data || null);
      const farmList = farmsRes.data.data || [];
      setFarms(farmList);
      if (farmList.length > 0 && !formData.farmId) {
        setFormData((prev) => ({ ...prev, farmId: farmList[0]._id }));
      }
    } catch (err) {
      console.error('Error loading expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredExpenses = expenses.filter((exp) => {
    const matchesCat = selectedCategoryFilter === 'all' || exp.category === selectedCategoryFilter;
    const matchesFarm =
      selectedFarmFilter === 'all' || (exp.farm?._id === selectedFarmFilter || exp.farm === selectedFarmFilter);
    const matchesSearch =
      !searchQuery || exp.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesFarm && matchesSearch;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/expenses', {
        ...formData,
        amount: Number(formData.amount),
        farmId: formData.farmId || null,
      });
      setModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error recording expense');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense entry?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      fetchData();
    } catch (err) {
      alert('Error deleting expense');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const isProfitPositive = (summary?.estimatedProfit || 0) >= 0;

  return (
    <div className="space-y-6 pb-12 print:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading">
            {t('expenses.title')}
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {t('expenses.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 shadow-sm"
          >
            <Printer className="h-4 w-4" />
            {t('expenses.export_pdf')}
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-700 transition"
          >
            <Plus className="h-4 w-4" />
            {t('expenses.add_btn')}
          </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-red-100 bg-red-50/60 p-5 dark:border-red-900/40 dark:bg-red-950/30">
          <p className="text-xs font-bold uppercase tracking-wider text-red-800 dark:text-red-300">
            {t('expenses.total_burn')}
          </p>
          <p className="mt-2 text-2xl font-extrabold text-red-950 dark:text-white font-heading">
            ₹{(summary?.totalExpenses || 0).toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-red-700/80 dark:text-red-400 mt-1">
            ₹{(summary?.purchaseExpenses || 0).toLocaleString('en-IN')} Store • ₹{(summary?.otherExpenses || 0).toLocaleString('en-IN')} Manual
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5 dark:border-emerald-900/40 dark:bg-emerald-950/30">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
            Total Crop Revenue
          </p>
          <p className="mt-2 text-2xl font-extrabold text-emerald-950 dark:text-white font-heading">
            ₹{(summary?.totalRevenue || 0).toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400 mt-1">
            From {summary?.cropCount || 0} active & harvested crop seasons
          </p>
        </div>

        <div className={`rounded-2xl border p-5 ${
          isProfitPositive
            ? 'border-emerald-200 bg-emerald-50/80 dark:border-emerald-900/40 dark:bg-emerald-950/40'
            : 'border-red-200 bg-red-50/80 dark:border-red-900/40 dark:bg-red-950/40'
        }`}>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {t('expenses.estimated_profit')}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className={`text-2xl font-extrabold font-heading ${isProfitPositive ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
              ₹{(summary?.estimatedProfit || 0).toLocaleString('en-IN')}
            </p>
            {isProfitPositive ? (
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-600" />
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Revenue minus all input purchases & farm costs
          </p>
        </div>


      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:hidden">
        {/* Category Breakdown Donut */}
        <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 backdrop-blur-md">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
            {t('expenses.category_breakdown')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Proportion of expenditure across seeds, fertilizers, labour, and irrigation
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summary?.categoryBreakdown || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                >
                  {(summary?.categoryBreakdown || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Amount']}
                  contentStyle={{
                    borderRadius: '12px',
                    backgroundColor: '#0f172a',
                    border: 'none',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Trend Bar Chart */}
        <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 backdrop-blur-md">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
            {t('expenses.monthly_trend')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Aggregated monthly farming costs & input procurement burn rate
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary?.monthlyTrend || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Cost']}
                  contentStyle={{
                    borderRadius: '12px',
                    backgroundColor: '#0f172a',
                    border: 'none',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="expense" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 print:hidden">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search expense description..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-xs font-medium text-slate-800 shadow-sm focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-semibold text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {farms.length > 0 && (
            <select
              value={selectedFarmFilter}
              onChange={(e) => setSelectedFarmFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-semibold text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All Farms</option>
              {farms.map((f) => (
                <option key={f._id} value={f._id}>{f.farmName}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Expense Table Ledger */}
      {loading ? (
        <LoadingSpinner message="Calculating financial ledger and expenses..." />
      ) : expenses.length === 0 ? (
        <EmptyState
          title="No Expenses Logged Yet"
          message="Log daily labour, irrigation fuel, fertilizer costs, or make purchases from the Agri-Store to automatically track expenses."
          icon={Receipt}
          actionText={t('expenses.add_btn')}
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <div className="rounded-3xl border border-slate-200/80 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 backdrop-blur-md overflow-hidden">
          <div className="border-b border-slate-100 p-5 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
              {t('expenses.table_title')} ({filteredExpenses.length} Records)
            </h3>
            <span className="text-xs text-slate-500">
              Total Filtered: <strong>₹{filteredExpenses.reduce((s, e) => s + (e.amount || 0), 0).toLocaleString('en-IN')}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:bg-slate-800/60">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Title / Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Farm Plot</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right print:hidden">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredExpenses.map((exp) => (
                  <tr key={exp._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-medium">
                      {new Date(exp.date).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-100">
                      {exp.title}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-emerald-700 dark:text-emerald-400 font-semibold">
                      {exp.farm?.farmName || 'General Account'}
                    </td>
                    <td className="py-3.5 px-4">
                      {exp.isAutomatedFromOrder ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          <Sparkles className="h-3 w-3" />
                          Auto-Sync
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          Manual
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{exp.paymentMode || 'Cash'}</td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-red-600 dark:text-red-400">
                      ₹{exp.amount?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right print:hidden">
                      <button
                        onClick={() => handleDelete(exp._id)}
                        className="rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Expense Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Record Farm Operational Expense"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Expense Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Field Labour Charges / Diesel for Pump"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Amount (₹) *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="4500"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Farm Plot (Optional)
              </label>
              <select
                value={formData.farmId}
                onChange={(e) => setFormData({ ...formData, farmId: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="">General Overhead</option>
                {farms.map((f) => (
                  <option key={f._id} value={f._id}>{f.farmName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Date of Expense
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Payment Mode
            </label>
            <select
              value={formData.paymentMode}
              onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer / NEFT</option>
              <option value="KCC / Credit">Kisan Credit Card (KCC)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Expense Notes
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Contract labour wages for 4 days..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3.5 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-700 transition"
            >
              Log Expense
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Expenses;
