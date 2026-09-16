import mongoose from 'mongoose';

const cropRecordSchema = new mongoose.Schema(
  {
    farm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      required: [true, 'Farm reference is required'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    cropName: {
      type: String,
      required: [true, 'Crop name is required'],
      trim: true,
    },
    variety: {
      type: String,
      default: 'Standard / High Yield Variety',
      trim: true,
    },
    season: {
      type: String,
      enum: ['Kharif (Monsoon)', 'Rabi (Winter)', 'Zaid (Summer)', 'Perennial / Multi-Season'],
      default: 'Rabi (Winter)',
    },
    sowingDate: {
      type: Date,
      required: [true, 'Sowing date is required'],
    },
    expectedHarvestDate: {
      type: Date,
      required: [true, 'Expected harvest date is required'],
    },
    actualHarvestDate: {
      type: Date,
      default: null,
    },
    yieldQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    yieldUnit: {
      type: String,
      enum: ['quintals', 'kg', 'tonnes', 'crates', 'bags'],
      default: 'quintals',
    },
    sellingPricePerUnit: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['sown', 'vegetative', 'flowering', 'ready_for_harvest', 'harvested', 'sold'],
      default: 'sown',
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

// Pre-save calculate revenue
cropRecordSchema.pre('save', function (next) {
  if (this.yieldQuantity && this.sellingPricePerUnit) {
    this.totalRevenue = Number((this.yieldQuantity * this.sellingPricePerUnit).toFixed(2));
  }
  next();
});

const CropRecord = mongoose.model('CropRecord', cropRecordSchema);
export default CropRecord;
