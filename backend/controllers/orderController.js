import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Expense from '../models/Expense.js';

// Helper to determine primary expense category from order items
const getPrimaryExpenseCategory = (items) => {
  const categoryCount = {};
  for (const item of items) {
    const cat = item.category || 'Other';
    categoryCount[cat] = (categoryCount[cat] || 0) + item.price * item.quantity;
  }
  let maxCat = 'Other';
  let maxAmount = 0;
  for (const [cat, amt] of Object.entries(categoryCount)) {
    if (amt > maxAmount) {
      maxAmount = amt;
      maxCat = cat;
    }
  }

  // Ensure it matches Expense categories enum
  const validCategories = [
    'Seeds',
    'Fertilizers',
    'Pesticides',
    'Labour',
    'Irrigation',
    'Equipment',
    'Transportation',
    'Other',
  ];

  return validCategories.includes(maxCat) ? maxCat : 'Other';
};

// @desc    Create new order and automatically sync as Expense record
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod, farmId } = req.body;

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.phone) {
      return res.status(400).json({
        success: false,
        message: 'Complete shipping address and phone number are required',
      });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Prepare order items and verify inventory
    let subtotal = 0;
    const orderItems = [];

    for (const cartItem of cart.items) {
      const product = await Product.findById(cartItem.product._id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${cartItem.product.title} is no longer available`,
        });
      }

      if (product.stockQuantity < cartItem.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.title}. Only ${product.stockQuantity} remaining.`,
        });
      }

      // Deduct stock
      product.stockQuantity -= cartItem.quantity;
      if (product.stockQuantity === 0) {
        product.status = 'out_of_stock';
      }
      await product.save();

      const itemTotal = product.price * cartItem.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        title: product.title,
        quantity: cartItem.quantity,
        price: product.price,
        category: product.category,
        unit: product.unit,
        imageUrl: product.imageUrl,
        seller: product.seller,
      });
    }

    const shippingFee = subtotal > 1500 ? 0 : 75;
    const totalAmount = Number((subtotal + shippingFee).toFixed(2));
    const orderNumber = `KS-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 1. Create and Save Order
    const order = await Order.create({
      orderNumber,
      buyer: req.user._id,
      items: orderItems,
      subtotal,
      shippingFee,
      totalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || 'UPI',
      paymentStatus: 'Paid',
      orderStatus: 'Order Placed',
      autoExpenseCreated: true,
    });

    // 2. AUTOMATIC EXPENSE CREATION (Core Requirement 6)
    const primaryCategory = getPrimaryExpenseCategory(orderItems);
    const itemNames = orderItems.map((i) => `${i.title} (x${i.quantity})`).join(', ');

    const autoExpense = await Expense.create({
      user: req.user._id,
      farm: farmId || null,
      title: `Agri-Store Purchase: ${itemNames.slice(0, 80)}${itemNames.length > 80 ? '...' : ''}`,
      category: primaryCategory,
      amount: totalAmount,
      date: new Date(),
      isAutomatedFromOrder: true,
      orderReference: order._id,
      orderNumber: order.orderNumber,
      paymentMode: 'Online Store Purchase',
      notes: `Auto-generated from KrishiSetu Marketplace Order #${order.orderNumber}. Items: ${itemNames}`,
    });

    // Update order with linked expense
    order.linkedExpenseId = autoExpense._id;
    await order.save();

    // 3. Clear user cart
    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully and logged in your farm expense records!',
      data: {
        order,
        linkedExpense: autoExpense,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user's order history
// @route   GET /api/orders
// @access  Private
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ buyer: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, buyer: req.user._id }).populate('items.product');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sales for seller
// @route   GET /api/orders/seller/sales
// @access  Private (Seller/Admin)
export const getSellerOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ 'items.seller': req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};
