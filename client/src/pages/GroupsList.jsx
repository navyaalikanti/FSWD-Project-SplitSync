import { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus, KeyRound, ArrowRight, Tag, Sparkles } from 'lucide-react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import CreateGroupModal from '../components/CreateGroupModal';
import JoinGroupModal from '../components/JoinGroupModal';

const GroupsList = () => {
  const { user } = useContext(AuthContext);
  const { lastLiveEvent } = useContext(SocketContext);

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);

  const fetchGroups = useCallback(async () => {
    try {
      const res = await api.get('/groups');
      setGroups(res.data);
    } catch (err) {
      console.error('Error fetching groups:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  useEffect(() => {
    if (lastLiveEvent) {
      fetchGroups();
    }
  }, [lastLiveEvent, fetchGroups]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-[#FEE8EB] border-t-[#E60023] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F8] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
            My Groups
          </h1>
          <p className="text-xs text-[#767676] mt-0.5">
            Manage your shared expense circles for trips, apartments, and teams
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsJoinOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-semibold bg-white text-[#111111] border border-[#EFEFEF] hover:bg-[#EFEFEF] transition-all shadow-xs"
          >
            <KeyRound className="w-4 h-4 text-[#E60023]" />
            Join with Code
          </button>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-[#E60023] hover:bg-[#C8001A] shadow-md shadow-[#E60023]/25 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Create Group
          </button>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#FEE8EB] shadow-xs max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FFF5F6] text-[#E60023] flex items-center justify-center mx-auto">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-[#111111]">No Groups Yet</h3>
          <p className="text-xs text-[#767676] leading-relaxed">
            Create a group for an upcoming trip or roommates, or join an existing group using an invitation code.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-[#E60023] hover:bg-[#C8001A] text-white font-bold text-xs shadow-md shadow-[#E60023]/25 transition-all"
            >
              Create First Group
            </button>
            <button
              onClick={() => setIsJoinOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-white border border-[#EFEFEF] text-[#111111] font-semibold text-xs hover:bg-[#EFEFEF] transition-all"
            >
              Enter Invite Code
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {groups.map((g) => (
            <Link
              key={g._id}
              to={`/groups/${g._id}`}
              className="bg-white rounded-3xl p-6 border border-[#FEE8EB] shadow-xs hover:border-[#E60023]/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl shadow-xs group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: g.color || '#E60023' }}
                  >
                    {g.name.charAt(0)}
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF5F6] text-[#C8001A] border border-[#FEE8EB]">
                    {g.category}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#111111] group-hover:text-[#E60023] transition-colors">
                    {g.name}
                  </h3>
                  <p className="text-xs text-[#767676] line-clamp-2 mt-1">
                    {g.description || 'No description provided'}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <div className="flex -space-x-1.5">
                    {g.members?.slice(0, 4).map((m) => (
                      <img
                        key={m.user?._id || Math.random()}
                        src={m.user?.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${m.user?.name || 'Member'}`}
                        alt={m.user?.name}
                        className="w-6 h-6 rounded-full border border-white bg-[#FEE8EB] object-cover"
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-[#767676]">
                    {g.members?.length} members
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[#FEE8EB] flex items-center justify-between text-xs">
                <div>
                  <p className="text-[10px] font-bold text-[#767676] uppercase">Your Balance</p>
                  <p className={`font-extrabold ${
                    g.userNetBalance > 0
                      ? 'text-emerald-600'
                      : g.userNetBalance < 0
                      ? 'text-rose-600'
                      : 'text-gray-600'
                  }`}>
                    {g.userNetBalance > 0 ? `+₹${g.userNetBalance}` : g.userNetBalance < 0 ? `-₹${Math.abs(g.userNetBalance)}` : 'Settled'}
                  </p>
                </div>

                <span className="inline-flex items-center gap-1 font-bold text-[#E60023] group-hover:translate-x-1 transition-transform">
                  View <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateGroupModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onGroupCreated={fetchGroups}
      />

      <JoinGroupModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
        onGroupJoined={fetchGroups}
      />
    </div>
  );
};

export default GroupsList;
