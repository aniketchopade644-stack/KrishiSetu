import express from 'express';
import {
  getAllSoilRecords,
  getSoilRecordsByFarm,
  createSoilRecord,
  deleteSoilRecord,
} from '../controllers/soilController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/').get(getAllSoilRecords).post(createSoilRecord);
router.route('/farm/:farmId').get(getSoilRecordsByFarm);
router.route('/:id').delete(deleteSoilRecord);

export default router;
