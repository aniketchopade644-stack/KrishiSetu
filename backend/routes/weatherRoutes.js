import express from 'express';
import { getWeatherByLocation } from '../controllers/weatherController.js';

const router = express.Router();

router.get('/:location', getWeatherByLocation);
router.get('/', getWeatherByLocation);

export default router;
