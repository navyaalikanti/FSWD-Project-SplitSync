const { calculateSplits } = require('../utils/splitEngine');
const { calculateGroupBalances } = require('../utils/debtSimplifier');

describe('SplitSync Engines Test Suite', () => {
  // 1. Equal Split Test
  console.log('Test 1: Equal Split with paise remainder distribution...');
  const equalRes = calculateSplits(900, 'EQUAL', ['u1', 'u2', 'u3']);
  if (equalRes[0].amount !== 300 || equalRes[1].amount !== 300 || equalRes[2].amount !== 300) {
    throw new Error('Equal split calculation mismatch');
  }

  // 2. Odd Remainder Paise Test (100 / 3 = 33.34, 33.33, 33.33)
  console.log('Test 2: Odd remainder 100/3 paise distribution...');
  const oddRes = calculateSplits(100, 'EQUAL', ['u1', 'u2', 'u3']);
  const sumOdd = oddRes.reduce((acc, curr) => acc + curr.amount, 0);
  if (Math.round(sumOdd * 100) !== 10000) {
    throw new Error('Paise remainder rounding mismatch');
  }

  // 3. Exact Split Test
  console.log('Test 3: Exact Split validation...');
  const exactRes = calculateSplits(500, 'EXACT', [
    { user: 'u1', amount: 200 },
    { user: 'u2', amount: 300 },
  ]);
  if (exactRes.reduce((a, b) => a + b.amount, 0) !== 500) {
    throw new Error('Exact split total mismatch');
  }

  // 4. Percentage Split Test
  console.log('Test 4: Percentage Split (60% / 40%)...');
  const pctRes = calculateSplits(1000, 'PERCENTAGE', [
    { user: 'u1', percentage: 60 },
    { user: 'u2', percentage: 40 },
  ]);
  if (pctRes[0].amount !== 600 || pctRes[1].amount !== 400) {
    throw new Error('Percentage split amounts mismatch');
  }

  // 5. Debt Simplification Engine Test
  console.log('Test 5: Transitive Debt Simplification...');
  const members = [
    { user: { _id: 'A', name: 'Alice' } },
    { user: { _id: 'B', name: 'Bob' } },
    { user: { _id: 'C', name: 'Charlie' } },
  ];
  // A pays 900 for A, B, C (300 each)
  const expenses = [
    {
      paidBy: { _id: 'A' },
      amount: 900,
      participants: [
        { user: { _id: 'A' }, amount: 300 },
        { user: { _id: 'B' }, amount: 300 },
        { user: { _id: 'C' }, amount: 300 },
      ],
    },
  ];
  const { simplifiedDebts } = calculateGroupBalances(members, expenses, []);
  if (simplifiedDebts.length !== 2) {
    throw new Error('Debt simplification should yield exactly 2 payments to Alice');
  }

  console.log('\n[PASS] All SplitSync Engine and Calculation Tests Passed Successfully!');
});
function describe(name, fn) {
  console.log(`\n=== Running: ${name} ===`);
  fn();
}
