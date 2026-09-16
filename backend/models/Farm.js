import mongoose from 'mongoose';

const farmSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    farmName: {
      type: String,
      required: [true, 'Please provide farm name'],
      trim: true,
    },
    location: {
      villageOrCity: { type: String, required: true },
      district: { type: String, default: '' },
      state: { type: String, default: 'Maharashtra' },
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
    },
    area: {
      type: Number,
      required: [true, 'Please specify farm area in acres'],
      min: [0.1, 'Farm area must be greater than 0'],
    },
    areaUnit: {
      type: String,
      enum: ['acres', 'hectares', 'bigha'],
      default: 'acres',
    },
    soilType: {
      type: String,
      required: [true, 'Please select soil type'],
      enum: [
        'Black / Regur',
        'Alluvial',
        'Red & Yellow',
        'Laterite',
        'Clayey Loam',
        'Sandy Loam',
        'Saline / Alkaline',
      ],
      default: 'Black / Regur',
    },
    irrigationType: {
      type: String,
      required: [true, 'Please select irrigation method'],
      enum: ['Drip Irrigation', 'Sprinkler', 'Canal / Flood', 'Tube Well', 'Rainfed'],
      default: 'Drip Irrigation',
    },
    currentCrop: {
      type: String,
      default: 'None',
      trim: true,
    },
    sowingDate: {
      type: Date,
      default: null,
    },
    expectedHarvestDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'fallow', 'harvested'],
      default: 'active',
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

const Farm = mongoose.model('Farm', farmSchema);
export default Farm;
