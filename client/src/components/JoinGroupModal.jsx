import { useState } from 'react';
import { X, AlertCircle, KeyRound, Sparkles } from 'lucide-react';
import api from '../services/api';

const JoinGroupModal = ({ isOpen, onClose, onGroupJoined }) => {
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!inviteCode.trim()) {
      setError('Please enter a 6-character invitation code');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('/groups/join', {
        inviteCode: inviteCode.trim().toUpperCase(),
      });

      onGroupJoined && onGroupJoined(res.data);
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid invite code or unable to join');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setInviteCode('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#FEE8EB] w-full max-w-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-[#FEE8EB] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#FEE8EB] text-[#E60023]">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#111111]">Join with Code</h2>
              <p className="text-xs text-[#767676]">Enter 6-digit invite code</p>
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
            <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-2">
              Invitation Code
            </label>
            <input
              type="text"
              maxLength="8"
              placeholder="e.g. GOA202"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 text-center text-xl font-mono font-bold tracking-widest uppercase rounded-xl border-2 border-[#FCD5DA] focus:outline-none focus:border-[#E60023] bg-[#FFF5F6]"
              required
            />
            <p className="text-[11px] text-[#767676] mt-1.5 text-center">
              Ask your group admin or friend for the 6-character code
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
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
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-[#E60023] hover:bg-[#C8001A] shadow-md shadow-[#E60023]/25 transition-all disabled:opacity-50"
            >
              {isLoading ? 'Joining...' : 'Join Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinGroupModal;
