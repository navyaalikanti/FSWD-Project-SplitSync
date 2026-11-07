const Group = require('../models/Group');
const Expense = require('../models/Expense');
const Settlement = require('../models/Settlement');
const Activity = require('../models/Activity');
const { calculateGroupBalances } = require('../utils/debtSimplifier');

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    // 1. Fetch all user groups
    const groups = await Group.find({ 'members.user': req.user._id })
      .populate('members.user', 'name email avatar');

    const groupIds = groups.map(g => g._id);

    // 2. Fetch all expenses and settlements across these groups
    const expenses = await Expense.find({ group: { $in: groupIds } })
      .populate('group', 'name category color')
      .populate('paidBy', 'name email avatar')
      .populate('participants.user', 'name email avatar')
      .sort({ date: -1 });

    const settlements = await Settlement.find({ group: { $in: groupIds } })
      .populate('payer', 'name email avatar')
      .populate('receiver', 'name email avatar')
      .sort({ date: -1 });

    // 3. Compute overall user balances across groups
    let totalGroupExpenses = 0;
    let totalYouOwe = 0;
    let totalYouAreOwed = 0;
    const allSimplifiedDebts = [];
    const groupSummaries = [];

    for (const group of groups) {
      const gExpenses = expenses.filter(e => e.group._id.toString() === group._id.toString());
      const gSettlements = settlements.filter(s => s.group.toString() === group._id.toString());

      const gTotal = gExpenses.reduce((sum, e) => sum + e.amount, 0);
      totalGroupExpenses += gTotal;

      const { netBalances, simplifiedDebts } = calculateGroupBalances(
        group.members,
        gExpenses,
        gSettlements
      );

      const myNet = netBalances.find(b => b.user._id.toString() === userId);
      const myBalance = myNet ? myNet.netBalance : 0;

      if (myBalance > 0) {
        totalYouAreOwed += myBalance;
      } else if (myBalance < 0) {
        totalYouOwe += Math.abs(myBalance);
      }

      // Collect user-relevant simplified debts
      simplifiedDebts.forEach(debt => {
        if (debt.from._id.toString() === userId || debt.to._id.toString() === userId) {
          allSimplifiedDebts.push({
            ...debt,
            group: { _id: group._id, name: group.name, color: group.color },
          });
        }
      });

      groupSummaries.push({
        _id: group._id,
        name: group.name,
        category: group.category,
        color: group.color,
        memberCount: group.members.length,
        totalExpense: Number(gTotal.toFixed(2)),
        userBalance: myBalance,
        status: myNet ? myNet.status : 'SETTLED',
      });
    }

    const netOverallBalance = Number((totalYouAreOwed - totalYouOwe).toFixed(2));

    // 4. Category Breakdown for Recharts
    const categoryTotals = {};
    expenses.forEach(e => {
      const cat = e.category || 'Other';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + e.amount;
    });

    const categoryColors = {
      'Food & Drink': '#E60023', // Pinterest Iconic Red
      'Travel': '#C8001A', // Deep Red
      'Accommodation': '#E11D48', // Crimson Rose
      'Shopping': '#BE185D', // Dark Red
      'Entertainment': '#9D174D', // Deep Berry
      'Utilities': '#F43F5E', // Rose
      'Other': '#767676', // Slate Gray
    };

    const categoryData = Object.keys(categoryTotals).map(cat => ({
      name: cat,
      value: Number(categoryTotals[cat].toFixed(2)),
      color: categoryColors[cat] || '#E60023',
    }));

    // 5. Monthly Spending Trend for Recharts (Last 6 months)
    const monthlyMap = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    expenses.forEach(e => {
      const d = new Date(e.date);
      const key = `${months[d.getMonth()]} ${d.getFullYear()}`;

      if (!monthlyMap[key]) {
        monthlyMap[key] = { month: key, total: 0, yourShare: 0, dateOrder: d.getTime() };
      }

      monthlyMap[key].total += e.amount;

      // Find user's share in this expense
      const myPart = e.participants.find(p => p.user && p.user._id.toString() === userId);
      if (myPart) {
        monthlyMap[key].yourShare += myPart.amount;
      }
    });

    const monthlySpending = Object.values(monthlyMap)
      .sort((a, b) => a.dateOrder - b.dateOrder)
      .slice(-6)
      .map(({ month, total, yourShare }) => ({
        month,
        total: Number(total.toFixed(2)),
        yourShare: Number(yourShare.toFixed(2)),
      }));

    // 6. Recent Activities
    const recentActivities = await Activity.find({ group: { $in: groupIds } })
      .populate('user', 'name email avatar')
      .populate('group', 'name color')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      summary: {
        totalGroupExpenses: Number(totalGroupExpenses.toFixed(2)),
        totalYouOwe: Number(totalYouOwe.toFixed(2)),
        totalYouAreOwed: Number(totalYouAreOwed.toFixed(2)),
        netBalance: netOverallBalance,
        activeGroupsCount: groups.length,
      },
      recentExpenses: expenses.slice(0, 8),
      recentActivities,
      simplifiedDebts: allSimplifiedDebts,
      groupSummaries,
      categoryData,
      monthlySpending,
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ message: 'Failed to retrieve dashboard analytics', error: error.message });
  }
};

module.exports = {
  getDashboardStats,
};
