import { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Plus,
  Scale,
  Calendar,
  DollarSign,
  Copy,
  Check,
  Trash2,
  Edit,
  ArrowRight,
  Clock,
  Sparkles,
  ArrowLeft,
  Share2,
  CheckCircle2,
  LogOut,
  Tag,
  AlertCircle,
} from 'lucide-react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import AddExpenseModal from '../components/AddExpenseModal';
import SettleModal from '../components/SettleModal';

const GroupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { joinGroup, leaveGroup, lastLiveEvent } = useContext(SocketContext);

  const [groupData, setGroupData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedCode, setCopiedCode] = useState(false);
  const [error, setError] = useState('');

  // Modals
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isSettleOpen, setIsSettleOpen] = useState(false);
  const [settlePrefill, setSettlePrefill] = useState(null);

  const fetchGroupDetails = useCallback(async () => {
    try {
      const res = await api.get(`/groups/${id}`);
      setGroupData(res.data);
    } catch (err) {
      console.error('Error loading group:', err);
      setError(err.response?.data?.message || 'Failed to load group details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchGroupDetails();
    joinGroup(id);

    return () => {
      leaveGroup(id);
    };
  }, [id, joinGroup, leaveGroup, fetchGroupDetails]);

  useEffect(() => {
    if (lastLiveEvent && lastLiveEvent.data?.groupId === id) {
      fetchGroupDetails();
    }
  }, [lastLiveEvent, id, fetchGroupDetails]);

  const handleCopyCode = () => {
    if (groupData?.group?.inviteCode) {
      navigator.clipboard.writeText(groupData.group.inviteCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await api.delete(`/expenses/${expenseId}`);
      fetchGroupDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete expense');
    }
  };

  const handleLeaveGroup = async () => {
    if (!window.confirm('Are you sure you want to leave this group?')) return;
    try {
      await api.post(`/groups/${id}/leave`);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Cannot leave group with an active balance');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-[#FEE8EB] border-t-[#E60023] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !groupData) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
        <h2 className="text-lg font-bold text-[#111111]">Unable to View Group</h2>
        <p className="text-xs text-[#767676] mt-1 mb-4">{error || 'Group not found'}</p>
        <Link
          to="/dashboard"
          className="px-5 py-2.5 rounded-xl bg-[#E60023] text-white font-bold text-xs"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const { group, expenses, settlements, activities, netBalances, simplifiedDebts, totalExpense } = groupData;
  const myNet = netBalances.find((b) => b.user._id === user?._id);

  return (
    <div className="min-h-screen bg-[#FAF9F8] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Back button */}
      <div className="flex items-center gap-2">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#767676] hover:text-[#E60023] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </Link>
        <span className="text-[#767676] text-xs">/</span>
        <span className="text-xs font-bold text-[#111111]">{group.name}</span>
      </div>

      {/* Group Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FEE8EB] shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl shadow-md shrink-0"
              style={{ backgroundColor: group.color || '#E60023' }}
            >
              {group.name.charAt(0)}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
                  {group.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFF5F6] text-[#C8001A] border border-[#FCD5DA]">
                  {group.category}
                </span>
              </div>
              <p className="text-xs text-[#767676] max-w-xl">
                {group.description || 'Collaborative group expenses on SplitSync'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsAddExpenseOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-[#E60023] hover:bg-[#C8001A] shadow-md shadow-[#E60023]/25 transition-all active:scale-98"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Add Expense
            </button>

            <button
              onClick={() => {
                setSettlePrefill({ group });
                setIsSettleOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50 transition-all active:scale-98 shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Settle Up
            </button>

            <div className="flex items-center gap-1 px-3 py-2 rounded-2xl bg-[#FFF5F6] border border-[#FCD5DA] text-xs">
              <span className="text-[#767676]">Code:</span>
              <span className="font-mono font-bold text-[#E60023]">{group.inviteCode}</span>
              <button
                onClick={handleCopyCode}
                className="p-1 hover:text-[#E60023] text-[#767676] transition-colors ml-1"
                title="Copy Invite Code"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[#FEE8EB] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {group.members.map((m) => (
                <img
                  key={m.user._id}
                  src={m.user.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${m.user.name}`}
                  alt={m.user.name}
                  title={`${m.user.name} (${m.role})`}
                  className="w-8 h-8 rounded-full border-2 border-white bg-[#FEE8EB] object-cover"
                />
              ))}
            </div>
            <span className="text-xs font-medium text-[#767676]">
              {group.members.length} member{group.members.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-[#767676]">Total Group Spend: </span>
              <span className="font-extrabold text-[#111111]">₹{totalExpense.toFixed(2)}</span>
            </div>
            <div className="h-4 w-px bg-[#FCD5DA]" />
            <div>
              <span className="text-[#767676]">Your Balance: </span>
              <span className={`font-extrabold ${
                myNet?.netBalance > 0
                  ? 'text-emerald-600'
                  : myNet?.netBalance < 0
                  ? 'text-rose-600'
                  : 'text-gray-700'
              }`}>
                {myNet?.netBalance > 0 ? '+' : ''}₹{myNet?.netBalance?.toFixed(2) || '0.00'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#FEE8EB] flex overflow-x-auto gap-2 text-xs font-bold no-scrollbar">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'expenses', label: `Expenses (${expenses.length})` },
          { id: 'members', label: `Members & Balances (${group.members.length})` },
          { id: 'settlements', label: `Debt Engine & Settlements (${simplifiedDebts.length})` },
          { id: 'activity', label: 'Activity Feed' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 px-4 border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-[#E60023] text-[#E60023]'
                : 'border-transparent text-[#767676] hover:text-[#111111]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-[#FEE8EB] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#111111] flex items-center gap-2">
                  <Scale className="w-4 h-4 text-[#E60023]" />
                  Suggested Settlements
                </h3>
                <span className="text-[11px] font-semibold text-[#767676]">
                  Calculated by Debt Simplifier
                </span>
              </div>

              {simplifiedDebts.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#767676]">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  All balances in this group are completely settled!
                </div>
              ) : (
                <div className="space-y-2.5">
                  {simplifiedDebts.map((debt, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-[#FAF9F8] border border-[#FEE8EB] flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={debt.from.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${debt.from.name}`}
                          alt={debt.from.name}
                          className="w-8 h-8 rounded-full bg-[#FEE8EB]"
                        />
                        <div className="text-xs">
                          <p className="font-bold text-[#111111]">
                            {debt.from.name} <span className="font-normal text-[#767676]">pays</span> {debt.to.name}
                          </p>
                          <p className="text-[10px] text-[#767676]">Direct settlement recommendation</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm font-extrabold text-[#111111]">
                          ₹{debt.amount.toFixed(2)}
                        </span>
                        <button
                          onClick={() => {
                            setSettlePrefill({ group, from: debt.from, to: debt.to, amount: debt.amount });
                            setIsSettleOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-white border border-[#FCD5DA] text-[#E60023] text-xs font-bold hover:bg-[#FFF5F6] transition-colors"
                        >
                          Settle
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl p-6 border border-[#FEE8EB] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#111111]">Latest Expenses</h3>
                <button
                  onClick={() => setActiveTab('expenses')}
                  className="text-xs font-bold text-[#E60023] hover:underline"
                >
                  View All ({expenses.length})
                </button>
              </div>

              <div className="divide-y divide-[#FEE8EB]">
                {expenses.slice(0, 5).map((exp) => (
                  <div key={exp._id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-[#111111]">{exp.title}</p>
                      <p className="text-[10px] text-[#767676]">
                        Paid by {exp.paidBy?.name} • {new Date(exp.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <span className="font-extrabold text-[#111111]">₹{exp.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="md:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-[#FEE8EB] shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-[#111111]">Member Balances</h3>
              <div className="space-y-3">
                {netBalances.map((nb) => (
                  <div key={nb.user._id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <img
                        src={nb.user.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${nb.user.name}`}
                        alt={nb.user.name}
                        className="w-7 h-7 rounded-full bg-[#FEE8EB]"
                      />
                      <span className="font-semibold text-[#111111]">
                        {nb.user.name} {nb.user._id === user?._id ? '(You)' : ''}
                      </span>
                    </div>
                    <span className={`font-bold ${
                      nb.netBalance > 0
                        ? 'text-emerald-600'
                        : nb.netBalance < 0
                        ? 'text-rose-600'
                        : 'text-gray-500'
                    }`}>
                      {nb.netBalance > 0 ? `+₹${nb.netBalance}` : nb.netBalance < 0 ? `-₹${Math.abs(nb.netBalance)}` : 'Settled'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-3xl bg-white border border-[#FEE8EB] text-center">
              <button
                onClick={handleLeaveGroup}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline flex items-center justify-center gap-1.5 mx-auto"
              >
                <LogOut className="w-3.5 h-3.5" />
                Leave Group
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Expenses */}
      {activeTab === 'expenses' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FEE8EB] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#111111]">All Group Expenses</h3>
              <p className="text-xs text-[#767676]">Detailed history of group transactions and individual splits</p>
            </div>
            <button
              onClick={() => setIsAddExpenseOpen(true)}
              className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#E60023] hover:bg-[#C8001A] shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Add Expense
            </button>
          </div>

          <div className="divide-y divide-[#FEE8EB]">
            {expenses.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#767676]">
                No expenses logged in this group yet. Click "+ Add Expense" to begin.
              </div>
            ) : (
              expenses.map((exp) => (
                <div key={exp._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#FFF5F6] text-[#E60023] flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                      {exp.category?.charAt(0) || 'E'}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-[#111111]">{exp.title}</p>
                      <p className="text-xs text-[#767676]">
                        Paid ₹{exp.amount.toFixed(2)} by <span className="font-semibold text-[#111111]">{exp.paidBy?.name}</span> • Split {exp.splitMethod.toLowerCase()} among {exp.participants?.length} members
                      </p>
                      {exp.notes && (
                        <p className="text-[11px] text-[#E60023] italic">"{exp.notes}"</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-right">
                      <p className="text-base font-extrabold text-[#111111]">₹{exp.amount.toFixed(2)}</p>
                      <p className="text-[10px] text-[#767676]">
                        {new Date(exp.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteExpense(exp._id)}
                      className="p-2 rounded-xl text-[#767676] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Expense"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Members */}
      {activeTab === 'members' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FEE8EB] shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-[#111111]">Group Members & Balances</h3>
            <p className="text-xs text-[#767676]">Calculated net status for every participant</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {netBalances.map((nb) => (
              <div
                key={nb.user._id}
                className="p-5 rounded-3xl bg-[#FAF9F8] border border-[#FEE8EB] space-y-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={nb.user.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${nb.user.name}`}
                    alt={nb.user.name}
                    className="w-12 h-12 rounded-full bg-[#FEE8EB] border-2 border-white shadow-xs"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-[#111111]">
                      {nb.user.name} {nb.user._id === user?._id ? '(You)' : ''}
                    </h4>
                    <p className="text-[11px] text-[#767676]">{nb.user.email}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#FEE8EB] flex items-center justify-between">
                  <span className="text-xs text-[#767676]">Net Position:</span>
                  <span className={`text-sm font-extrabold ${
                    nb.netBalance > 0
                      ? 'text-emerald-600'
                      : nb.netBalance < 0
                      ? 'text-rose-600'
                      : 'text-gray-700'
                  }`}>
                    {nb.netBalance > 0 ? `Is owed ₹${nb.netBalance}` : nb.netBalance < 0 ? `Owes ₹${Math.abs(nb.netBalance)}` : 'Settled (₹0.00)'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Settlements */}
      {activeTab === 'settlements' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FEE8EB] shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#E60023]" />
              <h3 className="text-base font-bold text-[#111111]">
                Debt-Simplification Engine
              </h3>
            </div>
            <p className="text-xs text-[#767676] leading-relaxed">
              Instead of everyone paying everyone back and creating dozens of messy transactions, SplitSync executes a Min-Cash-Flow graph algorithm to minimize payments. Below are the optimal recommended transactions to bring all balances to exactly zero.
            </p>

            <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {simplifiedDebts.length === 0 ? (
                <div className="col-span-2 py-6 text-center text-xs text-emerald-600 font-bold bg-emerald-50 rounded-2xl">
                  ✨ No outstanding debts! Everything is settled.
                </div>
              ) : (
                simplifiedDebts.map((debt, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[#FAF9F8] border border-[#FEE8EB] flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-[#111111]">
                        <span>{debt.from.name}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#E60023]" />
                        <span>{debt.to.name}</span>
                      </div>
                      <p className="text-[11px] text-[#767676] mt-1">Suggested Direct Payment</p>
                    </div>

                    <div className="text-right">
                      <p className="text-base font-extrabold text-[#111111]">₹{debt.amount.toFixed(2)}</p>
                      <button
                        onClick={() => {
                          setSettlePrefill({ group, from: debt.from, to: debt.to, amount: debt.amount });
                          setIsSettleOpen(true);
                        }}
                        className="text-xs font-bold text-[#E60023] hover:underline mt-1"
                      >
                        Record Payment
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FEE8EB] shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#111111]">Settlement History Ledger</h3>
            <div className="divide-y divide-[#FEE8EB]">
              {settlements.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#767676]">
                  No past settlements recorded yet.
                </div>
              ) : (
                settlements.map((s) => (
                  <div key={s._id} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      <div>
                        <p className="font-bold text-[#111111]">
                          {s.payer?.name} paid {s.receiver?.name}
                        </p>
                        <p className="text-[10px] text-[#767676]">
                          {s.notes || 'Repayment'} • {new Date(s.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <span className="font-extrabold text-emerald-600 text-sm">
                      ₹{s.amount.toFixed(2)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Activity */}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FEE8EB] shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#111111]">Group Activity Timeline</h3>
          <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#FEE8EB]">
            {activities.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#767676]">
                No recorded activities yet.
              </div>
            ) : (
              activities.map((act) => (
                <div key={act._id} className="flex items-start gap-4 text-xs pl-1">
                  <div className="w-5 h-5 rounded-full bg-[#E60023] text-white flex items-center justify-center text-[10px] shrink-0 ring-4 ring-white z-10">
                    •
                  </div>
                  <div className="bg-[#FAF9F8] p-3 rounded-2xl border border-[#FEE8EB] flex-1">
                    <p className="font-semibold text-[#111111]">{act.description}</p>
                    <p className="text-[10px] text-[#767676] mt-1">
                      {new Date(act.createdAt).toLocaleString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        onExpenseAdded={fetchGroupDetails}
        defaultGroupId={group._id}
        preloadedGroups={[group]}
      />

      <SettleModal
        isOpen={isSettleOpen}
        onClose={() => {
          setIsSettleOpen(false);
          setSettlePrefill(null);
        }}
        onSettlementRecorded={fetchGroupDetails}
        prefill={settlePrefill}
        groups={[group]}
      />
    </div>
  );
};

export default GroupDetails;
