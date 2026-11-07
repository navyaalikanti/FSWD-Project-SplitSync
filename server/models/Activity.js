const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  type: {
    type: String,
    enum: [
      'EXPENSE_CREATE',
      'EXPENSE_UPDATE',
      'EXPENSE_DELETE',
      'SETTLEMENT',
      'MEMBER_JOIN',
      'GROUP_CREATE'
    ],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  }
}, {
  timestamps: true
});

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;
