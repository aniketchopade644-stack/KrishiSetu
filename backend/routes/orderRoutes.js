import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getSellerOrders,
} from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/').post(createOrder).get(getMyOrders);
router.route('/seller/sales').get(getSellerOrders);
router.route('/:id').get(getOrderById);

export default router;
