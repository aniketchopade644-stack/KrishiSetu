import express from 'express';
import {
  getExpenses,
  getExpenseSummary,
  createExpense,
  deleteExpense,
} from '../controllers/expenseController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/').get(getExpenses).post(createExpense);
router.route('/summary').get(getExpenseSummary);
router.route('/:id').delete(deleteExpense);

export default router;
