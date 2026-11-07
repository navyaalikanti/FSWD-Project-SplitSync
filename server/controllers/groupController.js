const Group = require('../models/Group');
const Expense = require('../models/Expense');
const Settlement = require('../models/Settlement');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const { calculateGroupBalances } = require('../utils/debtSimplifier');
const { notifyGroup, notifyUser } = require('../sockets/socketHandler');

const generateInviteCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Create a new group
const createGroup = async (req, res) => {
  try {
    const { name, description, category, color } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Group name is required' });
    }

    let inviteCode = generateInviteCode();
    // Ensure unique invite code
    while (await Group.findOne({ inviteCode })) {
      inviteCode = generateInviteCode();
    }

    const group = await Group.create({
      name,
      description: description || '',
      category: category || 'Other',
      color: color || '#E60023',
      inviteCode,
      createdBy: req.user._id,
      members: [
        {
          user: req.user._id,
          role: 'admin',
          joinedAt: new Date(),
        }
      ]
    });

    await Activity.create({
      group: group._id,
      user: req.user._id,
      type: 'GROUP_CREATE',
      description: `${req.user.name} created the group "${name}"`,
    });

    const populatedGroup = await Group.findById(group._id).populate('members.user', 'name email avatar');

    res.status(201).json(populatedGroup);
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ message: 'Failed to create group', error: error.message });
  }
};

// Get all groups for the logged-in user
const getMyGroups = async (req, res) => {
  try {
    const groups = await Group.find({ 'members.user': req.user._id })
      .populate('members.user', 'name email avatar')
      .sort({ updatedAt: -1 });

    // Calculate individual summary for each group
    const groupsWithSummary = await Promise.all(
      groups.map(async (group) => {
        const expenses = await Expense.find({ group: group._id });
        const settlements = await Settlement.find({ group: group._id });

        const { netBalances } = calculateGroupBalances(group.members, expenses, settlements);
        const myNet = netBalances.find(b => b.user._id.toString() === req.user._id.toString());

        const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

        return {
          ...group.toObject(),
          totalExpense: Number(totalExpense.toFixed(2)),
          userNetBalance: myNet ? myNet.netBalance : 0,
          userStatus: myNet ? myNet.status : 'SETTLED',
        };
      })
    );

    res.json(groupsWithSummary);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ message: 'Failed to fetch groups', error: error.message });
  }
};

// Get single group details with complete debt calculations
const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members.user', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Verify membership
    const isMember = group.members.some(
      m => m.user._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }

    const expenses = await Expense.find({ group: group._id })
      .populate('paidBy', 'name email avatar')
      .populate('participants.user', 'name email avatar')
      .sort({ date: -1 });

    const settlements = await Settlement.find({ group: group._id })
      .populate('payer', 'name email avatar')
      .populate('receiver', 'name email avatar')
      .sort({ date: -1 });

    const activities = await Activity.find({ group: group._id })
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(30);

    const { netBalances, simplifiedDebts } = calculateGroupBalances(
      group.members,
      expenses,
      settlements
    );

    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

    res.json({
      group,
      expenses,
      settlements,
      activities,
      netBalances,
      simplifiedDebts,
      totalExpense: Number(totalExpense.toFixed(2)),
    });
  } catch (error) {
    console.error('Error fetching group details:', error);
    res.status(500).json({ message: 'Failed to fetch group details', error: error.message });
  }
};

// Join group by invitation code
const joinGroupByCode = async (req, res) => {
  try {
    const { inviteCode } = req.body;

    if (!inviteCode) {
      return res.status(400).json({ message: 'Invitation code is required' });
    }

    const group = await Group.findOne({ inviteCode: inviteCode.trim().toUpperCase() });

    if (!group) {
      return res.status(404).json({ message: 'Invalid invitation code. Group not found.' });
    }

    // Check if already a member
    const alreadyMember = group.members.some(
      m => m.user.toString() === req.user._id.toString()
    );

    if (alreadyMember) {
      return res.status(400).json({ message: 'You are already a member of this group' });
    }

    group.members.push({
      user: req.user._id,
      role: 'member',
      joinedAt: new Date(),
    });

    await group.save();

    await Activity.create({
      group: group._id,
      user: req.user._id,
      type: 'MEMBER_JOIN',
      description: `${req.user.name} joined the group`,
    });

    // Notify other group members
    notifyGroup(group._id, 'member_joined', {
      groupId: group._id,
      user: { _id: req.user._id, name: req.user.name, avatar: req.user.avatar },
      message: `${req.user.name} joined ${group.name}`,
    });

    const populatedGroup = await Group.findById(group._id).populate('members.user', 'name email avatar');

    res.json(populatedGroup);
  } catch (error) {
    console.error('Error joining group:', error);
    res.status(500).json({ message: 'Failed to join group', error: error.message });
  }
};

// Leave group
const leaveGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Verify net balance is 0 before leaving
    const expenses = await Expense.find({ group: group._id });
    const settlements = await Settlement.find({ group: group._id });
    const { netBalances } = calculateGroupBalances(group.members, expenses, settlements);

    const myBalance = netBalances.find(b => b.user._id.toString() === req.user._id.toString());

    if (myBalance && Math.abs(myBalance.netBalance) > 0.05) {
      return res.status(400).json({
        message: `Cannot leave group with an active balance (${myBalance.netBalance > 0 ? `You are owed ₹${myBalance.netBalance}` : `You owe ₹${Math.abs(myBalance.netBalance)}`}). Please settle debts first.`,
      });
    }

    group.members = group.members.filter(
      m => m.user.toString() !== req.user._id.toString()
    );

    await group.save();

    await Activity.create({
      group: group._id,
      user: req.user._id,
      type: 'MEMBER_JOIN',
      description: `${req.user.name} left the group`,
    });

    res.json({ message: 'Successfully left the group' });
  } catch (error) {
    console.error('Error leaving group:', error);
    res.status(500).json({ message: 'Failed to leave group', error: error.message });
  }
};

module.exports = {
  createGroup,
  getMyGroups,
  getGroupById,
  joinGroupByCode,
  leaveGroup,
};
