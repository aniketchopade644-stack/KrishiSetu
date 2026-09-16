import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sprout,
  Plus,
  MapPin,
  Maximize2,
  Droplets,
  Layers,
  Calendar,
  MoreVertical,
  Edit2,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';

const SOIL_TYPES = [
  'Black / Regur',
  'Alluvial',
  'Red & Yellow',
  'Laterite',
  'Clayey Loam',
  'Sandy Loam',
  'Saline / Alkaline',
];

const IRRIGATION_TYPES = [
  'Drip Irrigation',
  'Sprinkler',
  'Canal / Flood',
  'Tube Well',
  'Rainfed',
];

const Farms = () => {
  const { t } = useTranslation();
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [formData, setFormData] = useState({
    farmName: '',
    villageOrCity: '',
    district: '',
    state: 'Maharashtra',
    area: '',
    areaUnit: 'acres',
    soilType: 'Black / Regur',
    irrigationType: 'Drip Irrigation',
    currentCrop: '',
    sowingDate: '',
    expectedHarvestDate: '',
    notes: '',
  });

  const fetchFarms = async () => {
    try {
      setLoading(true);
      const res = await api.get('/farms');
      if (res.data.success) {
        setFarms(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching farms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarms();
  }, []);

  const handleOpenAdd = () => {
    setEditingFarm(null);
    setFormData({
      farmName: '',
      villageOrCity: '',
      district: '',
      state: 'Maharashtra',
      area: '',
      areaUnit: 'acres',
      soilType: 'Black / Regur',
      irrigationType: 'Drip Irrigation',
      currentCrop: '',
      sowingDate: '',
      expectedHarvestDate: '',
      notes: '',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (farm) => {
    setEditingFarm(farm);
    setFormData({
      farmName: farm.farmName,
      villageOrCity: farm.location?.villageOrCity || '',
      district: farm.location?.district || '',
      state: farm.location?.state || 'Maharashtra',
      area: farm.area,
      areaUnit: farm.areaUnit || 'acres',
      soilType: farm.soilType,
      irrigationType: farm.irrigationType,
      currentCrop: farm.currentCrop || '',
      sowingDate: farm.sowingDate ? farm.sowingDate.split('T')[0] : '',
      expectedHarvestDate: farm.expectedHarvestDate ? farm.expectedHarvestDate.split('T')[0] : '',
      notes: farm.notes || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      farmName: formData.farmName,
      location: {
        villageOrCity: formData.villageOrCity,
        district: formData.district,
        state: formData.state,
      },
      area: Number(formData.area),
      areaUnit: formData.areaUnit,
      soilType: formData.soilType,
      irrigationType: formData.irrigationType,
      currentCrop: formData.currentCrop || 'None',
      sowingDate: formData.sowingDate || null,
      expectedHarvestDate: formData.expectedHarvestDate || null,
      notes: formData.notes,
    };

    try {
      if (editingFarm) {
        await api.put(`/farms/${editingFarm._id}`, payload);
      } else {
        await api.post('/farms', payload);
      }
      setModalOpen(false);
      fetchFarms();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save farm details');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/farms/${id}`);
      setDeleteConfirmId(null);
      fetchFarms();
    } catch (err) {
      alert('Failed to delete farm');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading">
            {t('farms.title')}
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {t('farms.subtitle')}
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-700 transition"
        >
          <Plus className="h-4 w-4" />
          {t('farms.add_btn')}
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading farm plots..." />
      ) : farms.length === 0 ? (
        <EmptyState
          title={t('farms.no_farms')}
          message="Start by adding your first agricultural field plot to monitor soil, crops, and expenses."
          icon={Sprout}
          actionText={t('farms.add_btn')}
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farms.map((farm) => (
            <div
              key={farm._id}
              className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 backdrop-blur-md flex flex-col justify-between hover:shadow-lg transition-all duration-200 group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {farm.area} {farm.areaUnit || 'acres'}
                    </span>
                    <h3 className="mt-2 text-base font-bold text-slate-900 dark:text-white font-heading group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                      {farm.farmName}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(farm)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                      title="Edit Farm"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(farm._id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                      title="Delete Farm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{farm.location?.villageOrCity}, {farm.location?.state}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Layers className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>Soil: <strong>{farm.soilType}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Droplets className="h-4 w-4 text-sky-600 shrink-0" />
                    <span>Irrigation: <strong>{farm.irrigationType}</strong></span>
                  </div>
                </div>

                {/* Current Crop Box */}
                <div className="mt-4 rounded-2xl bg-emerald-50/80 p-3.5 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-emerald-800 dark:text-emerald-300">Current Crop</span>
                    <span className="font-bold text-emerald-950 dark:text-white">{farm.currentCrop || 'Fallow'}</span>
                  </div>
                  {farm.sowingDate && (
                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>Sown: {new Date(farm.sowingDate).toLocaleDateString()}</span>
                      {farm.expectedHarvestDate && (
                        <span>Harvest: {new Date(farm.expectedHarvestDate).toLocaleDateString()}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {farm.notes && (
                <p className="mt-4 text-[11px] italic text-slate-400 line-clamp-2 border-t border-slate-100 dark:border-slate-800 pt-2">
                  "{farm.notes}"
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingFarm ? 'Edit Farm Details' : 'Add New Farm Plot'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Farm Name *
            </label>
            <input
              type="text"
              required
              value={formData.farmName}
              onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
              placeholder="e.g. Sahyadri Bio-Orchard"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Village / City *
              </label>
              <input
                type="text"
                required
                value={formData.villageOrCity}
                onChange={(e) => setFormData({ ...formData, villageOrCity: e.target.value })}
                placeholder="Dindori, Nashik"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                State
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="Maharashtra"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Area (Acres) *
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                placeholder="5.5"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Soil Classification *
              </label>
              <select
                value={formData.soilType}
                onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              >
                {SOIL_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Irrigation System *
              </label>
              <select
                value={formData.irrigationType}
                onChange={(e) => setFormData({ ...formData, irrigationType: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              >
                {IRRIGATION_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Current Crop
              </label>
              <input
                type="text"
                value={formData.currentCrop}
                onChange={(e) => setFormData({ ...formData, currentCrop: e.target.value })}
                placeholder="Tomato / Soybean"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Sowing Date
              </label>
              <input
                type="date"
                value={formData.sowingDate}
                onChange={(e) => setFormData({ ...formData, sowingDate: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Expected Harvest
              </label>
              <input
                type="date"
                value={formData.expectedHarvestDate}
                onChange={(e) => setFormData({ ...formData, expectedHarvestDate: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Field Notes
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Solar pump automated scheduling, north-facing slope..."
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
              {editingFarm ? 'Save Changes' : 'Create Farm Plot'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="Delete Farm Plot"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
          <p>
            Are you sure you want to delete this farm plot? All linked soil test records and crop cycles will also be deleted.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setDeleteConfirmId(null)}
              className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDelete(deleteConfirmId)}
              className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition shadow-sm"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Farms;
