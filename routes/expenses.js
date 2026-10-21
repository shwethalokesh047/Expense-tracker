const express = require('express');
const Expense = require('../models/Expense');
const router = express.Router();

// Wrap async handlers so errors go to the error middleware
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Build a MongoDB filter from query params: ?category=Food&month=2026-09&search=tea
function buildFilter(q) {
  const filter = {};
  if (q.category && q.category !== 'All') filter.category = q.category;
  if (q.month && /^\d{4}-\d{2}$/.test(q.month)) {
    const [y, m] = q.month.split('-').map(Number);
    filter.date = { $gte: new Date(Date.UTC(y, m - 1, 1)), $lt: new Date(Date.UTC(y, m, 1)) };
  }
  if (q.search) {
    const safe = q.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.title = { $regex: safe, $options: 'i' };
  }
  return filter;
}

// CREATE  - POST /api/expenses
router.post('/', wrap(async (req, res) => {
  const { title, amount, category, date, note } = req.body;
  const expense = await Expense.create({ title, amount, category, date, note });
  res.status(201).json(expense);
}));

// READ (all, with optional filters) - GET /api/expenses
router.get('/', wrap(async (req, res) => {
  const expenses = await Expense.find(buildFilter(req.query)).sort({ date: -1, createdAt: -1 });
  res.json(expenses);
}));

// SUMMARY - GET /api/expenses/summary  (total, count, per-category totals)
router.get('/summary', wrap(async (req, res) => {
  const filter = buildFilter(req.query);
  const byCategory = await Expense.aggregate([
    { $match: filter },
    { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    { $sort: { total: -1 } },
  ]);
  const total = byCategory.reduce((s, c) => s + c.total, 0);
  const count = byCategory.reduce((s, c) => s + c.count, 0);
  res.json({ total, count, byCategory: byCategory.map((c) => ({ category: c._id, total: c.total, count: c.count })) });
}));

// READ (one) - GET /api/expenses/:id
router.get('/:id', wrap(async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  if (!expense) return res.status(404).json({ message: 'Expense not found' });
  res.json(expense);
}));

// UPDATE - PUT /api/expenses/:id
router.put('/:id', wrap(async (req, res) => {
  const { title, amount, category, date, note } = req.body;
  const expense = await Expense.findByIdAndUpdate(
    req.params.id,
    { title, amount, category, date, note },
    { new: true, runValidators: true }
  );
  if (!expense) return res.status(404).json({ message: 'Expense not found' });
  res.json(expense);
}));

// DELETE - DELETE /api/expenses/:id
router.delete('/:id', wrap(async (req, res) => {
  const expense = await Expense.findByIdAndDelete(req.params.id);
  if (!expense) return res.status(404).json({ message: 'Expense not found' });
  res.json({ message: 'Expense deleted', id: req.params.id });
}));

module.exports = router;
