// Optional: fills the database with sample data for screenshots.  Run: npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const Expense = require('../models/Expense');

const d = (offset) => { const x = new Date(); x.setDate(x.getDate() - offset); return x; };
const data = [
  { title: 'Canteen lunch', amount: 120, category: 'Food', date: d(0), note: 'With friends' },
  { title: 'Metro card recharge', amount: 500, category: 'Transport', date: d(1) },
  { title: 'Data structures textbook', amount: 650, category: 'Education', date: d(2) },
  { title: 'Mobile recharge', amount: 299, category: 'Bills', date: d(3) },
  { title: 'Movie tickets', amount: 400, category: 'Entertainment', date: d(4) },
  { title: 'T-shirt', amount: 799, category: 'Shopping', date: d(5) },
  { title: 'Pharmacy', amount: 180, category: 'Health', date: d(6) },
  { title: 'Snacks', amount: 60, category: 'Food', date: d(7) },
];

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/expense_tracker')
  .then(async () => { await Expense.deleteMany({}); await Expense.insertMany(data); console.log('Seeded', data.length, 'expenses'); })
  .catch((e) => console.error(e.message))
  .finally(() => mongoose.disconnect());
