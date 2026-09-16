import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  ShieldCheck,
  Receipt,
  Sparkles,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Modal from '../components/Modal';

const Cart = () => {
  const { t } = useTranslation();
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [farms, setFarms] = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '+91 98221 54321',
    street: 'Plot No 4, Sahyadri Agri Colony',
    city: user?.location?.city || 'Nashik',
    state: user?.location?.state || 'Maharashtra',
    pincode: '422003',
  });

  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSuccessData, setOrderSuccessData] = useState(null);

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const res = await api.get('/farms');
        const list = res.data.data || [];
        setFarms(list);
        if (list.length > 0) setSelectedFarmId(list[0]._id);
      } catch (err) {
        console.error(err);
      }
    };
    fetchFarms();
  }, []);

  const subtotal = cart.subtotal || 0;
  const shippingFee = subtotal > 1500 ? 0 : 75;
  const totalAmount = subtotal + shippingFee;

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.items.length === 0) return;

    try {
      setPlacingOrder(true);
      const payload = {
        shippingAddress,
        paymentMethod,
        farmId: selectedFarmId || null,
      };

      const res = await api.post('/orders', payload);
      if (res.data.success) {
        setOrderSuccessData(res.data.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error processing your order');
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading">
          {t('cart.title')}
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Review your selected seeds, bio-nutrients, and equipment supplies before placing your order
        </p>
      </div>

      {cart.items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center bg-white/40 dark:bg-slate-900/40">
          <ShoppingCart className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 font-heading">
            {t('cart.empty')}
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            Browse our agricultural store for certified hybrid seeds, drip lateral tubing, and organic fertilizers.
          </p>
          <Link
            to="/marketplace"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Explore Agri-Marketplace
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Line Items (2 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Cart Items ({cart.items.reduce((s, i) => s + i.quantity, 0)})
                </span>
                <button
                  onClick={clearCart}
                  className="text-xs font-bold text-red-600 hover:underline dark:text-red-400"
                >
                  Clear Cart
                </button>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {cart.items.map((item) => {
                  const product = item.product || {};
                  return (
                    <div key={item._id || product._id} className="py-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="h-16 w-16 rounded-2xl object-cover bg-slate-100 shrink-0"
                        />
                        <div>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300 uppercase">
                            {product.category || 'Agricultural Item'}
                          </span>
                          <h4 className="mt-1 text-xs font-bold text-slate-900 dark:text-white font-heading line-clamp-1">
                            {product.title}
                          </h4>
                          <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                            ₹{product.price?.toLocaleString('en-IN')} <span className="text-[10px] text-slate-400 font-normal">/ {product.unit || 'unit'}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        {/* Stepper */}
                        <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800">
                          <button
                            onClick={() => updateQuantity(product._id, item.quantity - 1)}
                            className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(product._id, item.quantity + 1)}
                            className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <span className="w-16 text-right text-xs font-extrabold text-slate-900 dark:text-white font-heading">
                          ₹{(product.price * item.quantity).toLocaleString('en-IN')}
                        </span>

                        <button
                          onClick={() => removeFromCart(product._id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Auto Expense Notice Banner */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/40 flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-emerald-900 dark:text-emerald-200">
                  {t('cart.auto_expense_note')}
                </p>
                <p className="mt-0.5 text-emerald-700/90 dark:text-emerald-300">
                  This transaction will automatically be recorded under your farm's "Seeds / Fertilizers / Equipment" expense account for end-of-season profit/loss tracking.
                </p>
              </div>
            </div>
          </div>

          {/* Checkout & Address Panel (1 Col) */}
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 backdrop-blur-md">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-heading mb-4">
                Order Summary
              </h3>

              <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900 dark:text-white">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery / Agri-Freight</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {shippingFee === 0 ? 'FREE (Orders > ₹1500)' : `₹${shippingFee}`}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex items-baseline justify-between text-base font-extrabold text-slate-900 dark:text-white font-heading">
                <span>{t('cart.total')}</span>
                <span className="text-emerald-600 dark:text-emerald-400">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>

              {/* Form Details */}
              <form onSubmit={handleCheckout} className="mt-5 space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Charge Expense to Farm Plot:
                  </label>
                  <select
                    value={selectedFarmId}
                    onChange={(e) => setSelectedFarmId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs font-semibold text-slate-800 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="">General Farm Account</option>
                    {farms.map((f) => (
                      <option key={f._id} value={f._id}>
                        {f.farmName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Delivery Address:
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.street}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                    placeholder="Farm Address / Village"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs font-medium text-slate-800 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    placeholder="City / District"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs font-medium text-slate-800 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                  />
                  <input
                    type="text"
                    required
                    value={shippingAddress.phone}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                    placeholder="Contact Phone"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs font-medium text-slate-800 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Payment Method:
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs font-semibold text-slate-800 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="UPI">UPI (Google Pay / PhonePe / BHIM)</option>
                    <option value="Cash on Delivery">Cash on Delivery (COD)</option>
                    <option value="Net Banking">Net Banking</option>
                    <option value="Kisan Credit Card (KCC)">Kisan Credit Card (KCC)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={placingOrder}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:from-emerald-700 hover:to-green-700 transition disabled:opacity-50"
                >
                  {placingOrder ? 'Confirming Order...' : t('cart.place_order')}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Order Success & Auto-Expense Synchronized Modal */}
      <Modal
        isOpen={!!orderSuccessData}
        onClose={() => {
          setOrderSuccessData(null);
          navigate('/expenses');
        }}
        title="Order Placed & Synchronized Successfully!"
        maxWidth="max-w-lg"
      >
        {orderSuccessData && (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 animate-bounce">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                Order #{orderSuccessData.order?.orderNumber}
              </h4>
              <p className="mt-1 text-xs text-slate-500">
                Amount Paid: <strong>₹{orderSuccessData.order?.totalAmount?.toLocaleString('en-IN')}</strong> via {orderSuccessData.order?.paymentMethod}
              </p>
            </div>

            {/* Auto Expense Confirmation Box */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-left text-xs dark:border-emerald-900/60 dark:bg-emerald-950/40">
              <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-200 mb-1">
                <Receipt className="h-4 w-4" />
                <span>Automatic Farm Expense Created</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                Logged Title: <strong>{orderSuccessData.linkedExpense?.title}</strong>
              </p>
              <p className="text-slate-600 dark:text-slate-300 mt-0.5">
                Category: <strong>{orderSuccessData.linkedExpense?.category}</strong> • Status: <strong>Synchronized</strong>
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setOrderSuccessData(null);
                  navigate('/marketplace');
                }}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-200"
              >
                Continue Shopping
              </button>
              <button
                onClick={() => {
                  setOrderSuccessData(null);
                  navigate('/expenses');
                }}
                className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition"
              >
                View in Farm Expenses →
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Cart;
