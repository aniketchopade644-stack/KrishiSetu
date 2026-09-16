import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    farm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      default: null,
    },
    title: {
      type: String,
      required: [true, 'Expense title is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Expense category is required'],
      enum: [
        'Seeds',
        'Fertilizers',
        'Pesticides',
        'Labour',
        'Irrigation',
        'Equipment',
        'Transportation',
        'Other',
      ],
      default: 'Other',
    },
    amount: {
      type: Number,
      required: [true, 'Expense amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    isAutomatedFromOrder: {
      type: Boolean,
      default: false,
    },
    orderReference: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
    orderNumber: {
      type: String,
      default: '',
    },
    paymentMode: {
      type: String,
      enum: ['UPI', 'Cash', 'Bank Transfer', 'KCC / Credit', 'Online Store Purchase'],
      default: 'Cash',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
