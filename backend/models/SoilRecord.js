import mongoose from 'mongoose';

const soilRecordSchema = new mongoose.Schema(
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
    testDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    ph: {
      type: Number,
      required: [true, 'Soil pH value is required'],
      min: 0,
      max: 14,
    },
    nitrogen: {
      type: Number, // in kg/ha
      required: [true, 'Nitrogen (N) value is required (kg/ha)'],
      min: 0,
    },
    phosphorus: {
      type: Number, // in kg/ha
      required: [true, 'Phosphorus (P) value is required (kg/ha)'],
      min: 0,
    },
    potassium: {
      type: Number, // in kg/ha
      required: [true, 'Potassium (K) value is required (kg/ha)'],
      min: 0,
    },
    soilType: {
      type: String,
      default: 'Black / Regur',
    },
    moisturePercentage: {
      type: Number, // 0 - 100%
      min: 0,
      max: 100,
      default: 25,
    },
    organicCarbon: {
      type: Number, // %
      min: 0,
      max: 10,
      default: 0.5,
    },
    electricalConductivity: {
      type: Number, // dS/m
      default: 0.8,
    },
    sampleLocation: {
      type: String,
      default: 'Field Center Sample',
    },
    labName: {
      type: String,
      default: 'Krishi Vigyan Kendra / Field Kit',
    },
    recommendations: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const SoilRecord = mongoose.model('SoilRecord', soilRecordSchema);
export default SoilRecord;
