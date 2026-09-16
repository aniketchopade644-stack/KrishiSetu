import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CalendarDays,
  Plus,
  TrendingUp,
  Sprout,
  DollarSign,
  Calendar,
  Layers,
  Edit2,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';

const SEASONS = [
  'Kharif (Monsoon)',
  'Rabi (Winter)',
  'Zaid (Summer)',
  'Perennial / Multi-Season',
];

const STAGES = [
  { value: 'sown', label: 'Sown / Germination' },
  { value: 'vegetative', label: 'Vegetative Growth' },
  { value: 'flowering', label: 'Flowering / Podding' },
  { value: 'ready_for_harvest', label: 'Ready for Harvest' },
  { value: 'harvested', label: 'Harvested' },
  { value: 'sold', label: 'Sold to Mandi' },
];

const Crops = () => {
  const { t } = useTranslation();
  const [crops, setCrops] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);

  const [formData, setFormData] = useState({
    farmId: '',
    cropName: '',
    variety: '',
    season: 'Rabi (Winter)',
    sowingDate: new Date().toISOString().split('T')[0],
    expectedHarvestDate: '',
    yieldQuantity: '',
    yieldUnit: 'quintals',
    sellingPricePerUnit: '',
    status: 'sown',
    notes: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cropsRes, farmsRes] = await Promise.all([
        api.get('/crops'),
        api.get('/farms'),
      ]);
      setCrops(cropsRes.data.data || []);
      const farmList = farmsRes.data.data || [];
      setFarms(farmList);
      if (farmList.length > 0 && !formData.farmId) {
        setFormData((prev) => ({ ...prev, farmId: farmList[0]._id }));
      }
    } catch (err) {
      console.error('Error fetching crops:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalRevenue = crops.reduce((sum, c) => sum + (Number(c.totalRevenue) || 0), 0);
  const totalYieldQuintals = crops.reduce((sum, c) => {
    if (c.yieldUnit === 'quintals') return sum + (Number(c.yieldQuantity) || 0);
    if (c.yieldUnit === 'kg') return sum + (Number(c.yieldQuantity) || 0) / 100;
    return sum;
  }, 0);

  const handleOpenAdd = () => {
    setEditingCrop(null);
    setFormData({
      farmId: farms.length > 0 ? farms[0]._id : '',
      cropName: '',
      variety: '',
      season: 'Rabi (Winter)',
      sowingDate: new Date().toISOString().split('T')[0],
      expectedHarvestDate: '',
      yieldQuantity: '',
      yieldUnit: 'quintals',
      sellingPricePerUnit: '',
      status: 'sown',
      notes: '',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (crop) => {
    setEditingCrop(crop);
    setFormData({
      farmId: crop.farm?._id || crop.farm,
      cropName: crop.cropName,
      variety: crop.variety || '',
      season: crop.season || 'Rabi (Winter)',
      sowingDate: crop.sowingDate ? crop.sowingDate.split('T')[0] : '',
      expectedHarvestDate: crop.expectedHarvestDate ? crop.expectedHarvestDate.split('T')[0] : '',
      yieldQuantity: crop.yieldQuantity || '',
      yieldUnit: crop.yieldUnit || 'quintals',
      sellingPricePerUnit: crop.sellingPricePerUnit || '',
      status: crop.status || 'sown',
      notes: crop.notes || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.farmId) {
      alert('Please select a farm plot');
      return;
    }

    const payload = {
      ...formData,
      yieldQuantity: Number(formData.yieldQuantity || 0),
      sellingPricePerUnit: Number(formData.sellingPricePerUnit || 0),
    };

    try {
      if (editingCrop) {
        await api.put(`/crops/${editingCrop._id}`, payload);
      } else {
        await api.post('/crops', payload);
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving crop record');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this crop season record?')) return;
    try {
      await api.delete(`/crops/${id}`);
      fetchData();
    } catch (err) {
      alert('Error deleting crop');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading">
            {t('crops.title')}
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {t('crops.subtitle')}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-700 transition"
        >
          <Plus className="h-4 w-4" />
          {t('crops.add_btn')}
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5 dark:border-emerald-900/40 dark:bg-emerald-950/30">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
            Total Crop Revenue
          </p>
          <p className="mt-2 text-2xl font-extrabold text-emerald-950 dark:text-white font-heading">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400 mt-1">
            Aggregated across all harvested & sold crops
          </p>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-5 dark:border-amber-900/40 dark:bg-amber-950/30">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
            Recorded Produce Yield
          </p>
          <p className="mt-2 text-2xl font-extrabold text-amber-950 dark:text-white font-heading">
            {totalYieldQuintals.toFixed(1)} Quintals
          </p>
          <p className="text-[11px] text-amber-700/80 dark:text-amber-400 mt-1">
            Total agricultural output volume
          </p>
        </div>

        <div className="rounded-2xl border border-sky-100 bg-sky-50/60 p-5 dark:border-sky-900/40 dark:bg-sky-950/30">
          <p className="text-xs font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300">
            Active Crop Seasons
          </p>
          <p className="mt-2 text-2xl font-extrabold text-sky-950 dark:text-white font-heading">
            {crops.filter((c) => c.status !== 'harvested' && c.status !== 'sold').length} Growing
          </p>
          <p className="text-[11px] text-sky-700/80 dark:text-sky-400 mt-1">
            Crops currently under active field maintenance
          </p>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Calculating crop yields and revenue cycles..." />
      ) : crops.length === 0 ? (
        <EmptyState
          title="No Crop Records Found"
          message="Track your sowing dates, seed varieties, expected harvest, and sales price to calculate agricultural profits."
          icon={CalendarDays}
          actionText={t('crops.add_btn')}
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {crops.map((crop) => {
            const isFinished = crop.status === 'harvested' || crop.status === 'sold';
            return (
              <div
                key={crop._id}
                className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 backdrop-blur-md flex flex-col justify-between hover:shadow-lg transition-all"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {crop.season}
                      </span>
                      <h3 className="mt-2 text-base font-bold text-slate-900 dark:text-white font-heading">
                        {crop.cropName}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{crop.variety || 'Standard Hybrid'}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(crop)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(crop._id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Stage Pill */}
                  <div className="mt-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        isFinished
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      <Sprout className="h-3 w-3" />
                      {STAGES.find((s) => s.value === crop.status)?.label || crop.status}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span>Farm Plot:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {crop.farm?.farmName || 'Field Plot'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span>Sowing Date:</span>
                      <span>{new Date(crop.sowingDate).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span>Harvest Date:</span>
                      <span>{new Date(crop.expectedHarvestDate).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span>Yield Output:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {crop.yieldQuantity} {crop.yieldUnit}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span>Selling Price:</span>
                      <span>₹{crop.sellingPricePerUnit} / {crop.yieldUnit}</span>
                    </div>
                  </div>
                </div>

                {/* Revenue Banner */}
                <div className="mt-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 p-3 text-white flex items-center justify-between">
                  <span className="text-xs font-semibold">Total Revenue</span>
                  <span className="text-sm font-extrabold font-heading">₹{(crop.totalRevenue || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Crop Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCrop ? 'Edit Crop Season' : 'Record New Crop Season'}
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
                Crop Name *
              </label>
              <input
                type="text"
                required
                value={formData.cropName}
                onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                placeholder="e.g. Tomato / Wheat / Cotton"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Variety / Hybrid Name
              </label>
              <input
                type="text"
                value={formData.variety}
                onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                placeholder="Abhinav F1 / HD-2967"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Season *
              </label>
              <select
                value={formData.season}
                onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              >
                {SEASONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Current Growth Stage
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              >
                {STAGES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Sowing Date *
              </label>
              <input
                type="date"
                required
                value={formData.sowingDate}
                onChange={(e) => setFormData({ ...formData, sowingDate: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Expected Harvest Date *
              </label>
              <input
                type="date"
                required
                value={formData.expectedHarvestDate}
                onChange={(e) => setFormData({ ...formData, expectedHarvestDate: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Yield Quantity
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.yieldQuantity}
                onChange={(e) => setFormData({ ...formData, yieldQuantity: e.target.value })}
                placeholder="150"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Unit
              </label>
              <select
                value={formData.yieldUnit}
                onChange={(e) => setFormData({ ...formData, yieldUnit: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="quintals">Quintals</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="crates">Crates</option>
                <option value="bags">Bags</option>
                <option value="tonnes">Tonnes</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Selling Price (₹/unit)
              </label>
              <input
                type="number"
                value={formData.sellingPricePerUnit}
                onChange={(e) => setFormData({ ...formData, sellingPricePerUnit: e.target.value })}
                placeholder="2450"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Crop Notes
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Seed treatment with Trichoderma, drip fertigation schedule..."
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
              {editingCrop ? 'Save Changes' : 'Record Crop'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Crops;
