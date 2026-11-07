import { useState, useEffect, useContext } from 'react';
import { X, Check, AlertCircle, Users, DollarSign, Calendar, Tag, FileText } from 'lucide-react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const CATEGORIES = [
  'Food & Drink',
  'Travel',
  'Accommodation',
  'Shopping',
  'Entertainment',
  'Utilities',
  'Other',
];

const AddExpenseModal = ({ isOpen, onClose, onExpenseAdded, defaultGroupId = null, preloadedGroups = [] }) => {
  const { user } = useContext(AuthContext);

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food & Drink');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [groups, setGroups] = useState(preloadedGroups);
  const [selectedGroupId, setSelectedGroupId] = useState(defaultGroupId || '');
  const [paidBy, setPaidBy] = useState(user?._id || '');
  const [splitMethod, setSplitMethod] = useState('EQUAL');

  const [participants, setParticipants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (preloadedGroups.length > 0) {
      setGroups(preloadedGroups);
      if (!selectedGroupId && preloadedGroups[0]) {
        setSelectedGroupId(preloadedGroups[0]._id);
      }
    } else if (isOpen) {
      api.get('/groups')
        .then((res) => {
          setGroups(res.data);
          if (res.data.length > 0 && !selectedGroupId) {
            setSelectedGroupId(res.data[0]._id);
          }
        })
        .catch((err) => console.error('Error fetching groups for modal:', err));
    }
  }, [isOpen, preloadedGroups]);

  useEffect(() => {
    if (!selectedGroupId || groups.length === 0) return;
    const currentGroup = groups.find((g) => g._id === selectedGroupId);
    if (currentGroup && currentGroup.members) {
      const members = currentGroup.members.map((m) => m.user || m);
      setPaidBy((prev) => (members.some((m) => m._id === prev) ? prev : user?._id || members[0]?._id));

      const equalPct = members.length > 0 ? Number((100 / members.length).toFixed(2)) : 0;
      setParticipants(
        members.map((m) => ({
          user: m,
          isIncluded: true,
          customAmount: '',
          percentage: equalPct,
        }))
      );
    }
  }, [selectedGroupId, groups, user?._id]);

  const parsedAmount = Number(amount) || 0;
  const includedParticipants = participants.filter((p) => p.isIncluded);
  const includedCount = includedParticipants.length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please provide an expense title');
      return;
    }
    if (parsedAmount <= 0) {
      setError('Please enter a valid amount greater than ₹0');
      return;
    }
    if (!selectedGroupId) {
      setError('Please select a group');
      return;
    }
    if (includedCount === 0) {
      setError('At least one member must be included in the split');
      return;
    }

    let payloadParticipants = [];

    if (splitMethod === 'EQUAL') {
      payloadParticipants = includedParticipants.map((p) => ({
        user: p.user._id,
      }));
    } else if (splitMethod === 'EXACT') {
      let sumCustom = 0;
      payloadParticipants = includedParticipants.map((p) => {
        const amt = Number(p.customAmount) || 0;
        sumCustom += amt;
        return { user: p.user._id, amount: amt };
      });

      if (Math.abs(sumCustom - parsedAmount) > 0.05) {
        setError(
          `Sum of shares (₹${sumCustom.toFixed(2)}) must equal total amount (₹${parsedAmount.toFixed(2)})`
        );
        return;
      }
    } else if (splitMethod === 'PERCENTAGE') {
      let sumPct = 0;
      payloadParticipants = includedParticipants.map((p) => {
        const pct = Number(p.percentage) || 0;
        sumPct += pct;
        return { user: p.user._id, percentage: pct };
      });

      if (Math.abs(sumPct - 100) > 0.05) {
        setError(`Total percentage must equal 100%. Current sum: ${sumPct.toFixed(2)}%`);
        return;
      }
    }

    setIsLoading(true);
    try {
      const res = await api.post('/expenses', {
        title: title.trim(),
        amount: parsedAmount,
        category,
        date,
        notes: notes.trim(),
        group: selectedGroupId,
        paidBy,
        splitMethod,
        participants: payloadParticipants,
      });

      onExpenseAdded && onExpenseAdded(res.data);
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record expense. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setAmount('');
    setNotes('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#FEE8EB] w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-5 border-b border-[#FEE8EB] flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div>
            <h2 className="text-lg font-bold text-[#111111]">Add New Expense</h2>
            <p className="text-xs text-[#767676]">Record a shared cost and auto-split with members</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-[#767676] hover:text-[#111111] hover:bg-[#EFEFEF] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-100 flex items-center gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1.5">
                Group
              </label>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#FCD5DA] text-sm focus:outline-none focus:ring-2 focus:ring-[#E60023] bg-white"
                required
              >
                {groups.length === 0 && <option value="">No groups available</option>}
                {groups.map((g) => (
                  <option key={g._id} value={g._id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1.5">
                Expense Title
              </label>
              <input
                type="text"
                placeholder="e.g. Dinner, Uber, Groceries"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#FCD5DA] text-sm focus:outline-none focus:ring-2 focus:ring-[#E60023]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1.5">
                Total Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-[#E60023] text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-[#FCD5DA] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#E60023]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#FCD5DA] text-sm focus:outline-none focus:ring-2 focus:ring-[#E60023] bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1.5">
                Paid By
              </label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#FCD5DA] text-sm focus:outline-none focus:ring-2 focus:ring-[#E60023] bg-white"
              >
                {participants.map((p) => (
                  <option key={p.user._id} value={p.user._id}>
                    {p.user.name} {p.user._id === user?._id ? '(You)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#FCD5DA] text-sm focus:outline-none focus:ring-2 focus:ring-[#E60023] bg-white"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                Split Method
              </label>
              <span className="text-xs text-[#767676]">
                {includedCount} member{includedCount === 1 ? '' : 's'} included
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-[#FFF5F6] border border-[#FEE8EB] text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSplitMethod('EQUAL')}
                className={`py-2 rounded-xl transition-all ${
                  splitMethod === 'EQUAL'
                    ? 'bg-white text-[#E60023] shadow-xs'
                    : 'text-[#767676] hover:text-[#111111]'
                }`}
              >
                Equally (=)
              </button>
              <button
                type="button"
                onClick={() => setSplitMethod('EXACT')}
                className={`py-2 rounded-xl transition-all ${
                  splitMethod === 'EXACT'
                    ? 'bg-white text-[#E60023] shadow-xs'
                    : 'text-[#767676] hover:text-[#111111]'
                }`}
              >
                Exact (₹)
              </button>
              <button
                type="button"
                onClick={() => setSplitMethod('PERCENTAGE')}
                className={`py-2 rounded-xl transition-all ${
                  splitMethod === 'PERCENTAGE'
                    ? 'bg-white text-[#E60023] shadow-xs'
                    : 'text-[#767676] hover:text-[#111111]'
                }`}
              >
                Percent (%)
              </button>
            </div>
          </div>

          <div className="space-y-2 border border-[#FEE8EB] rounded-2xl p-3 bg-[#FAF9F8] max-h-48 overflow-y-auto">
            {participants.map((p, idx) => {
              const equalShare = includedCount > 0 ? (parsedAmount / includedCount).toFixed(2) : 0;

              return (
                <div
                  key={p.user._id}
                  className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#FEE8EB] text-xs"
                >
                  <label className="flex items-center gap-2 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={p.isIncluded}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setParticipants((prev) =>
                          prev.map((item, i) =>
                            i === idx ? { ...item, isIncluded: checked } : item
                          )
                        );
                      }}
                      className="w-4 h-4 text-[#E60023] rounded border-[#FCD5DA] focus:ring-[#E60023]"
                    />
                    <img
                      src={p.user.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${p.user.name}`}
                      alt={p.user.name}
                      className="w-6 h-6 rounded-full bg-[#FEE8EB]"
                    />
                    <span className="font-semibold text-[#111111] truncate">
                      {p.user.name} {p.user._id === user?._id ? '(You)' : ''}
                    </span>
                  </label>

                  {p.isIncluded && (
                    <div className="w-28 text-right">
                      {splitMethod === 'EQUAL' && (
                        <span className="font-bold text-[#E60023]">
                          ₹{equalShare}
                        </span>
                      )}

                      {splitMethod === 'EXACT' && (
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[#E60023] font-semibold">
                            ₹
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="0"
                            value={p.customAmount}
                            onChange={(e) => {
                              const val = e.target.value;
                              setParticipants((prev) =>
                                prev.map((item, i) =>
                                  i === idx ? { ...item, customAmount: val } : item
                                )
                              );
                            }}
                            className="w-full pl-5 pr-2 py-1 rounded-lg border border-[#FCD5DA] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#E60023] text-right"
                          />
                        </div>
                      )}

                      {splitMethod === 'PERCENTAGE' && (
                        <div className="relative">
                          <input
                            type="number"
                            step="0.1"
                            placeholder="0"
                            value={p.percentage}
                            onChange={(e) => {
                              const val = e.target.value;
                              setParticipants((prev) =>
                                prev.map((item, i) =>
                                  i === idx ? { ...item, percentage: val } : item
                                )
                              );
                            }}
                            className="w-full pr-5 pl-2 py-1 rounded-lg border border-[#FCD5DA] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#E60023] text-right"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[#E60023] font-semibold">
                            %
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1.5">
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Paid via UPI, includes drinks & dessert"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#FCD5DA] text-sm focus:outline-none focus:ring-2 focus:ring-[#E60023]"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[#767676] hover:text-[#111111] hover:bg-[#EFEFEF] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#E60023] hover:bg-[#C8001A] shadow-md shadow-[#E60023]/25 transition-all disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;
