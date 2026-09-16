import Farm from '../models/Farm.js';
import SoilRecord from '../models/SoilRecord.js';
import CropRecord from '../models/CropRecord.js';
import Expense from '../models/Expense.js';

// @desc    Get all farms for the logged-in user
// @route   GET /api/farms
// @access  Private
export const getFarms = async (req, res, next) => {
  try {
    const farms = await Farm.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: farms.length,
      data: farms,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single farm details with latest soil and crop info
// @route   GET /api/farms/:id
// @access  Private
export const getFarmById = async (req, res, next) => {
  try {
    const farm = await Farm.findOne({ _id: req.params.id, owner: req.user._id });
    if (!farm) {
      return res.status(404).json({ success: false, message: 'Farm not found or access denied' });
    }

    const latestSoil = await SoilRecord.findOne({ farm: farm._id }).sort({ testDate: -1 });
    const activeCrops = await CropRecord.find({ farm: farm._id }).sort({ sowingDate: -1 });
    const recentExpenses = await Expense.find({ farm: farm._id }).sort({ date: -1 }).limit(5);

    res.status(200).json({
      success: true,
      data: {
        farm,
        latestSoil,
        crops: activeCrops,
        recentExpenses,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new farm
// @route   POST /api/farms
// @access  Private
export const createFarm = async (req, res, next) => {
  try {
    const {
      farmName,
      location,
      area,
      areaUnit,
      soilType,
      irrigationType,
      currentCrop,
      sowingDate,
      expectedHarvestDate,
      notes,
    } = req.body;

    if (!farmName || !area || !soilType || !irrigationType) {
      return res.status(400).json({
        success: false,
        message: 'Farm name, area, soil type, and irrigation type are required',
      });
    }

    const farm = await Farm.create({
      owner: req.user._id,
      farmName,
      location: location || { villageOrCity: 'Local Farm Area', state: 'Maharashtra' },
      area,
      areaUnit: areaUnit || 'acres',
      soilType,
      irrigationType,
      currentCrop: currentCrop || 'None',
      sowingDate: sowingDate || null,
      expectedHarvestDate: expectedHarvestDate || null,
      notes: notes || '',
    });

    res.status(201).json({
      success: true,
      message: 'Farm created successfully',
      data: farm,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update farm details
// @route   PUT /api/farms/:id
// @access  Private
export const updateFarm = async (req, res, next) => {
  try {
    let farm = await Farm.findOne({ _id: req.params.id, owner: req.user._id });
    if (!farm) {
      return res.status(404).json({ success: false, message: 'Farm not found or access denied' });
    }

    farm = await Farm.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Farm updated successfully',
      data: farm,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a farm
// @route   DELETE /api/farms/:id
// @access  Private
export const deleteFarm = async (req, res, next) => {
  try {
    const farm = await Farm.findOne({ _id: req.params.id, owner: req.user._id });
    if (!farm) {
      return res.status(404).json({ success: false, message: 'Farm not found or access denied' });
    }

    await farm.deleteOne();

    // Optionally cleanup related records
    await SoilRecord.deleteMany({ farm: req.params.id });
    await CropRecord.deleteMany({ farm: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Farm and associated records deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
