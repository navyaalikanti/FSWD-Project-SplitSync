const Expense = require('../models/Expense');
const Group = require('../models/Group');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const { calculateSplits } = require('../utils/splitEngine');
const { notifyGroup, notifyUser } = require('../sockets/socketHandler');

// Add new expense
const addExpense = async (req, res) => {
  try {
    const {
      title,
      amount,
      category,
      date,
      notes,
      group: groupId,
      paidBy: paidById,
      splitMethod = 'EQUAL',
      participants,
    } = req.body;

    if (!title || !amount || !groupId) {
      return res.status(400).json({ message: 'Title, amount, and group are required' });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ message: 'Amount must be a positive number' });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Verify current user is a member
    const isMember = group.members.some(
      m => m.user.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }

    // Default participants to all group members if not provided
    const targetParticipants = (participants && participants.length > 0)
      ? participants
      : group.members.map(m => ({ user: m.user.toString() }));

    // Run splitting engine
    const calculatedParticipants = calculateSplits(numAmount, splitMethod, targetParticipants);

    const expense = await Expense.create({
      title: title.trim(),
      amount: Number(numAmount.toFixed(2)),
      category: category || 'Other',
      date: date ? new Date(date) : new Date(),
      notes: notes ? notes.trim() : '',
      group: groupId,
      paidBy: paidById || req.user._id,
      splitMethod,
      participants: calculatedParticipants,
      createdBy: req.user._id,
    });

    // Populate for response & notifications
    const populatedExpense = await Expense.findById(expense._id)
      .populate('paidBy', 'name email avatar')
      .populate('participants.user', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    // Create Activity
    await Activity.create({
      group: groupId,
      user: req.user._id,
      type: 'EXPENSE_CREATE',
      description: `${req.user.name} added expense "${title}" of ₹${numAmount.toFixed(2)}`,
      metadata: { expenseId: expense._id, amount: numAmount },
    });

    // Create in-app Notifications for participants
    const notifications = calculatedParticipants
      .filter(p => p.user.toString() !== req.user._id.toString())
      .map(p => ({
        recipient: p.user,
        sender: req.user._id,
        group: groupId,
        type: 'EXPENSE_ADDED',
        title: 'New Expense Added',
        message: `${req.user.name} added "${title}" (₹${numAmount.toFixed(2)}) in ${group.name}`,
        data: { expenseId: expense._id, groupId },
      }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
      // Emit real-time notification to each participant
      notifications.forEach(n => {
        notifyUser(n.recipient, 'notification', n);
      });
    }

    // Broadcast live update to the entire group room
    notifyGroup(groupId, 'expense_added', {
      expense: populatedExpense,
      groupId,
      user: { _id: req.user._id, name: req.user.name },
    });

    res.status(201).json(populatedExpense);
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(400).json({ message: error.message || 'Failed to add expense' });
  }
};

// Update an existing expense
const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      amount,
      category,
      date,
      notes,
      paidBy,
      splitMethod,
      participants,
    } = req.body;

    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const group = await Group.findById(expense.group);
    if (!group) {
      return res.status(404).json({ message: 'Associated group not found' });
    }

    const isMember = group.members.some(
      m => m.user.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: 'Unauthorized to edit this expense' });
    }

    const numAmount = amount ? Number(amount) : expense.amount;
    const currentSplitMethod = splitMethod || expense.splitMethod;
    const targetParticipants = (participants && participants.length > 0)
      ? participants
      : expense.participants;

    const calculatedParticipants = calculateSplits(numAmount, currentSplitMethod, targetParticipants);

    expense.title = title ? title.trim() : expense.title;
    expense.amount = Number(numAmount.toFixed(2));
    expense.category = category || expense.category;
    if (date) expense.date = new Date(date);
    if (notes !== undefined) expense.notes = notes.trim();
    if (paidBy) expense.paidBy = paidBy;
    expense.splitMethod = currentSplitMethod;
    expense.participants = calculatedParticipants;

    await expense.save();

    const populatedExpense = await Expense.findById(expense._id)
      .populate('paidBy', 'name email avatar')
      .populate('participants.user', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    await Activity.create({
      group: expense.group,
      user: req.user._id,
      type: 'EXPENSE_UPDATE',
      description: `${req.user.name} updated expense "${expense.title}"`,
    });

    notifyGroup(expense.group, 'expense_updated', {
      expense: populatedExpense,
      groupId: expense.group,
    });

    res.json(populatedExpense);
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(400).json({ message: error.message || 'Failed to update expense' });
  }
};

// Delete expense
const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findById(id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const groupId = expense.group;
    const title = expense.title;

    await Expense.findByIdAndDelete(id);

    await Activity.create({
      group: groupId,
      user: req.user._id,
      type: 'EXPENSE_DELETE',
      description: `${req.user.name} deleted expense "${title}"`,
    });

    notifyGroup(groupId, 'expense_deleted', {
      expenseId: id,
      groupId,
      user: { _id: req.user._id, name: req.user.name },
    });

    res.json({ message: 'Expense deleted successfully', expenseId: id });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ message: 'Failed to delete expense', error: error.message });
  }
};

module.exports = {
  addExpense,
  updateExpense,
  deleteExpense,
};
