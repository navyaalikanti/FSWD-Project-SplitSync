/**
 * SplitSync Expense Splitting Engine
 * Handles accurate split calculations in minor units (paise)
 * Supports Equal, Exact, and Percentage splits.
 */

function calculateSplits(totalAmount, splitMethod, participants) {
  if (!totalAmount || totalAmount <= 0) {
    throw new Error('Total amount must be greater than zero');
  }
  if (!participants || participants.length === 0) {
    throw new Error('At least one participant is required');
  }

  // Convert to paise (cents) to avoid floating point issues
  const totalPaise = Math.round(totalAmount * 100);
  const count = participants.length;
  const result = [];

  switch (splitMethod) {
    case 'EQUAL': {
      const baseSharePaise = Math.floor(totalPaise / count);
      let remainderPaise = totalPaise % count;

      for (let i = 0; i < count; i++) {
        // Distribute remainder 1 paise each to first few members
        const sharePaise = baseSharePaise + (i < remainderPaise ? 1 : 0);
        result.push({
          user: participants[i].user || participants[i],
          amount: sharePaise / 100,
          percentage: Number(((sharePaise / totalPaise) * 100).toFixed(2)),
        });
      }
      break;
    }

    case 'EXACT': {
      let sumPaise = 0;
      for (const p of participants) {
        const amt = Number(p.amount) || 0;
        const amtPaise = Math.round(amt * 100);
        sumPaise += amtPaise;
        result.push({
          user: p.user,
          amount: amtPaise / 100,
          percentage: Number(((amtPaise / totalPaise) * 100).toFixed(2)),
        });
      }

      if (sumPaise !== totalPaise) {
        const diff = (totalPaise - sumPaise) / 100;
        throw new Error(
          `Sum of split amounts (₹${(sumPaise / 100).toFixed(2)}) does not match total expense (₹${(totalPaise / 100).toFixed(2)}). Difference: ₹${diff.toFixed(2)}`
        );
      }
      break;
    }

    case 'PERCENTAGE': {
      let sumPercent = 0;
      let calculatedPaiseSum = 0;
      const tempSplits = [];

      for (const p of participants) {
        const pct = Number(p.percentage) || 0;
        sumPercent += pct;
        const sharePaise = Math.round((pct / 100) * totalPaise);
        calculatedPaiseSum += sharePaise;
        tempSplits.push({
          user: p.user,
          percentage: pct,
          paise: sharePaise,
        });
      }

      if (Math.abs(sumPercent - 100) > 0.01) {
        throw new Error(`Total percentage must equal 100%. Current sum: ${sumPercent.toFixed(2)}%`);
      }

      // Reconcile any rounding paise difference with the largest share
      const diff = totalPaise - calculatedPaiseSum;
      if (diff !== 0 && tempSplits.length > 0) {
        tempSplits[0].paise += diff;
      }

      for (const item of tempSplits) {
        result.push({
          user: item.user,
          amount: item.paise / 100,
          percentage: item.percentage,
        });
      }
      break;
    }

    default:
      throw new Error(`Invalid split method: ${splitMethod}`);
  }

  return result;
}

module.exports = {
  calculateSplits,
};
