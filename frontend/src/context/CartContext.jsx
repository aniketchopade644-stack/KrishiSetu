import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [], subtotal: 0, totalItems: 0 });
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchCart = async () => {
    if (!isAuthenticated) {
      setCart({ items: [], subtotal: 0, totalItems: 0 });
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/cart');
      if (res.data.success) {
        setCart(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      showToast('Please login to add products to your cart', 'error');
      return false;
    }
    try {
      const res = await api.post('/cart', { productId, quantity });
      if (res.data.success) {
        await fetchCart();
        showToast(res.data.message || 'Item added to cart', 'success');
        return true;
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not add to cart', 'error');
      return false;
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const res = await api.put(`/cart/${productId}`, { quantity });
      if (res.data.success) {
        await fetchCart();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error updating quantity', 'error');
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const res = await api.delete(`/cart/${productId}`);
      if (res.data.success) {
        await fetchCart();
        showToast('Item removed from cart', 'info');
      }
    } catch (err) {
      showToast('Error removing item', 'error');
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart');
      setCart({ items: [], subtotal: 0, totalItems: 0 });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        totalItems: cart.totalItems || 0,
        subtotal: cart.subtotal || 0,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
