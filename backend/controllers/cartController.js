import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// @desc    Get current user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Filter out any items where product was deleted in DB
    const validItems = cart.items.filter((item) => item.product !== null);
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    const subtotal = cart.items.reduce((sum, item) => {
      const price = item.product ? item.product.price : item.priceAtAddition;
      return sum + price * item.quantity;
    }, 0);

    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    res.status(200).json({
      success: true,
      data: {
        _id: cart._id,
        items: cart.items,
        totalItems,
        subtotal: Number(subtotal.toFixed(2)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const qty = Number(quantity || 1);

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.stockQuantity < qty) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stockQuantity} items in stock`,
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);

    if (itemIndex > -1) {
      const newQty = cart.items[itemIndex].quantity + qty;
      if (product.stockQuantity < newQty) {
        return res.status(400).json({
          success: false,
          message: `Cannot exceed available stock (${product.stockQuantity})`,
        });
      }
      cart.items[itemIndex].quantity = newQty;
      cart.items[itemIndex].priceAtAddition = product.price;
    } else {
      cart.items.push({
        product: productId,
        quantity: qty,
        priceAtAddition: product.price,
      });
    }

    await cart.save();
    cart = await Cart.findById(cart._id).populate('items.product');

    res.status(200).json({
      success: true,
      message: `${product.title} added to cart`,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update item quantity in cart
// @route   PUT /api/cart/:productId
// @access  Private
export const updateCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const qty = Number(quantity);

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    if (qty <= 0) {
      // Remove item
      cart.items = cart.items.filter((item) => item.product.toString() !== productId);
    } else {
      const item = cart.items.find((item) => item.product.toString() === productId);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Item not in cart' });
      }

      const product = await Product.findById(productId);
      if (product && product.stockQuantity < qty) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stockQuantity} items available in stock`,
        });
      }

      item.quantity = qty;
    }

    await cart.save();
    cart = await Cart.findById(cart._id).populate('items.product');

    res.status(200).json({
      success: true,
      message: 'Cart updated',
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
export const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter((item) => item.product.toString() !== productId);
    await cart.save();
    cart = await Cart.findById(cart._id).populate('items.product');

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.status(200).json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    next(error);
  }
};
