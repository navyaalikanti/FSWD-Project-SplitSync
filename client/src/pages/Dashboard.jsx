import { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Scale,
  Users,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Sparkles,
  PieChart as PieIcon,
  CheckCircle2,
  Tag,
  KeyRound,
  RefreshCw,
  Clock,
  ChevronRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import AddExpenseModal from '../components/AddExpenseModal';
import CreateGroupModal from '../components/CreateGroupModal';
import JoinGroupModal from '../components/JoinGroupModal';
import SettleModal from '../components/SettleModal';

const Dashboard = () => {
  const { user, isDemoMode } = useContext(AuthContext);
  const { lastLiveEvent } = useContext(SocketContext);

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isJoinGroupOpen, setIsJoinGroupOpen] = useState(false);
  const [isSettleOpen, setIsSettleOpen] = useState(false);
  const [settlePrefill, setSettlePrefill] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      const res = await api.get('/analytics/dashboard');
      setStats(res.data);
    } catch (err) {
      console.error('Error loading dashboard analytics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    if (lastLiveEvent) {
      fetchDashboardData();
    }
  }, [lastLiveEvent, fetchDashboardData]);

  const handleOpenSettlePrefill = (debt) => {
    setSettlePrefill(debt);
    setIsSettleOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#FEE8EB] border-t-[#E60023] rounded-full animate-spin" />
          <p className="text-xs font-semibold text-[#767676]">Loading SplitSync Dashboard...</p>
        </div>
      </div>
    );
  }

  const summary = stats?.summary || {
    totalGroupExpenses: 0,
    totalYouOwe: 0,
    totalYouAreOwed: 0,
    netBalance: 0,
    activeGroupsCount: 0,
  };

  const recentExpenses = stats?.recentExpenses || [];
  const recentActivities = stats?.recentActivities || [];
  const simplifiedDebts = stats?.simplifiedDebts || [];
  const groupSummaries = stats?.groupSummaries || [];
  
  // Pinterest Red themed palette for categories
  const pinterestCategoryColors = [
    '#E60023', // Pinterest Red
    '#C8001A', // Deep Red
    '#E11D48', // Crimson Rose
    '#BE185D', // Dark Red
    '#9D174D', // Deep Berry
    '#F43F5E', // Rose
    '#767676', // Slate Gray
  ];

  const categoryData = (stats?.categoryData || []).map((cat, i) => ({
    ...cat,
    color: pinterestCategoryColors[i % pinterestCategoryColors.length],
  }));

  const monthlySpending = stats?.monthlySpending || [];

  return (
    <div className="min-h-screen bg-[#FAF9F8] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
              Hello, {user?.name?.split(' ')[0] || 'Friend'}!
            </h1>
            {isDemoMode && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FEE8EB] text-[#C8001A] border border-[#FCD5DA]">
                <Sparkles className="w-3 h-3 text-[#E60023]" />
                Demo Mode
              </span>
            )}
          </div>
          <p className="text-xs text-[#767676] mt-0.5">
            Here is your live real-time financial balance and group summary.
          </p>
        </div>

        {/* Quick Action Button Pills in Pinterest Style */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-[#E60023] hover:bg-[#C8001A] shadow-md shadow-[#E60023]/25 transition-all active:scale-98"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Add Expense
          </button>

          <button
            onClick={() => {
              setSettlePrefill(null);
              setIsSettleOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50 transition-all active:scale-98 shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Settle Up
          </button>

          <button
            onClick={() => setIsCreateGroupOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-semibold bg-white text-[#111111] border border-[#EFEFEF] hover:bg-[#EFEFEF] transition-all active:scale-98 shadow-xs"
          >
            <Users className="w-4 h-4 text-[#E60023]" />
            New Group
          </button>

          <button
            onClick={() => setIsJoinGroupOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-semibold bg-white text-[#767676] border border-[#EFEFEF] hover:bg-[#EFEFEF] transition-all active:scale-98 shadow-xs"
          >
            <KeyRound className="w-4 h-4 text-[#E60023]" />
            Join Code
          </button>
        </div>
      </div>

      {/* Top 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Expenses */}
        <div className="bg-white p-5 rounded-3xl border border-[#FEE8EB] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#767676] uppercase tracking-wider">
            <span>Total Group Spend</span>
            <div className="w-7 h-7 rounded-xl bg-[#FFF5F6] text-[#E60023] flex items-center justify-center font-bold">
              ₹
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#111111]">
            ₹{summary.totalGroupExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-[#767676]">Across {summary.activeGroupsCount} active groups</p>
        </div>

        {/* You Are Owed */}
        <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-700 uppercase tracking-wider">
            <span>You Are Owed</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">
            +₹{summary.totalYouAreOwed.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-[#767676]">Friends owe you this amount</p>
        </div>

        {/* You Owe */}
        <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-rose-700 uppercase tracking-wider">
            <span>You Owe</span>
            <div className="w-7 h-7 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-600">
            -₹{summary.totalYouOwe.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-[#767676]">Your pending share to pay</p>
        </div>

        {/* Net Balance */}
        <div className="bg-white p-5 rounded-3xl border border-[#FCD5DA] shadow-xs space-y-2 bg-gradient-to-br from-white to-[#FFF5F6]">
          <div className="flex items-center justify-between text-xs font-bold text-[#111111] uppercase tracking-wider">
            <span>Net Balance</span>
            <Scale className="w-4 h-4 text-[#E60023]" />
          </div>
          <div className={`text-2xl font-extrabold ${summary.netBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {summary.netBalance >= 0 ? '+' : ''}₹{summary.netBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              summary.netBalance > 0
                ? 'bg-emerald-100 text-emerald-800'
                : summary.netBalance < 0
                ? 'bg-rose-100 text-rose-800'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {summary.netBalance > 0 ? 'In Credit' : summary.netBalance < 0 ? 'In Debt' : 'Fully Settled'}
            </span>
          </div>
        </div>
      </div>

      {/* Suggested Simplified Settlements Section */}
      {simplifiedDebts.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-[#FEE8EB] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#E60023]" />
                <h3 className="text-sm font-bold text-[#111111]">
                  Debt Simplification Engine Recommendations
                </h3>
              </div>
              <p className="text-xs text-[#767676] mt-0.5">
                Optimized direct transactions to settle all group balances with minimum payments
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FFF5F6] text-[#E60023] border border-[#FCD5DA] self-start sm:self-auto">
              {simplifiedDebts.length} pending settlement{simplifiedDebts.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {simplifiedDebts.map((debt, idx) => {
              const isPayer = debt.from._id === user?._id;
              const isReceiver = debt.to._id === user?._id;

              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl border border-[#FEE8EB] bg-[#FAF9F8] flex items-center justify-between gap-3 hover:border-[#FCD5DA] transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={debt.from.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${debt.from.name}`}
                      alt={debt.from.name}
                      className="w-8 h-8 rounded-full bg-[#FEE8EB] shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#111111] truncate">
                        {isPayer ? 'You owe' : `${debt.from.name} owes`} {isReceiver ? 'you' : debt.to.name}
                      </p>
                      <p className="text-[10px] text-[#767676] truncate">
                        in {debt.group?.name || 'Group'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-extrabold text-[#111111]">
                      ₹{debt.amount.toFixed(2)}
                    </div>
                    <button
                      onClick={() => handleOpenSettlePrefill(debt)}
                      className="text-[11px] font-bold text-[#E60023] hover:text-[#C8001A] hover:underline inline-flex items-center gap-0.5"
                    >
                      Settle <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Charts Section with Pinterest Colors */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Spending Trend Line / Area Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-[#FEE8EB] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-[#111111]">Monthly Spending Trends</h3>
              <p className="text-xs text-[#767676]">Month-wise total group spend vs your personal share</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1.5 rounded-full bg-[#E60023]" />
                Total Expense
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1.5 rounded-full bg-[#C8001A] border-dashed border border-[#C8001A]" />
                Your Share
              </span>
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            {monthlySpending.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-[#767676]">
                No expense data recorded yet to render chart
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlySpending} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E60023" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#E60023" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorYourShare" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FCD5DA" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#FCD5DA" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#FEE8EB" opacity={0.7} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: '#767676' }}
                    axisLine={{ stroke: '#FEE8EB' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#767676' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `₹${val}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      border: '1px solid #FEE8EB',
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)',
                      fontSize: '12px',
                    }}
                    formatter={(val) => [`₹${Number(val).toFixed(2)}`]}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#E60023"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                    name="Total Expense"
                    dot={{ r: 4, stroke: '#E60023', strokeWidth: 2, fill: '#ffffff' }}
                    activeDot={{ r: 6, stroke: '#C8001A', strokeWidth: 2 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="yourShare"
                    stroke="#C8001A"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    fillOpacity={1}
                    fill="url(#colorYourShare)"
                    name="Your Share"
                    dot={{ r: 3, stroke: '#C8001A', strokeWidth: 1.5, fill: '#ffffff' }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-[#FEE8EB] shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[#111111]">Expense Breakdown</h3>
            <p className="text-xs text-[#767676]">By spending categories</p>
          </div>

          <div className="h-44 w-full">
            {categoryData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-[#767676]">
                No categories to display
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      border: '1px solid #FEE8EB',
                      fontSize: '11px',
                    }}
                    formatter={(val) => [`₹${Number(val).toFixed(2)}`]}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="space-y-1.5 max-h-28 overflow-y-auto">
            {categoryData.map((cat, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-[#767676]">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="truncate">{cat.name}</span>
                </span>
                <span className="font-bold text-[#111111]">₹{cat.value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recent Expenses */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-[#FEE8EB] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#111111]">Recent Expenses</h3>
              <p className="text-xs text-[#767676]">Latest charges logged across your groups</p>
            </div>
            <button
              onClick={() => setIsAddExpenseOpen(true)}
              className="text-xs font-bold text-[#E60023] hover:underline"
            >
              + Add Expense
            </button>
          </div>

          <div className="divide-y divide-[#FEE8EB]">
            {recentExpenses.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#767676]">
                No expenses logged yet. Click "+ Add Expense" to start!
              </div>
            ) : (
              recentExpenses.map((exp) => {
                const isPayer = exp.paidBy?._id === user?._id;
                const myShare = exp.participants?.find((p) => p.user?._id === user?._id)?.amount || 0;

                return (
                  <div key={exp._id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-[#FFF5F6] text-[#E60023] flex items-center justify-center font-bold text-sm shrink-0">
                        {exp.category?.charAt(0) || 'E'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#111111] truncate">{exp.title}</p>
                        <p className="text-[10px] text-[#767676] truncate">
                          {exp.group?.name || 'Group'} • Paid by {isPayer ? 'You' : exp.paidBy?.name}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs font-extrabold text-[#111111]">₹{exp.amount.toFixed(2)}</p>
                      <p className={`text-[10px] font-semibold ${isPayer ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {isPayer ? `You lent ₹${(exp.amount - myShare).toFixed(2)}` : `You owe ₹${myShare.toFixed(2)}`}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Groups Summary & Live Activity Feed */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-[#FEE8EB] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#111111]">My Groups</h3>
                <p className="text-xs text-[#767676]">Your shared balance circles</p>
              </div>
              <Link to="/groups" className="text-xs font-bold text-[#E60023] hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-2.5">
              {groupSummaries.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#767676]">
                  No active groups yet. Create or join one!
                </div>
              ) : (
                groupSummaries.map((g) => (
                  <Link
                    key={g._id}
                    to={`/groups/${g._id}`}
                    className="p-3 rounded-2xl bg-[#FAF9F8] border border-[#FEE8EB] flex items-center justify-between hover:border-[#FCD5DA] transition-colors block"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0"
                        style={{ backgroundColor: g.color || '#E60023' }}
                      >
                        {g.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#111111] truncate">{g.name}</p>
                        <p className="text-[10px] text-[#767676]">{g.memberCount} members</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className={`text-xs font-bold ${
                        g.userBalance > 0
                          ? 'text-emerald-600'
                          : g.userBalance < 0
                          ? 'text-rose-600'
                          : 'text-[#767676]'
                      }`}>
                        {g.userBalance > 0 ? `+₹${g.userBalance}` : g.userBalance < 0 ? `-₹${Math.abs(g.userBalance)}` : 'Settled'}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Live Activity Feed */}
          <div className="bg-white p-6 rounded-3xl border border-[#FEE8EB] shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#111111]">Live Activity Feed</h3>
            <div className="space-y-3">
              {recentActivities.length === 0 ? (
                <p className="text-xs text-[#767676] text-center py-4">No recent activities</p>
              ) : (
                recentActivities.slice(0, 5).map((act) => (
                  <div key={act._id} className="flex gap-2.5 text-xs items-start">
                    <span className="w-2 h-2 rounded-full bg-[#E60023] mt-1.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[#111111] font-medium leading-tight">{act.description}</p>
                      <p className="text-[10px] text-[#767676] mt-0.5">
                        {act.group?.name} • {new Date(act.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        onExpenseAdded={fetchDashboardData}
        preloadedGroups={groupSummaries}
      />

      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        onGroupCreated={fetchDashboardData}
      />

      <JoinGroupModal
        isOpen={isJoinGroupOpen}
        onClose={() => setIsJoinGroupOpen(false)}
        onGroupJoined={fetchDashboardData}
      />

      <SettleModal
        isOpen={isSettleOpen}
        onClose={() => {
          setIsSettleOpen(false);
          setSettlePrefill(null);
        }}
        onSettlementRecorded={fetchDashboardData}
        prefill={settlePrefill}
        groups={groupSummaries}
      />
    </div>
  );
};

export default Dashboard;
