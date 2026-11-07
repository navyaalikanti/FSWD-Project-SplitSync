import { useState } from 'react';
import { X, AlertCircle, Users, Tag, Sparkles } from 'lucide-react';
import api from '../services/api';

const CATEGORIES = ['Trip', 'Roommates', 'College', 'Food', 'Household', 'Other'];
const THEME_COLORS = ['#E60023', '#C8001A', '#AD081B', '#E11D48', '#8B5CF6', '#10B981'];

const CreateGroupModal = ({ isOpen, onClose, onGroupCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Trip');
  const [color, setColor] = useState('#E60023');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please provide a group name');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('/groups', {
        name: name.trim(),
        description: description.trim(),
        category,
        color,
      });

      onGroupCreated && onGroupCreated(res.data);
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create group');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#FEE8EB] w-full max-w-md overflow-hidden">
        <div className="px-6 py-5 border-b border-[#FEE8EB] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#111111]">Create New Group</h2>
            <p className="text-xs text-[#767676]">Organize expenses with friends or housemates</p>
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
              Group Name
            </label>
            <input
              type="text"
              placeholder="e.g. Manali Trek, Flat 304, Hackathon"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#FCD5DA] text-sm focus:outline-none focus:ring-2 focus:ring-[#E60023]"
              required
            />
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

          <div>
            <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows="2"
              placeholder="What is this group for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[#FCD5DA] text-sm focus:outline-none focus:ring-2 focus:ring-[#E60023]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-1.5">
              Theme Accent
            </label>
            <div className="flex items-center gap-3">
              {THEME_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-offset-2 ring-[#E60023]' : 'hover:scale-110'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3">
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
              {isLoading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
