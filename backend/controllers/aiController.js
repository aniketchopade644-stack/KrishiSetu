import Farm from '../models/Farm.js';
import SoilRecord from '../models/SoilRecord.js';
import CropRecord from '../models/CropRecord.js';
import AIChat from '../models/AIChat.js';
import { getAIResponse } from '../services/aiService.js';
import axios from 'axios';

// Helper to fetch live weather for context
const fetchWeatherForContext = async (locationCity) => {
  try {
    const geoRes = await axios.get(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationCity || 'Nashik')}&count=1&language=en&format=json`,
      { timeout: 3000 }
    );
    let lat = 19.9975;
    let lon = 73.7898;
    if (geoRes.data?.results?.[0]) {
      lat = geoRes.data.results[0].latitude;
      lon = geoRes.data.results[0].longitude;
    }

    const weatherRes = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=precipitation_probability_max&timezone=auto`,
      { timeout: 3000 }
    );

    return {
      city: locationCity,
      temperature: Math.round(weatherRes.data.current.temperature_2m),
      humidity: weatherRes.data.current.relative_humidity_2m,
      windSpeed: Math.round(weatherRes.data.current.wind_speed_10m),
      rainProbability: weatherRes.data.daily?.precipitation_probability_max?.[0] || 0,
    };
  } catch (err) {
    return {
      city: locationCity || 'Nashik',
      temperature: 29,
      humidity: 55,
      windSpeed: 10,
      rainProbability: 15,
    };
  }
};

// @desc    Ask farming AI assistant with full farm + soil + weather context
// @route   POST /api/ai/ask
// @access  Private
export const askAIAssistant = async (req, res, next) => {
  try {
    const { prompt, farmId, language } = req.body;
    const userLanguage = language || req.user.preferredLanguage || 'en';

    if (!prompt || prompt.trim() === '') {
      return res.status(400).json({ success: false, message: 'Question prompt is required' });
    }

    // 1. Gather Context
    let farm = null;
    let latestSoil = null;
    let activeCrops = [];
    let weatherContext = null;

    if (farmId) {
      farm = await Farm.findOne({ _id: farmId, owner: req.user._id });
    } else {
      // Pick farmer's first active farm if not explicitly provided
      farm = await Farm.findOne({ owner: req.user._id }).sort({ createdAt: -1 });
    }

    if (farm) {
      latestSoil = await SoilRecord.findOne({ farm: farm._id }).sort({ testDate: -1 });
      activeCrops = await CropRecord.find({ farm: farm._id, status: { $ne: 'harvested' } });
      const farmCity = farm.location?.villageOrCity || farm.location?.district || 'Nashik';
      weatherContext = await fetchWeatherForContext(farmCity);
    } else {
      weatherContext = await fetchWeatherForContext(req.user.location?.city || 'Nashik');
    }

    const contextPayload = {
      farmerName: req.user.name,
      language: userLanguage,
      farm: farm
        ? {
            farmName: farm.farmName,
            area: `${farm.area} ${farm.areaUnit || 'acres'}`,
            soilType: farm.soilType,
            irrigationType: farm.irrigationType,
            currentCrop: farm.currentCrop,
            location: farm.location,
          }
        : null,
      latestSoil: latestSoil
        ? {
            testDate: latestSoil.testDate,
            ph: latestSoil.ph,
            nitrogen: `${latestSoil.nitrogen} kg/ha`,
            phosphorus: `${latestSoil.phosphorus} kg/ha`,
            potassium: `${latestSoil.potassium} kg/ha`,
            moisturePercentage: latestSoil.moisturePercentage,
            organicCarbon: latestSoil.organicCarbon,
          }
        : null,
      activeCrops: activeCrops.map((c) => ({
        cropName: c.cropName,
        variety: c.variety,
        season: c.season,
        sowingDate: c.sowingDate,
        status: c.status,
      })),
      weather: weatherContext,
    };

    // 2. Generate AI Answer
    const answer = await getAIResponse({
      prompt,
      context: contextPayload,
      language: userLanguage,
    });

    // 3. Persist in AIChat history
    let chat = await AIChat.findOne({ user: req.user._id, farm: farm ? farm._id : null });
    if (!chat) {
      chat = new AIChat({
        user: req.user._id,
        farm: farm ? farm._id : null,
        language: userLanguage,
        topic: prompt.slice(0, 40),
        messages: [],
      });
    }

    chat.messages.push({ role: 'user', content: prompt });
    chat.messages.push({ role: 'assistant', content: answer });
    chat.contextSnapshot = contextPayload;
    await chat.save();

    res.status(200).json({
      success: true,
      data: {
        response: answer,
        language: userLanguage,
        contextUsed: {
          farmName: farm ? farm.farmName : 'General Agronomy',
          currentCrop: farm ? farm.currentCrop : 'All Crops',
          weather: weatherContext,
          soilTested: !!latestSoil,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get AI Chat conversation history
// @route   GET /api/ai/history
// @access  Private
export const getChatHistory = async (req, res, next) => {
  try {
    const { farmId } = req.query;
    let query = { user: req.user._id };
    if (farmId) query.farm = farmId;

    const chat = await AIChat.findOne(query).sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: chat ? chat.messages : [],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear conversation history
// @route   DELETE /api/ai/history
// @access  Private
export const clearChatHistory = async (req, res, next) => {
  try {
    await AIChat.deleteMany({ user: req.user._id });
    res.status(200).json({ success: true, message: 'Chat history cleared' });
  } catch (error) {
    next(error);
  }
};
