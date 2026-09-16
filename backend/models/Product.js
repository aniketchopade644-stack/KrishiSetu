import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Seeds',
        'Fertilizers',
        'Pesticides',
        'Equipment',
        'Irrigation',
        'Tools',
        'Bio-Fertilizers',
        'Crops/Produce',
        'Other',
      ],
      default: 'Seeds',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive'],
    },
    originalPrice: {
      type: Number,
      default: function () {
        return this.price * 1.15;
      },
    },
    stockQuantity: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 10,
    },
    unit: {
      type: String,
      enum: ['kg', 'liter', 'bag (50kg)', 'packet', 'piece', 'set', 'meter'],
      default: 'packet',
    },
    imageUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80',
    },
    brand: {
      type: String,
      default: 'Krishi Agro Direct',
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 1,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 24,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['available', 'out_of_stock', 'discontinued'],
      default: 'available',
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);
export default Product;
