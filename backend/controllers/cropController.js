import CropRecord from '../models/CropRecord.js';
import Farm from '../models/Farm.js';

// @desc    Get all crop records for logged in user
// @route   GET /api/crops
// @access  Private
export const getCrops = async (req, res, next) => {
  try {
    const crops = await CropRecord.find({ user: req.user._id })
      .populate('farm', 'farmName location area')
      .sort({ sowingDate: -1 });

    res.status(200).json({
      success: true,
      count: crops.length,
      data: crops,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get crop records for a specific farm
// @route   GET /api/crops/farm/:farmId
// @access  Private
export const getCropsByFarm = async (req, res, next) => {
  try {
    const { farmId } = req.params;
    const crops = await CropRecord.find({ farm: farmId, user: req.user._id }).sort({ sowingDate: -1 });

    res.status(200).json({
      success: true,
      count: crops.length,
      data: crops,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new crop record
// @route   POST /api/crops
// @access  Private
export const createCrop = async (req, res, next) => {
  try {
    const {
      farmId,
      cropName,
      variety,
      season,
      sowingDate,
      expectedHarvestDate,
      actualHarvestDate,
      yieldQuantity,
      yieldUnit,
      sellingPricePerUnit,
      status,
      notes,
    } = req.body;

    if (!farmId || !cropName || !sowingDate || !expectedHarvestDate) {
      return res.status(400).json({
        success: false,
        message: 'Farm, crop name, sowing date, and expected harvest date are required',
      });
    }

    const farm = await Farm.findOne({ _id: farmId, owner: req.user._id });
    if (!farm) {
      return res.status(404).json({ success: false, message: 'Selected farm not found' });
    }

    const totalRevenue =
      Number(yieldQuantity || 0) > 0 && Number(sellingPricePerUnit || 0) > 0
        ? Number((Number(yieldQuantity) * Number(sellingPricePerUnit)).toFixed(2))
        : 0;

    const crop = await CropRecord.create({
      farm: farmId,
      user: req.user._id,
      cropName,
      variety: variety || 'Standard High-Yield',
      season: season || 'Rabi (Winter)',
      sowingDate,
      expectedHarvestDate,
      actualHarvestDate: actualHarvestDate || null,
      yieldQuantity: Number(yieldQuantity || 0),
      yieldUnit: yieldUnit || 'quintals',
      sellingPricePerUnit: Number(sellingPricePerUnit || 0),
      totalRevenue,
      status: status || 'sown',
      notes: notes || '',
    });

    // Optionally update currentCrop on Farm
    if (status !== 'harvested' && status !== 'sold') {
      farm.currentCrop = cropName;
      farm.sowingDate = sowingDate;
      farm.expectedHarvestDate = expectedHarvestDate;
      await farm.save();
    }

    res.status(201).json({
      success: true,
      message: 'Crop record created successfully',
      data: crop,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a crop record
// @route   PUT /api/crops/:id
// @access  Private
export const updateCrop = async (req, res, next) => {
  try {
    let crop = await CropRecord.findOne({ _id: req.params.id, user: req.user._id });
    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop record not found' });
    }

    const updateData = { ...req.body };
    const yQty = updateData.yieldQuantity !== undefined ? Number(updateData.yieldQuantity) : crop.yieldQuantity;
    const price = updateData.sellingPricePerUnit !== undefined ? Number(updateData.sellingPricePerUnit) : crop.sellingPricePerUnit;
    updateData.totalRevenue = Number((yQty * price).toFixed(2));

    crop = await CropRecord.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Crop record updated successfully',
      data: crop,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a crop record
// @route   DELETE /api/crops/:id
// @access  Private
export const deleteCrop = async (req, res, next) => {
  try {
    const crop = await CropRecord.findOne({ _id: req.params.id, user: req.user._id });
    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop record not found' });
    }

    await crop.deleteOne();
    res.status(200).json({ success: true, message: 'Crop record deleted' });
  } catch (error) {
    next(error);
  }
};
