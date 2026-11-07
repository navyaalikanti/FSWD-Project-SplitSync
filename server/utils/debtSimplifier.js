/**
 * SplitSync Debt Simplification Engine
 * 
 * Takes group expenses and settlements, computes individual net balances,
 * and uses a Min-Cash-Flow greedy algorithm to minimize the number of 
 * transactions required to settle all debts.
 * 
 * Example:
 * If A owes B ₹300 and B owes C ₹300:
 * Net balances: A: -300, B: 0, C: +300
 * Simplified: A pays C ₹300 directly (1 transaction instead of 2).
 */

function calculateGroupBalances(members, expenses = [], settlements = []) {
  // Map of userId -> balance in paise (positive = is owed, negative = owes)
  const balancesPaise = {};
  const userMap = {};

  // Initialize all members
  members.forEach(m => {
    const u = m.user || m;
    const uid = (u._id || u.id || u).toString();
    balancesPaise[uid] = 0;
    userMap[uid] = {
      _id: uid,
      name: u.name || 'Member',
      email: u.email || '',
      avatar: u.avatar || '',
    };
  });

  // Factor in all expenses
  expenses.forEach(exp => {
    const payerId = (exp.paidBy._id || exp.paidBy.id || exp.paidBy).toString();
    const totalExpPaise = Math.round(Number(exp.amount) * 100);

    if (balancesPaise[payerId] !== undefined) {
      balancesPaise[payerId] += totalExpPaise;
    }

    if (Array.isArray(exp.participants)) {
      exp.participants.forEach(p => {
        const participantId = (p.user._id || p.user.id || p.user).toString();
        const sharePaise = Math.round(Number(p.amount) * 100);
        if (balancesPaise[participantId] !== undefined) {
          balancesPaise[participantId] -= sharePaise;
        }
      });
    }
  });

  // Factor in all settlements
  settlements.forEach(settlement => {
    if (settlement.status === 'COMPLETED') {
      const payerId = (settlement.payer._id || settlement.payer.id || settlement.payer).toString();
      const receiverId = (settlement.receiver._id || settlement.receiver.id || settlement.receiver).toString();
      const amountPaise = Math.round(Number(settlement.amount) * 100);

      // Payer paid money towards debt -> increases payer balance (less negative)
      if (balancesPaise[payerId] !== undefined) {
        balancesPaise[payerId] += amountPaise;
      }
      // Receiver got repayment -> decreases receiver balance (less positive)
      if (balancesPaise[receiverId] !== undefined) {
        balancesPaise[receiverId] -= amountPaise;
      }
    }
  });

  // Format net balances
  const netBalances = Object.keys(balancesPaise).map(uid => {
    const paise = balancesPaise[uid];
    const amount = Number((paise / 100).toFixed(2));
    let status = 'SETTLED';
    if (amount > 0.005) status = 'IS_OWED';
    else if (amount < -0.005) status = 'OWES';

    return {
      user: userMap[uid] || { _id: uid, name: 'Unknown' },
      netBalance: amount,
      status,
    };
  });

  // Simplify Debts using Min-Cash-Flow Algorithm
  // Separate into debtors (< 0) and creditors (> 0)
  const debtors = []; // array of { uid, owesPaise }
  const creditors = []; // array of { uid, isOwedPaise }

  Object.keys(balancesPaise).forEach(uid => {
    const paise = balancesPaise[uid];
    if (paise < -0.5) {
      debtors.push({ uid, owesPaise: Math.abs(paise) });
    } else if (paise > 0.5) {
      creditors.push({ uid, isOwedPaise: paise });
    }
  });

  const simplifiedDebts = [];

  // Greedy matching: largest debtor pays largest creditor
  while (debtors.length > 0 && creditors.length > 0) {
    // Sort descending
    debtors.sort((a, b) => b.owesPaise - a.owesPaise);
    creditors.sort((a, b) => b.isOwedPaise - a.isOwedPaise);

    const debtor = debtors[0];
    const creditor = creditors[0];

    const settledPaise = Math.min(debtor.owesPaise, creditor.isOwedPaise);

    simplifiedDebts.push({
      from: userMap[debtor.uid] || { _id: debtor.uid, name: 'Debtor' },
      to: userMap[creditor.uid] || { _id: creditor.uid, name: 'Creditor' },
      amount: Number((settledPaise / 100).toFixed(2)),
    });

    debtor.owesPaise -= settledPaise;
    creditor.isOwedPaise -= settledPaise;

    if (debtor.owesPaise <= 0.5) {
      debtors.shift();
    }
    if (creditor.isOwedPaise <= 0.5) {
      creditors.shift();
    }
  }

  return {
    netBalances,
    simplifiedDebts,
  };
}

module.exports = {
  calculateGroupBalances,
};
