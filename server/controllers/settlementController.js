const Settlement = require('../models/Settlement');
const Group = require('../models/Group');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const { notifyGroup, notifyUser } = require('../sockets/socketHandler');

// Record a settlement repayment between members
const recordSettlement = async (req, res) => {
  try {
    const { group: groupId, payer: payerId, receiver: receiverId, amount, notes, date } = req.body;

    if (!groupId || !payerId || !receiverId || !amount) {
      return res.status(400).json({ message: 'Group, payer, receiver, and amount are required' });
    }

    if (payerId.toString() === receiverId.toString()) {
      return res.status(400).json({ message: 'Payer and receiver cannot be the same member' });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ message: 'Amount must be a positive number' });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Verify membership
    const isMember = group.members.some(
      m => m.user.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }

    const settlement = await Settlement.create({
      group: groupId,
      payer: payerId,
      receiver: receiverId,
      amount: Number(numAmount.toFixed(2)),
      notes: notes ? notes.trim() : '',
      date: date ? new Date(date) : new Date(),
      status: 'COMPLETED',
      recordedBy: req.user._id,
    });

    const populated = await Settlement.findById(settlement._id)
      .populate('payer', 'name email avatar')
      .populate('receiver', 'name email avatar')
      .populate('recordedBy', 'name email avatar');

    // Create Activity
    await Activity.create({
      group: groupId,
      user: req.user._id,
      type: 'SETTLEMENT',
      description: `${populated.payer.name} paid ${populated.receiver.name} ₹${numAmount.toFixed(2)}`,
      metadata: { settlementId: settlement._id, amount: numAmount },
    });

    // Notify receiver
    if (receiverId.toString() !== req.user._id.toString()) {
      const notification = await Notification.create({
        recipient: receiverId,
        sender: req.user._id,
        group: groupId,
        type: 'SETTLEMENT_RECORDED',
        title: 'Settlement Recorded',
        message: `${populated.payer.name} paid you ₹${numAmount.toFixed(2)} in ${group.name}`,
        data: { settlementId: settlement._id, groupId },
      });
      notifyUser(receiverId, 'notification', notification);
    }

    // Broadcast live update to group
    notifyGroup(groupId, 'settlement_recorded', {
      settlement: populated,
      groupId,
      user: { _id: req.user._id, name: req.user.name },
    });

    res.status(201).json(populated);
  } catch (error) {
    console.error('Error recording settlement:', error);
    res.status(500).json({ message: 'Failed to record settlement', error: error.message });
  }
};

// Get settlements for a group
const getGroupSettlements = async (req, res) => {
  try {
    const { groupId } = req.params;
    const settlements = await Settlement.find({ group: groupId })
      .populate('payer', 'name email avatar')
      .populate('receiver', 'name email avatar')
      .sort({ date: -1 });

    res.json(settlements);
  } catch (error) {
    console.error('Error fetching settlements:', error);
    res.status(500).json({ message: 'Failed to fetch settlements', error: error.message });
  }
};

module.exports = {
  recordSettlement,
  getGroupSettlements,
};
