import Product from '../models/Product.js';

// @desc    Get all products with search, category filtering, price filter, sorting
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res, next) => {
  try {
    const { search, category, minPrice, maxPrice, sort, inStockOnly } = req.query;
    let query = {};

    // Search keyword in title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
      ];
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // In-stock filter
    if (inStockOnly === 'true') {
      query.stockQuantity = { $gt: 0 };
      query.status = 'available';
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sort === 'price_asc') sortOptions = { price: 1 };
    if (sort === 'price_desc') sortOptions = { price: -1 };
    if (sort === 'rating') sortOptions = { rating: -1 };

    const products = await Product.find(query).populate('seller', 'name email').sort(sortOptions);

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('seller', 'name email phone location');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get listings created by the logged-in seller
// @route   GET /api/products/seller/my-listings
// @access  Private (Seller / Admin)
export const getMyListings = async (req, res, next) => {
  try {
    const products = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new product listing
// @route   POST /api/products
// @access  Private (Farmer / Seller / Admin)
export const createProduct = async (req, res, next) => {
  try {
    const { title, description, category, price, originalPrice, stockQuantity, unit, imageUrl, brand } = req.body;

    if (!title || !description || !category || price === undefined || stockQuantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, category, price, and stock quantity are required',
      });
    }

    const product = await Product.create({
      seller: req.user._id,
      title,
      description,
      category,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : Number(price) * 1.15,
      stockQuantity: Number(stockQuantity),
      unit: unit || 'packet',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80',
      brand: brand || 'Agro Krishi Direct',
      rating: 4.8,
      status: Number(stockQuantity) > 0 ? 'available' : 'out_of_stock',
    });

    res.status(201).json({
      success: true,
      message: 'Product listing published successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product listing
// @route   PUT /api/products/:id
// @access  Private (Product Owner or Admin)
export const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Ownership check (allow admin or product owner)
    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this listing' });
    }

    const updateData = { ...req.body };
    if (updateData.stockQuantity !== undefined) {
      updateData.status = Number(updateData.stockQuantity) > 0 ? 'available' : 'out_of_stock';
    }

    product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product listing
// @route   DELETE /api/products/:id
// @access  Private (Product Owner or Admin)
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this listing' });
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Product listing deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
