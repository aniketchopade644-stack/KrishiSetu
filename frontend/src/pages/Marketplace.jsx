import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  Filter,
  Star,
  Plus,
  Minus,
  ShoppingCart,
  Check,
  Store,
  Tag,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';

const CATEGORIES = [
  'All',
  'Seeds',
  'Fertilizers',
  'Pesticides',
  'Equipment',
  'Irrigation',
  'Tools',
];

const Marketplace = () => {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantityToAdd, setQuantityToAdd] = useState(1);
  const [addingId, setAddingId] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let url = `/products?`;
      if (selectedCategory !== 'All') url += `category=${selectedCategory}&`;
      if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;
      if (sortBy === 'price_asc') url += `sort=price_asc&`;
      if (sortBy === 'price_desc') url += `sort=price_desc&`;
      if (sortBy === 'rating') url += `sort=rating&`;

      const res = await api.get(url);
      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sortBy]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleAddToCart = async (product, qty = 1) => {
    setAddingId(product._id);
    await addToCart(product._id, qty);
    setAddingId(null);
  };

  const openProductDetails = (product) => {
    setSelectedProduct(product);
    setQuantityToAdd(1);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-green-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/30 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-200">
              <ShoppingBag className="h-3.5 w-3.5" />
              Verified Agricultural Supplies
            </span>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
              {t('marketplace.title')}
            </h1>
            <p className="mt-1 max-w-xl text-xs sm:text-sm text-emerald-100/90">
              {t('marketplace.subtitle')}
            </p>
          </div>

          <div className="flex flex-col gap-3 max-w-xs">
            <Link
              to="/marketplace/seller"
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-2.5 px-4 text-xs font-bold text-slate-900 shadow-md hover:bg-amber-400 transition"
            >
              <Store className="h-4 w-4" />
              Sell Your Produce
            </Link>

            <div className="rounded-2xl bg-white/10 p-4 text-xs backdrop-blur-md border border-white/15">
              <p className="font-bold flex items-center gap-1.5 text-amber-300">
                <Sparkles className="h-4 w-4" />
                Auto Expense Tracking Active
              </p>
              <p className="mt-1 text-[11px] text-emerald-100/80">
                All marketplace orders automatically log into your farm expense accounting ledger!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('marketplace.search_placeholder')}
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-slate-800 shadow-sm focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          />
        </form>

        {/* Sort Select */}
        <div className="flex items-center gap-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-white py-2.5 px-3.5 text-xs font-semibold text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 focus:outline-none"
          >
            <option value="newest">{t('marketplace.sort_newest')}</option>
            <option value="price_asc">{t('marketplace.sort_price_asc')}</option>
            <option value="price_desc">{t('marketplace.sort_price_desc')}</option>
            <option value="rating">{t('marketplace.sort_rating')}</option>
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition ${
              selectedCategory === cat
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300'
            }`}
          >
            {cat === 'All' ? t('marketplace.category_all') : cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {loading ? (
        <LoadingSpinner message="Loading agricultural supplies catalog..." />
      ) : products.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center text-xs text-slate-500">
          No products found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const isOutOfStock = product.stockQuantity <= 0;
            return (
              <div
                key={product._id}
                className="group rounded-3xl border border-slate-200/80 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 backdrop-blur-md flex flex-col justify-between hover:shadow-xl transition-all duration-200"
              >
                <div>
                  {/* Image Container */}
                  <div
                    onClick={() => openProductDetails(product)}
                    className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800 cursor-pointer"
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <span className="absolute top-2.5 left-2.5 rounded-full bg-slate-900/80 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-md">
                      {product.category}
                    </span>
                    {product.isFeatured && (
                      <span className="absolute top-2.5 right-2.5 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-slate-900 shadow-sm">
                        ★ Best Choice
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="mt-3">
                    <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      {product.brand || 'Krishi Agro'}
                    </p>
                    <h3
                      onClick={() => openProductDetails(product)}
                      className="mt-1 text-sm font-bold text-slate-900 dark:text-white font-heading line-clamp-2 cursor-pointer hover:text-emerald-600 transition"
                    >
                      {product.title}
                    </h3>

                    {/* Rating & Stock */}
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="h-3.5 w-3.5 fill-amber-500" />
                        <span>{product.rating || 4.8}</span>
                        <span className="text-[10px] text-slate-400 font-normal">({product.reviewCount || 24})</span>
                      </div>

                      <span
                        className={`text-[10px] font-bold uppercase ${
                          isOutOfStock ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {isOutOfStock ? t('marketplace.out_of_stock') : `${product.stockQuantity} ${product.unit}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Price & Action Button */}
                <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-extrabold text-slate-900 dark:text-white font-heading">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                    {product.originalPrice > product.price && (
                      <span className="text-xs text-slate-400 line-through">
                        ₹{product.originalPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleAddToCart(product, 1)}
                    disabled={isOutOfStock || addingId === product._id}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition disabled:opacity-50"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {addingId === product._id ? 'Adding...' : t('marketplace.add_to_cart')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Product Details Modal */}
      <Modal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        title={selectedProduct?.title || 'Product Details'}
        maxWidth="max-w-2xl"
      >
        {selectedProduct && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
              <img
                src={selectedProduct.imageUrl}
                alt={selectedProduct.title}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex flex-col justify-between">
              <div>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {selectedProduct.category}
                </span>
                <h3 className="mt-2 text-lg font-bold text-slate-900 dark:text-white font-heading">
                  {selectedProduct.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Brand: {selectedProduct.brand}</p>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading">
                    ₹{selectedProduct.price.toLocaleString('en-IN')}
                  </span>
                  {selectedProduct.originalPrice > selectedProduct.price && (
                    <span className="text-xs text-slate-400 line-through">
                      ₹{selectedProduct.originalPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                  <span className="text-xs text-slate-500">/ {selectedProduct.unit}</span>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  {selectedProduct.description}
                </p>
              </div>

              {/* Quantity Stepper & Add */}
              <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Quantity:</span>
                  <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800">
                    <button
                      onClick={() => setQuantityToAdd(Math.max(1, quantityToAdd - 1))}
                      className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold">{quantityToAdd}</span>
                    <button
                      onClick={() => setQuantityToAdd(Math.min(selectedProduct.stockQuantity, quantityToAdd + 1))}
                      className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => {
                    handleAddToCart(selectedProduct, quantityToAdd);
                    setSelectedProduct(null);
                  }}
                  disabled={selectedProduct.stockQuantity <= 0}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add {quantityToAdd} to Cart (₹{(selectedProduct.price * quantityToAdd).toLocaleString('en-IN')})
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Marketplace;
