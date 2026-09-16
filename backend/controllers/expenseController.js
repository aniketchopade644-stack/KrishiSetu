import Expense from '../models/Expense.js';
import CropRecord from '../models/CropRecord.js';
import Farm from '../models/Farm.js';

// @desc    Get all expenses for the user with optional filters
// @route   GET /api/expenses
// @access  Private
export const getExpenses = async (req, res, next) => {
  try {
    const { farmId, category, isAutomated, search } = req.query;
    let query = { user: req.user._id };

    if (farmId && farmId !== 'all') {
      query.farm = farmId;
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (isAutomated !== undefined && isAutomated !== '') {
      query.isAutomatedFromOrder = isAutomated === 'true';
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const expenses = await Expense.find(query)
      .populate('farm', 'farmName location')
      .populate('orderReference', 'orderNumber totalAmount paymentStatus')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get comprehensive expense and financial analytics summary
// @route   GET /api/expenses/summary
// @access  Private
export const getExpenseSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Fetch all expenses
    const expenses = await Expense.find({ user: userId });

    let totalExpenses = 0;
    let purchaseExpenses = 0;
    let manualExpenses = 0;

    const categoryBreakdown = {
      Seeds: 0,
      Fertilizers: 0,
      Pesticides: 0,
      Labour: 0,
      Irrigation: 0,
      Equipment: 0,
      Transportation: 0,
      Other: 0,
    };

    const monthlyMap = {};

    for (const exp of expenses) {
      const amt = Number(exp.amount || 0);
      totalExpenses += amt;

      if (exp.isAutomatedFromOrder) {
        purchaseExpenses += amt;
      } else {
        manualExpenses += amt;
      }

      const cat = exp.category || 'Other';
      if (categoryBreakdown[cat] !== undefined) {
        categoryBreakdown[cat] += amt;
      } else {
        categoryBreakdown.Other += amt;
      }

      // Group by Month (e.g. "Aug 2026")
      const monthKey = new Date(exp.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + amt;
    }

    // 2. Fetch all crop revenues
    const crops = await CropRecord.find({ user: userId });
    let totalRevenue = 0;
    for (const crop of crops) {
      totalRevenue += Number(crop.totalRevenue || 0);
    }

    const estimatedProfit = Number((totalRevenue - totalExpenses).toFixed(2));
    const profitMarginPercentage = totalRevenue > 0 ? Number(((estimatedProfit / totalRevenue) * 100).toFixed(1)) : 0;

    // Format category distribution for charts
    const categoryChartData = Object.entries(categoryBreakdown)
      .filter(([_, val]) => val > 0)
      .map(([name, value]) => ({
        name,
        value: Number(value.toFixed(2)),
      }));

    // Format monthly trend data
    const monthlyTrendData = Object.entries(monthlyMap).map(([month, expenseAmount]) => ({
      month,
      expense: Number(expenseAmount.toFixed(2)),
    }));

    res.status(200).json({
      success: true,
      data: {
        totalExpenses: Number(totalExpenses.toFixed(2)),
        purchaseExpenses: Number(purchaseExpenses.toFixed(2)),
        otherExpenses: Number(manualExpenses.toFixed(2)),
        totalRevenue: Number(totalRevenue.toFixed(2)),
        estimatedProfit,
        profitMarginPercentage,
        expenseCount: expenses.length,
        cropCount: crops.length,
        categoryBreakdown: categoryChartData,
        monthlyTrend: monthlyTrendData,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new manual expense record
// @route   POST /api/expenses
// @access  Private
export const createExpense = async (req, res, next) => {
  try {
    const { farmId, title, category, amount, date, paymentMode, notes } = req.body;

    if (!title || !category || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Title, category, and amount are required',
      });
    }

    let farm = null;
    if (farmId) {
      farm = await Farm.findOne({ _id: farmId, owner: req.user._id });
    }

    const expense = await Expense.create({
      user: req.user._id,
      farm: farm ? farm._id : null,
      title,
      category,
      amount: Number(amount),
      date: date || new Date(),
      paymentMode: paymentMode || 'Cash',
      notes: notes || '',
      isAutomatedFromOrder: false,
    });

    res.status(201).json({
      success: true,
      message: 'Expense recorded successfully',
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an expense record
// @route   DELETE /api/expenses/:id
// @access  Private
export const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense record not found' });
    }

    await expense.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Expense record deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
