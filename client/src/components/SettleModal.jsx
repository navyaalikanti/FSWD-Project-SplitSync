import { useState, useEffect, useContext } from 'react';
import { X, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const SettleModal = ({ isOpen, onClose, onSettlementRecorded, prefill = null, groups = [] }) => {
  const { user } = useContext(AuthContext);

  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [payerId, setPayerId] = useState('');
  const [receiverId, setReceiverId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('Payment via UPI');
  const [availableMembers, setAvailableMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (prefill) {
      if (prefill.group?._id) setSelectedGroupId(prefill.group._id);
      if (prefill.from?._id) setPayerId(prefill.from._id);
      if (prefill.to?._id) setReceiverId(prefill.to._id);
      if (prefill.amount) setAmount(prefill.amount.toString());
    } else if (groups.length > 0 && !selectedGroupId) {
      setSelectedGroupId(groups[0]._id);
      setPayerId(user?._id || '');
    }
  }, [prefill, groups, user?._id]);

  useEffect(() => {
    if (!selectedGroupId || groups.length === 0) return;
    const g = groups.find((item) => item._id === selectedGroupId);
    if (g && g.members) {
      const mems = g.members.map((m) => m.user || m);
      setAvailableMembers(mems);
      if (!payerId) setPayerId(user?._id || mems[0]?._id);
      if (!receiverId && mems.length > 1) {
        setReceiverId(mems.find((m) => m._id !== user?._id)?._id || mems[1]?._id);
      }
    }
  }, [selectedGroupId, groups]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid settlement amount');
      return;
    }
    if (!selectedGroupId) {
      setError('Please select a group');
      return;
    }
    if (!payerId || !receiverId) {
      setError('Please select both payer and receiver');
      return;
    }
    if (payerId === receiverId) {
      setError('Payer and receiver cannot be the same member');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('/settlements', {
        group: selectedGroupId,
        payer: payerId,
        receiver: receiverId,
        amount: numAmount,
        date,
        notes: notes.trim(),
      });

      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#E60023', '#C8001A', '#10B981'],
        });
      } catch (e) {
        // Ignore if canvas unavailable
      }

      onSettlementRecorded && onSettlementRecorded(res.data);
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record settlement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#FEE8EB] w-full max-w-md overflow-hidden">
        <div className="px-6 py-5 border-b border-[#FEE8EB] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#111111]">Record Settlement</h2>
              <p className="text-xs text-[#767676]">Log a completed payment between members</p>
            </div>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
              {groups.map((g) => (
                <option key={g._id} value={g._id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 rounded-2xl bg-[#FFF5F6] border border-[#FEE8EB] space-y-3">
            <div className="grid grid-cols-5 items-center gap-2">
              <div className="col-span-2">
                <label className="block text-[11px] font-bold text-[#767676] uppercase mb-1">
                  Paid By
                </label>
                <select
                  value={payerId}
                  onChange={(e) => setPayerId(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-[#FCD5DA] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#E60023] bg-white"
                >
                  {availableMembers.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} {m._id === user?._id ? '(You)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-center text-[#E60023] pt-4">
                <ArrowRight className="w-5 h-5" />
              </div>

              <div className="col-span-2">
                <label className="block text-[11px] font-bold text-[#767676] uppercase mb-1">
                  Received By
                </label>
                <select
                  value={receiverId}
                  onChange={(e) => setReceiverId(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-[#FCD5DA] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#E60023] bg-white"
                >
                  {availableMembers.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} {m._id === user?._id ? '(You)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1.5">
              Settlement Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-emerald-600 text-base">
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-[#FCD5DA] text-base font-bold text-[#111111] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#FCD5DA] text-xs focus:outline-none focus:ring-2 focus:ring-[#E60023] bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1.5">
                Note / Method
              </label>
              <input
                type="text"
                placeholder="e.g. GPay, Cash, Bank"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#FCD5DA] text-xs focus:outline-none focus:ring-2 focus:ring-[#E60023]"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#767676] hover:text-[#111111] hover:bg-[#EFEFEF] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
            >
              {isLoading ? 'Recording...' : 'Record Settle Up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettleModal;
