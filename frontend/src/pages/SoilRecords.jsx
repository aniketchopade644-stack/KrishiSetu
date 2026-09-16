import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlaskConical,
  Plus,
  Sparkles,
  TrendingUp,
  Droplets,
  Calendar,
  Layers,
  ShieldCheck,
  AlertTriangle,
  Trash2,
} from 'lucide-react';
import {
  LineChart,
  Line,
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

const SoilRecords = () => {
  const { t } = useTranslation();
  const [soilRecords, setSoilRecords] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFarmFilter, setSelectedFarmFilter] = useState('all');

  const [formData, setFormData] = useState({
    farmId: '',
    testDate: new Date().toISOString().split('T')[0],
    ph: 6.8,
    nitrogen: 280,
    phosphorus: 35,
    potassium: 210,
    moisturePercentage: 28,
    organicCarbon: 0.75,
    sampleLocation: 'Central Plot',
    labName: 'Krishi Vigyan Kendra / Field Kit',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [soilRes, farmsRes] = await Promise.all([
        api.get('/soil'),
        api.get('/farms'),
      ]);
      setSoilRecords(soilRes.data.data || []);
      const farmList = farmsRes.data.data || [];
      setFarms(farmList);
      if (farmList.length > 0 && !formData.farmId) {
        setFormData((prev) => ({ ...prev, farmId: farmList[0]._id }));
      }
    } catch (err) {
      console.error('Error fetching soil data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredRecords =
    selectedFarmFilter === 'all'
      ? soilRecords
      : soilRecords.filter((r) => r.farm?._id === selectedFarmFilter || r.farm === selectedFarmFilter);

  // Prepare chart series (chronological order)
  const chartData = [...filteredRecords].reverse().map((r) => ({
    date: new Date(r.testDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    pH: r.ph,
    Nitrogen: r.nitrogen,
    Phosphorus: r.phosphorus,
    Potassium: r.potassium,
    Moisture: r.moisturePercentage,
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.farmId) {
      alert('Please select a farm plot');
      return;
    }

    try {
      await api.post('/soil', {
        ...formData,
        ph: Number(formData.ph),
        nitrogen: Number(formData.nitrogen),
        phosphorus: Number(formData.phosphorus),
        potassium: Number(formData.potassium),
        moisturePercentage: Number(formData.moisturePercentage),
        organicCarbon: Number(formData.organicCarbon),
      });
      setModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error recording soil test');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this soil record?')) return;
    try {
      await api.delete(`/soil/${id}`);
      fetchData();
    } catch (err) {
      alert('Error deleting soil record');
    }
  };

  const latestRecord = filteredRecords.length > 0 ? filteredRecords[0] : null;

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading">
            {t('soil.title')}
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {t('soil.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {farms.length > 0 && (
            <select
              value={selectedFarmFilter}
              onChange={(e) => setSelectedFarmFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-semibold text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All Farms</option>
              {farms.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.farmName}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-700 transition"
          >
            <Plus className="h-4 w-4" />
            {t('soil.log_btn')}
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Evaluating soil chemistry and nutrient indices..." />
      ) : soilRecords.length === 0 ? (
        <EmptyState
          title="No Soil Test Records"
          message="Keep track of your soil's pH, Nitrogen, Phosphorus, and Potassium levels over time to optimize fertilizer dosages."
          icon={FlaskConical}
          actionText={t('soil.log_btn')}
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <>
          {/* Quick Metrics Bar for Latest Record */}
          {latestRecord && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-3.5 dark:border-slate-800 dark:bg-slate-900/90 text-center">
                <p className="text-[10px] font-bold uppercase text-slate-400">Soil pH</p>
                <p className={`text-xl font-extrabold font-heading mt-1 ${latestRecord.ph < 6 || latestRecord.ph > 7.8 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {latestRecord.ph}
                </p>
                <p className="text-[10px] text-slate-500">Ideal: 6.0–7.5</p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-3.5 dark:border-slate-800 dark:bg-slate-900/90 text-center">
                <p className="text-[10px] font-bold uppercase text-slate-400">Nitrogen (N)</p>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white font-heading mt-1">
                  {latestRecord.nitrogen} <span className="text-xs font-normal">kg/ha</span>
                </p>
                <p className="text-[10px] text-slate-500">Medium: 280–560</p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-3.5 dark:border-slate-800 dark:bg-slate-900/90 text-center">
                <p className="text-[10px] font-bold uppercase text-slate-400">Phosphorus (P)</p>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white font-heading mt-1">
                  {latestRecord.phosphorus} <span className="text-xs font-normal">kg/ha</span>
                </p>
                <p className="text-[10px] text-slate-500">Medium: 23–56</p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-3.5 dark:border-slate-800 dark:bg-slate-900/90 text-center">
                <p className="text-[10px] font-bold uppercase text-slate-400">Potassium (K)</p>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white font-heading mt-1">
                  {latestRecord.potassium} <span className="text-xs font-normal">kg/ha</span>
                </p>
                <p className="text-[10px] text-slate-500">Medium: 140–280</p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-3.5 dark:border-slate-800 dark:bg-slate-900/90 text-center">
                <p className="text-[10px] font-bold uppercase text-slate-400">Moisture %</p>
                <p className="text-xl font-extrabold text-sky-600 dark:text-sky-400 font-heading mt-1">
                  {latestRecord.moisturePercentage}%
                </p>
                <p className="text-[10px] text-slate-500">Field Capacity</p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-3.5 dark:border-slate-800 dark:bg-slate-900/90 text-center">
                <p className="text-[10px] font-bold uppercase text-slate-400">Organic Carbon</p>
                <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-heading mt-1">
                  {latestRecord.organicCarbon}%
                </p>
                <p className="text-[10px] text-slate-500">Target &gt; 0.75%</p>
              </div>
            </div>
          )}

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Historical NPK Chart */}
            <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 backdrop-blur-md">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
                NPK Macro-Nutrient Trends (kg/ha)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Historical progression of Nitrogen, Phosphorus, and Potassium
              </p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        backgroundColor: '#0f172a',
                        border: 'none',
                        color: '#fff',
                        fontSize: '11px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="Nitrogen" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Phosphorus" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Potassium" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* pH & Moisture Line Chart */}
            <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 backdrop-blur-md">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
                Soil pH & Moisture Dynamics
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Acidity balance index and root-zone moisture percentage
              </p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <YAxis yAxisId="left" domain={[4, 10]} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        backgroundColor: '#0f172a',
                        border: 'none',
                        color: '#fff',
                        fontSize: '11px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Line yAxisId="left" type="monotone" dataKey="pH" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4 }} />
                    <Line yAxisId="right" type="monotone" dataKey="Moisture" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Latest Agronomic Recommendations Box */}
          {latestRecord?.recommendations && latestRecord.recommendations.length > 0 && (
            <div className="rounded-3xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50 via-teal-50 to-white p-6 shadow-sm dark:border-emerald-900/60 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 backdrop-blur-md">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 mb-3">
                <Sparkles className="h-5 w-5" />
                <h3 className="text-sm font-bold uppercase tracking-wider font-heading">
                  AI Soil Health Corrective Guidance ({latestRecord.farm?.farmName || 'Target Plot'})
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {latestRecord.recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 rounded-2xl border border-emerald-100 bg-white/80 p-3.5 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300"
                  >
                    <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Records Table */}
          <div className="rounded-3xl border border-slate-200/80 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 backdrop-blur-md overflow-hidden">
            <div className="border-b border-slate-100 p-5 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
                Soil Test Log History
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:bg-slate-800/60">
                  <tr>
                    <th className="py-3 px-4">Test Date</th>
                    <th className="py-3 px-4">Farm Plot</th>
                    <th className="py-3 px-4">pH</th>
                    <th className="py-3 px-4">Nitrogen (N)</th>
                    <th className="py-3 px-4">Phosphorus (P)</th>
                    <th className="py-3 px-4">Potassium (K)</th>
                    <th className="py-3 px-4">Moisture %</th>
                    <th className="py-3 px-4">Laboratory / Kit</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {filteredRecords.map((r) => (
                    <tr key={r._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-medium">
                        {new Date(r.testDate).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-700 dark:text-emerald-400">
                        {r.farm?.farmName || 'Farm Plot'}
                      </td>
                      <td className="py-3.5 px-4 font-bold">{r.ph}</td>
                      <td className="py-3.5 px-4">{r.nitrogen} kg/ha</td>
                      <td className="py-3.5 px-4">{r.phosphorus} kg/ha</td>
                      <td className="py-3.5 px-4">{r.potassium} kg/ha</td>
                      <td className="py-3.5 px-4 font-medium text-sky-600">{r.moisturePercentage}%</td>
                      <td className="py-3.5 px-4 text-slate-500">{r.labName}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDelete(r._id)}
                          className="rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
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
        </>
      )}

      {/* Record Soil Test Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Record New Soil Test"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Select Farm Plot *
            </label>
            <select
              required
              value={formData.farmId}
              onChange={(e) => setFormData({ ...formData, farmId: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
            >
              {farms.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.farmName} ({f.location?.villageOrCity || 'Plot'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Test Date
              </label>
              <input
                type="date"
                value={formData.testDate}
                onChange={(e) => setFormData({ ...formData, testDate: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Soil pH Value (0-14) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="14"
                required
                value={formData.ph}
                onChange={(e) => setFormData({ ...formData, ph: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Nitrogen (kg/ha) *
              </label>
              <input
                type="number"
                required
                value={formData.nitrogen}
                onChange={(e) => setFormData({ ...formData, nitrogen: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Phosphorus (kg/ha) *
              </label>
              <input
                type="number"
                required
                value={formData.phosphorus}
                onChange={(e) => setFormData({ ...formData, phosphorus: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Potassium (kg/ha) *
              </label>
              <input
                type="number"
                required
                value={formData.potassium}
                onChange={(e) => setFormData({ ...formData, potassium: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Moisture %
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.moisturePercentage}
                onChange={(e) => setFormData({ ...formData, moisturePercentage: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Organic Carbon %
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.organicCarbon}
                onChange={(e) => setFormData({ ...formData, organicCarbon: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Laboratory / Testing Kit Name
            </label>
            <input
              type="text"
              value={formData.labName}
              onChange={(e) => setFormData({ ...formData, labName: e.target.value })}
              placeholder="District Soil Testing Lab / KVK"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
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
              Save Soil Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SoilRecords;
