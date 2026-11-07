const User = require('../models/User');
const Group = require('../models/Group');
const Expense = require('../models/Expense');
const Settlement = require('../models/Settlement');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const { calculateSplits } = require('./splitEngine');

async function seedDemoDataForUser(primaryUser) {
  try {
    const existingGroups = await Group.find({ 'members.user': primaryUser._id });
    if (existingGroups.length > 0) {
      return; // Already seeded
    }

    // Create friends for the demo
    const friendsData = [
      { name: 'Aarav Mehta', email: 'aarav@splitsync.demo', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Aarav' },
      { name: 'Rohan Verma', email: 'rohan@splitsync.demo', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Rohan' },
      { name: 'Ananya Iyer', email: 'ananya@splitsync.demo', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Ananya' },
    ];

    const friends = [];
    for (const f of friendsData) {
      let u = await User.findOne({ email: f.email });
      if (!u) {
        u = await User.create({
          name: f.name,
          email: f.email,
          password: 'demopassword123',
          avatar: f.avatar,
        });
      }
      friends.push(u);
    }

    const allMembers = [primaryUser, ...friends];

    // 1. Group: Goa Beach Trip
    const goaGroup = await Group.create({
      name: 'Goa Beach Trip',
      description: 'Annual weekend getaway with college besties',
      category: 'Trip',
      color: '#E60023',
      inviteCode: 'GOA202',
      createdBy: primaryUser._id,
      members: allMembers.map((m, idx) => ({
        user: m._id,
        role: idx === 0 ? 'admin' : 'member',
        joinedAt: new Date(Date.now() - 10 * 86400000),
      })),
    });

    // Goa Expenses
    // Expense 1: Villa Booking (Equal split, paid by Priya)
    const exp1Participants = calculateSplits(12000, 'EQUAL', allMembers.map(m => ({ user: m._id })));
    await Expense.create({
      title: 'Luxury Beach Villa (3 nights)',
      amount: 12000,
      category: 'Accommodation',
      date: new Date(Date.now() - 5 * 86400000),
      group: goaGroup._id,
      paidBy: primaryUser._id,
      splitMethod: 'EQUAL',
      participants: exp1Participants,
      createdBy: primaryUser._id,
      notes: 'Private pool villa in Candolim',
    });

    // Expense 2: Seafood Dinner (Equal split, paid by Aarav)
    const exp2Participants = calculateSplits(4800, 'EQUAL', allMembers.map(m => ({ user: m._id })));
    await Expense.create({
      title: 'Fisherman\'s Wharf Dinner',
      amount: 4800,
      category: 'Food & Drink',
      date: new Date(Date.now() - 4 * 86400000),
      group: goaGroup._id,
      paidBy: friends[0]._id, // Aarav
      splitMethod: 'EQUAL',
      participants: exp2Participants,
      createdBy: friends[0]._id,
    });

    // Expense 3: Scuba Diving & Watersports (Percentage split)
    const exp3Participants = calculateSplits(9000, 'PERCENTAGE', [
      { user: primaryUser._id, percentage: 30 },
      { user: friends[0]._id, percentage: 30 },
      { user: friends[1]._id, percentage: 40 }, // Rohan did extra parasailing
    ]);
    await Expense.create({
      title: 'Scuba Diving & Watersports Package',
      amount: 9000,
      category: 'Entertainment',
      date: new Date(Date.now() - 3 * 86400000),
      group: goaGroup._id,
      paidBy: friends[1]._id, // Rohan
      splitMethod: 'PERCENTAGE',
      participants: exp3Participants,
      createdBy: friends[1]._id,
    });

    // Settlement in Goa Trip: Rohan settled ₹1500 to Priya
    await Settlement.create({
      group: goaGroup._id,
      payer: friends[1]._id, // Rohan
      receiver: primaryUser._id,
      amount: 1500,
      date: new Date(Date.now() - 1 * 86400000),
      notes: 'Initial settlement for villa booking',
      status: 'COMPLETED',
      recordedBy: friends[1]._id,
    });

    // 2. Group: Apartment 402 Roommates
    const roomies = [primaryUser, friends[0], friends[2]]; // Priya, Aarav, Ananya
    const aptGroup = await Group.create({
      name: 'Apartment 402 Roommates',
      description: 'Monthly flat utilities, groceries and maintenance',
      category: 'Roommates',
      color: '#C8001A',
      inviteCode: 'APT402',
      createdBy: primaryUser._id,
      members: roomies.map((m, idx) => ({
        user: m._id,
        role: idx === 0 ? 'admin' : 'member',
        joinedAt: new Date(Date.now() - 30 * 86400000),
      })),
    });

    // Apartment Expenses
    const exp4Participants = calculateSplits(3200, 'EQUAL', roomies.map(m => ({ user: m._id })));
    await Expense.create({
      title: 'High-speed Fiber WiFi & Power Bill',
      amount: 3200,
      category: 'Utilities',
      date: new Date(Date.now() - 8 * 86400000),
      group: aptGroup._id,
      paidBy: primaryUser._id,
      splitMethod: 'EQUAL',
      participants: exp4Participants,
      createdBy: primaryUser._id,
    });

    const exp5Participants = calculateSplits(2750, 'EQUAL', roomies.map(m => ({ user: m._id })));
    await Expense.create({
      title: 'Nature\'s Basket Organic Groceries',
      amount: 2750,
      category: 'Food & Drink',
      date: new Date(Date.now() - 2 * 86400000),
      group: aptGroup._id,
      paidBy: friends[2]._id, // Ananya
      splitMethod: 'EQUAL',
      participants: exp5Participants,
      createdBy: friends[2]._id,
    });

    // 3. Group: College Tech Fest
    const collegeGroup = await Group.create({
      name: 'College Tech Fest 2026',
      description: 'Hackathon logistics, snacks, and banner printing',
      category: 'College',
      color: '#E11D48',
      inviteCode: 'FEST26',
      createdBy: friends[0]._id,
      members: allMembers.map(m => ({
        user: m._id,
        role: 'member',
        joinedAt: new Date(Date.now() - 15 * 86400000),
      })),
    });

    const exp6Participants = calculateSplits(1800, 'EQUAL', allMembers.map(m => ({ user: m._id })));
    await Expense.create({
      title: 'Vinyl Banners & Badges Printing',
      amount: 1800,
      category: 'Shopping',
      date: new Date(Date.now() - 6 * 86400000),
      group: collegeGroup._id,
      paidBy: friends[0]._id, // Aarav
      splitMethod: 'EQUAL',
      participants: exp6Participants,
      createdBy: friends[0]._id,
    });

    // Create Initial Activities
    await Activity.create([
      {
        group: goaGroup._id,
        user: primaryUser._id,
        type: 'EXPENSE_CREATE',
        description: 'Priya added "Luxury Beach Villa" of ₹12,000.00',
      },
      {
        group: goaGroup._id,
        user: friends[1]._id,
        type: 'SETTLEMENT',
        description: 'Rohan paid Priya ₹1,500.00',
      },
      {
        group: aptGroup._id,
        user: primaryUser._id,
        type: 'EXPENSE_CREATE',
        description: 'Priya added "High-speed Fiber WiFi & Power Bill" of ₹3,200.00',
      },
      {
        group: aptGroup._id,
        user: friends[2]._id,
        type: 'EXPENSE_CREATE',
        description: 'Ananya added "Nature\'s Basket Organic Groceries" of ₹2,750.00',
      },
    ]);

    // Create Notifications for Priya
    await Notification.create([
      {
        recipient: primaryUser._id,
        sender: friends[1]._id,
        group: goaGroup._id,
        type: 'SETTLEMENT_RECORDED',
        title: 'Settlement Received',
        message: 'Rohan paid you ₹1,500.00 for Luxury Beach Villa in Goa Beach Trip',
        isRead: false,
      },
      {
        recipient: primaryUser._id,
        sender: friends[2]._id,
        group: aptGroup._id,
        type: 'EXPENSE_ADDED',
        title: 'New Expense Added',
        message: 'Ananya added "Nature\'s Basket Organic Groceries" (₹2,750.00) in Apartment 402 Roommates',
        isRead: false,
      },
    ]);

    console.log('Demo data successfully initialized for user:', primaryUser.name);
  } catch (error) {
    console.error('Error seeding demo data:', error);
  }
}

module.exports = {
  seedDemoDataForUser,
};
