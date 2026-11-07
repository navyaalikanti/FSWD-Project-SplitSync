const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  percentage: {
    type: Number,
    default: 0,
  }
}, { _id: false });

const expenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01,
  },
  category: {
    type: String,
    enum: [
      'Food & Drink',
      'Travel',
      'Accommodation',
      'Shopping',
      'Entertainment',
      'Utilities',
      'Other'
    ],
    default: 'Other',
  },
  date: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
    default: '',
    trim: true,
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true,
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  splitMethod: {
    type: String,
    enum: ['EQUAL', 'EXACT', 'PERCENTAGE'],
    default: 'EQUAL',
  },
  participants: [participantSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, {
  timestamps: true
});

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
