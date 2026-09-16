import express from 'express';
import {
  getCrops,
  getCropsByFarm,
  createCrop,
  updateCrop,
  deleteCrop,
} from '../controllers/cropController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/').get(getCrops).post(createCrop);
router.route('/farm/:farmId').get(getCropsByFarm);
router.route('/:id').put(updateCrop).delete(deleteCrop);

export default router;
