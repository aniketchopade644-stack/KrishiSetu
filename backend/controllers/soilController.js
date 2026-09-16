import SoilRecord from '../models/SoilRecord.js';
import Farm from '../models/Farm.js';

// Helper function to evaluate soil health and generate agronomic recommendations
export const analyzeSoilHealth = ({ ph, nitrogen, phosphorus, potassium, organicCarbon, moisturePercentage }) => {
  const recommendations = [];

  // pH evaluation
  if (ph < 6.0) {
    recommendations.push(
      `Soil is strongly acidic (pH ${ph}). Apply Agricultural Lime (Calcium Carbonate) or Dolomite @ 2-3 quintals/acre to improve nutrient availability.`
    );
  } else if (ph > 7.8) {
    recommendations.push(
      `Soil is alkaline/saline (pH ${ph}). Apply Agricultural Gypsum and incorporate organic green manure (Dhaincha/Sunhemp) to neutralize alkalinity.`
    );
  } else {
    recommendations.push(`Optimal soil pH (${ph}) suitable for most crop nutrient uptake.`);
  }

  // Nitrogen evaluation (optimal range ~ 280 - 560 kg/ha)
  if (nitrogen < 280) {
    recommendations.push(
      `Low Available Nitrogen (${nitrogen} kg/ha). Apply Neem-Coated Urea in split doses or Azotobacter / Rhizobium bio-fertilizers with well-rotted FYM.`
    );
  } else if (nitrogen > 560) {
    recommendations.push(
      `High Nitrogen level (${nitrogen} kg/ha). Reduce chemical nitrogenous fertilizer to avoid excessive vegetative growth and pest vulnerability.`
    );
  } else {
    recommendations.push(`Sufficient available Nitrogen (${nitrogen} kg/ha). Maintain balanced application.`);
  }

  // Phosphorus evaluation (optimal range ~ 23 - 56 kg/ha)
  if (phosphorus < 23) {
    recommendations.push(
      `Low Phosphorus (${phosphorus} kg/ha). Apply Single Super Phosphate (SSP) or DAP along with Phosphate Solubilizing Bacteria (PSB) at sowing.`
    );
  } else if (phosphorus > 56) {
    recommendations.push(`Good reserve of Phosphorus (${phosphorus} kg/ha).`);
  } else {
    recommendations.push(`Medium Phosphorus (${phosphorus} kg/ha). Adequate for root development.`);
  }

  // Potassium evaluation (optimal range ~ 140 - 280 kg/ha)
  if (potassium < 140) {
    recommendations.push(
      `Low Potassium (${potassium} kg/ha). Apply Muriate of Potash (MOP) or Sulfate of Potash (SOP) to boost disease resistance and grain filling.`
    );
  } else {
    recommendations.push(`Adequate Potassium (${potassium} kg/ha). Supports sturdy plant stems and drought resistance.`);
  }

  // Organic Carbon (optimal > 0.75%)
  if (organicCarbon < 0.5) {
    recommendations.push(
      `Low Organic Carbon (${organicCarbon}%). Soil microbial activity is low. Incorporate 5-8 tonnes/acre of Farmyard Manure (FYM) or vermicompost.`
    );
  }

  return recommendations;
};

// @desc    Get all soil records for a farm
// @route   GET /api/soil/farm/:farmId
// @access  Private
export const getSoilRecordsByFarm = async (req, res, next) => {
  try {
    const { farmId } = req.params;
    const farm = await Farm.findOne({ _id: farmId, owner: req.user._id });
    if (!farm) {
      return res.status(404).json({ success: false, message: 'Farm not found or unauthorized' });
    }

    const records = await SoilRecord.find({ farm: farmId }).sort({ testDate: 1 });
    res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all soil records for the user
// @route   GET /api/soil
// @access  Private
export const getAllSoilRecords = async (req, res, next) => {
  try {
    const records = await SoilRecord.find({ user: req.user._id })
      .populate('farm', 'farmName location soilType')
      .sort({ testDate: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new soil record
// @route   POST /api/soil
// @access  Private
export const createSoilRecord = async (req, res, next) => {
  try {
    const {
      farmId,
      testDate,
      ph,
      nitrogen,
      phosphorus,
      potassium,
      soilType,
      moisturePercentage,
      organicCarbon,
      electricalConductivity,
      sampleLocation,
      labName,
    } = req.body;

    if (!farmId || ph === undefined || nitrogen === undefined || phosphorus === undefined || potassium === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Farm, pH, Nitrogen, Phosphorus, and Potassium values are required',
      });
    }

    const farm = await Farm.findOne({ _id: farmId, owner: req.user._id });
    if (!farm) {
      return res.status(404).json({ success: false, message: 'Selected farm not found' });
    }

    const recommendations = analyzeSoilHealth({
      ph: Number(ph),
      nitrogen: Number(nitrogen),
      phosphorus: Number(phosphorus),
      potassium: Number(potassium),
      organicCarbon: Number(organicCarbon || 0.5),
      moisturePercentage: Number(moisturePercentage || 25),
    });

    const record = await SoilRecord.create({
      farm: farmId,
      user: req.user._id,
      testDate: testDate || Date.now(),
      ph: Number(ph),
      nitrogen: Number(nitrogen),
      phosphorus: Number(phosphorus),
      potassium: Number(potassium),
      soilType: soilType || farm.soilType,
      moisturePercentage: Number(moisturePercentage || 25),
      organicCarbon: Number(organicCarbon || 0.5),
      electricalConductivity: Number(electricalConductivity || 0.8),
      sampleLocation: sampleLocation || 'Main Plot',
      labName: labName || 'Krishi Vigyan Kendra / Field Kit',
      recommendations,
    });

    res.status(201).json({
      success: true,
      message: 'Soil record saved successfully',
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a soil record
// @route   DELETE /api/soil/:id
// @access  Private
export const deleteSoilRecord = async (req, res, next) => {
  try {
    const record = await SoilRecord.findOne({ _id: req.params.id, user: req.user._id });
    if (!record) {
      return res.status(404).json({ success: false, message: 'Soil record not found' });
    }

    await record.deleteOne();
    res.status(200).json({ success: true, message: 'Soil record deleted' });
  } catch (error) {
    next(error);
  }
};
