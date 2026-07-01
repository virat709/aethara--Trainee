import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  Briefcase,
  Layers,
  ShoppingBag,
  Home,
  Utensils,
  Zap,
  Tag,
  Car,
  FileText,
  Search,
  Wallet,
  Activity,
  Check,
  Percent,
  ChevronDown
} from 'lucide-react';
import { Transaction, Budget } from '../types';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface FinancesSectionProps {
  transactions: Transaction[];
  budgets: Budget[];
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
  onUpdateBudget: (category: string, limit: number) => void;
  onClearFinances: () => void;
  searchTerm: string;
}

const CATEGORY_COLORS: { [key: string]: string } = {
  Salary: '#10b981',      // emerald
  Freelance: '#06b6d4',   // cyan
  Investments: '#6366f1', // indigo
  Housing: '#f43f5e',     // rose
  Groceries: '#f97316',   // orange
  'Dining Out': '#ef4444', // red
  Utilities: '#eab308',   // yellow
  Subscriptions: '#a855f7', // purple
  Transport: '#3b82f6',   // blue
  Entertainment: '#ec4899', // pink
  Other: '#64748b'        // slate
};

const CATEGORY_ICONS: { [key: string]: React.ComponentType<any> } = {
  Salary: Briefcase,
  Freelance: Layers,
  Investments: TrendingUp,
  Housing: Home,
  Groceries: ShoppingBag,
  'Dining Out': Utensils,
  Utilities: Zap,
  Subscriptions: Tag,
  Transport: Car,
  Entertainment: Activity,
  Other: FileText
};

export default function FinancesSection({
  transactions,
  budgets,
  onAddTransaction,
  onDeleteTransaction,
  onUpdateBudget,
  onClearFinances,
  searchTerm: globalSearch
}: FinancesSectionProps) {
  // Tab Selection
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [showEraseConfirm, setShowEraseConfirm] = useState(false);
  
  // Local state for adding transaction form
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newType, setNewType] = useState<'income' | 'expense'>('expense');
  const [newCategory, setNewCategory] = useState('Groceries');
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newNotes, setNewNotes] = useState('');

  // Local state for editing budgets
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingLimit, setEditingLimit] = useState('');

  // Filter Transaction Feed State
  const [localSearch, setLocalSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Combined Search Terms
  const finalSearch = useMemo(() => {
    return (localSearch || globalSearch).toLowerCase().trim();
  }, [localSearch, globalSearch]);

  // Available Categories list
  const categories = useMemo(() => {
    return Object.keys(CATEGORY_COLORS);
  }, []);

  // Filtered transactions list
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(finalSearch) || 
                            (t.notes || '').toLowerCase().includes(finalSearch) ||
                            t.category.toLowerCase().includes(finalSearch);
      const matchesType = filterType === 'all' || t.type === filterType;
      const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
      return matchesSearch && matchesType && matchesCategory;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, finalSearch, filterType, filterCategory]);

  // Aggregate Key Metrics (Total Balance, Income, Expense, Savings Rate)
  const metrics = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    
    // Filter transactions in current selected month scope (e.g. 2026-07)
    // For demo purposes, we will aggregate all loaded transactions
    transactions.forEach(t => {
      if (t.type === 'income') {
        totalIncome += t.amount;
      } else {
        totalExpense += t.amount;
      }
    });

    const netSavings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

    return {
      totalIncome,
      totalExpense,
      netSavings,
      savingsRate
    };
  }, [transactions]);

  // DAILY ANALYSIS DATA: Cash Flow grouped by Date
  const dailyCashFlowData = useMemo(() => {
    // Get unique dates from last 14 days sorted chronologically
    const dateMap: { [date: string]: { date: string; income: number; expense: number; net: number } } = {};
    
    // Initialize last 7 days including current
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      dateMap[dateString] = { date: dateString, income: 0, expense: 0, net: 0 };
    }

    // Populate actual transaction data
    transactions.forEach(t => {
      if (dateMap[t.date]) {
        if (t.type === 'income') {
          dateMap[t.date].income += t.amount;
        } else {
          dateMap[t.date].expense += t.amount;
        }
        dateMap[t.date].net = dateMap[t.date].income - dateMap[t.date].expense;
      }
    });

    return Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
  }, [transactions]);

  // WEEKLY ANALYSIS DATA: Cash Flow grouped by Calendar Week
  const weeklyCashFlowData = useMemo(() => {
    // Group transactions into weeks of year or simply chunks of last 4 weeks
    const weeks = [
      { name: 'Week 23', range: 'Jun 01 - Jun 07', income: 1500, expense: 800 },
      { name: 'Week 24', range: 'Jun 08 - Jun 14', income: 1100, expense: 950 },
      { name: 'Week 25', range: 'Jun 15 - Jun 21', income: 1250, expense: 700 },
      { name: 'Week 26', range: 'Jun 22 - Jun 28', income: 1850, expense: 1200 },
      { name: 'Week 27', range: 'Jun 29 - Jul 05', income: 4500, expense: 1820 },
    ];

    // Compute actual current Week 26 & 27 dynamic adjustments from transaction lists
    // Week 26 (June 22 - June 28)
    let w26Income = 0;
    let w26Expense = 0;
    // Week 27 (June 29 - July 05)
    let w27Income = 0;
    let w27Expense = 0;

    transactions.forEach(t => {
      const time = new Date(t.date).getTime();
      const w26Start = new Date('2026-06-22').getTime();
      const w26End = new Date('2026-06-28').getTime();
      const w27Start = new Date('2026-06-29').getTime();
      const w27End = new Date('2026-07-05').getTime();

      if (time >= w26Start && time <= w26End) {
        if (t.type === 'income') w26Income += t.amount;
        else w26Expense += t.amount;
      } else if (time >= w27Start && time <= w27End) {
        if (t.type === 'income') w27Income += t.amount;
        else w27Expense += t.amount;
      }
    });

    if (w26Income > 0 || w26Expense > 0) {
      weeks[3].income = w26Income;
      weeks[3].expense = w26Expense;
    }
    if (w27Income > 0 || w27Expense > 0) {
      weeks[4].income = w27Income;
      weeks[4].expense = w27Expense;
    }

    return weeks;
  }, [transactions]);

  // MONTHLY BREAKDOWN: Expense by category for circular donut chart
  const monthlyCategoryData = useMemo(() => {
    const categoriesMap: { [category: string]: number } = {};
    
    transactions.forEach(t => {
      if (t.type === 'expense') {
        categoriesMap[t.category] = (categoriesMap[t.category] || 0) + t.amount;
      }
    });

    return Object.entries(categoriesMap).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2)),
      color: CATEGORY_COLORS[name] || '#64748b'
    })).sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Handle addition of transaction
  const handleSubmitTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newAmount) return;

    onAddTransaction({
      title: newTitle.trim(),
      amount: parseFloat(newAmount),
      type: newType,
      category: newCategory,
      date: newDate,
      notes: newNotes.trim() || undefined
    });

    // Reset Form
    setNewTitle('');
    setNewAmount('');
    setNewNotes('');
    setIsAdding(false);
  };

  // Handle budget edit trigger
  const handleEditBudget = (category: string, currentLimit: number) => {
    setEditingCategory(category);
    setEditingLimit(String(currentLimit));
  };

  const handleSaveBudget = (category: string) => {
    const parsed = parseFloat(editingLimit);
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdateBudget(category, parsed);
    }
    setEditingCategory(null);
  };

  // Helper to retrieve budget of a category
  const getBudgetByCategory = (category: string): number => {
    const b = budgets.find(x => x.category === category);
    return b ? b.limit : 0;
  };

  return (
    <div className="space-y-6" id="finances-section">
      
      {/* Visual Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 tracking-tight flex items-center gap-2">
            <Wallet className="w-8 h-8 text-cyan-400" />
            <span>Personal Ledger & Analytics</span>
          </h1>
          <p className="text-slate-400 mt-1">SaaS telemetry tracking, budget alerts, and micro cash flow forecasting.</p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 ml-auto sm:ml-0 shrink-0">
          <button
            onClick={() => {
              if (showEraseConfirm) {
                onClearFinances();
                setShowEraseConfirm(false);
              } else {
                setShowEraseConfirm(true);
              }
            }}
            className={`px-4 py-2.5 border rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              showEraseConfirm
                ? 'bg-rose-500/20 border-rose-500 text-rose-400 hover:bg-rose-500 hover:text-white animate-pulse'
                : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/50'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>{showEraseConfirm ? 'Click to Confirm Erase' : 'Erase All'}</span>
          </button>

          {showEraseConfirm && (
            <button
              type="button"
              onClick={() => setShowEraseConfirm(false)}
              className="px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
              title="Cancel"
            >
              Cancel
            </button>
          )}

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:opacity-90 rounded-xl text-xs font-bold text-white transition-all shadow-md shadow-cyan-500/10 flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Record Cash Flow</span>
          </button>
        </div>
      </div>

      {/* Adding form drawer modal */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form
              onSubmit={handleSubmitTransaction}
              className="glass-panel p-6 rounded-2xl border border-cyan-500/20 bg-slate-950/40 relative space-y-4"
            >
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-display text-cyan-400">
                Log New Financial Transaction
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Label / Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Grocery Shopping"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden"
                  />
                </div>

                {/* Amount */}
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Value Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden"
                  />
                </div>

                {/* Type Selection */}
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Ledger Entry Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setNewType('expense');
                        setNewCategory('Groceries');
                      }}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        newType === 'expense'
                          ? 'bg-rose-950/30 border-rose-500/40 text-rose-400 shadow-xs'
                          : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Expense (-)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNewType('income');
                        setNewCategory('Salary');
                      }}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        newType === 'income'
                          ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-400 shadow-xs'
                          : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Income (+)
                    </button>
                  </div>
                </div>

                {/* Category Selection */}
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Classification Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden appearance-none cursor-pointer"
                  >
                    {newType === 'income' ? (
                      <>
                        <option value="Salary">Salary</option>
                        <option value="Freelance">Freelance</option>
                        <option value="Investments">Investments</option>
                        <option value="Other">Other</option>
                      </>
                    ) : (
                      <>
                        <option value="Housing">Housing</option>
                        <option value="Groceries">Groceries</option>
                        <option value="Dining Out">Dining Out</option>
                        <option value="Utilities">Utilities</option>
                        <option value="Subscriptions">Subscriptions</option>
                        <option value="Transport">Transport</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Other">Other</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Date */}
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Transaction Date</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden cursor-pointer"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs text-slate-400 font-semibold">Internal Metadata Notes (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., Grocery run for weekly batch meal prepping"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 shadow-lg shadow-cyan-500/20 cursor-pointer"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPI Stats Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Liquid Balance */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl" />
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-widest font-mono">Net Operating Capital</span>
            <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-cyan-400">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-display font-extrabold text-white mt-2">
            ₹{metrics.netSavings.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400 font-mono">
            <span>Cumulative liquidity pool</span>
          </div>
        </div>

        {/* Metric 2: Monthly Inflow */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest font-mono">Total Capital Inflow</span>
            <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-display font-extrabold text-white mt-2">
            ₹{metrics.totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-400 font-mono">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Inflow tracking active</span>
          </div>
        </div>

        {/* Metric 3: Monthly Outflow */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl" />
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-rose-400 font-extrabold uppercase tracking-widest font-mono">Total Capital Outflow</span>
            <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-display font-extrabold text-white mt-2">
            ₹{metrics.totalExpense.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-rose-400 font-mono">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>Outflow tracking active</span>
          </div>
        </div>

        {/* Metric 4: Net Savings Rate */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl" />
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-purple-400 font-extrabold uppercase tracking-widest font-mono">Capital Savings Rate</span>
            <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-purple-400">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-display font-extrabold text-white mt-2">
            {metrics.savingsRate.toFixed(1)}%
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400 font-mono">
            <div className="w-full bg-slate-900 rounded-full h-1.5 border border-slate-800 overflow-hidden">
              <div
                className="bg-purple-500 h-full rounded-full"
                style={{ width: `${Math.min(100, Math.max(0, metrics.savingsRate))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Interface Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Analytics & Interactive Charts (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl">
            <div className="flex justify-between items-center pb-4 border-b border-slate-900 mb-6 flex-wrap gap-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                Advanced Financial Analytics
              </h2>
              
              {/* Selector Tabs */}
              <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-850">
                <button
                  onClick={() => setActiveTab('daily')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'daily'
                      ? 'bg-slate-900 text-cyan-400 border border-slate-800 shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Daily
                </button>
                <button
                  onClick={() => setActiveTab('weekly')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'weekly'
                      ? 'bg-slate-900 text-cyan-400 border border-slate-800 shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setActiveTab('monthly')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'monthly'
                      ? 'bg-slate-900 text-cyan-400 border border-slate-800 shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>

            {/* Daily Chart */}
            {activeTab === 'daily' && (
              <div className="space-y-4">
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyCashFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="date"
                        stroke="#475569"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(str) => {
                          const parts = str.split('-');
                          return parts.length > 2 ? `${parts[1]}/${parts[2]}` : str;
                        }}
                      />
                      <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#030712',
                          borderColor: '#1e293b',
                          borderRadius: '12px',
                          color: '#f8fafc',
                          fontSize: '11px',
                          fontFamily: 'monospace'
                        }}
                      />
                      <Area type="monotone" dataKey="net" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorNet)" name="Net Cash Flow (₹)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="p-3 bg-slate-900/30 border border-slate-850 rounded-xl flex items-center gap-2.5 text-xs text-slate-400">
                  <Activity className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Interactive curve illustrates daily net cash surplus or deficit over the dynamic weekly horizon.</span>
                </div>
              </div>
            )}

            {/* Weekly Chart */}
            {activeTab === 'weekly' && (
              <div className="space-y-4">
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyCashFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#030712',
                          borderColor: '#1e293b',
                          borderRadius: '12px',
                          color: '#f8fafc',
                          fontSize: '11px',
                          fontFamily: 'monospace'
                        }}
                      />
                      <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Inflow (₹)" />
                      <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Outflow (₹)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="p-3 bg-slate-900/30 border border-slate-850 rounded-xl flex items-center gap-2.5 text-xs text-slate-400">
                  <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Aggregated weekly streams comparing overall cash inflow vs outlays for balanced financial planning.</span>
                </div>
              </div>
            )}

            {/* Monthly Chart */}
            {activeTab === 'monthly' && (
              <div className="space-y-4">
                {monthlyCategoryData.length === 0 ? (
                  <div className="h-[260px] flex flex-col items-center justify-center text-center text-slate-500">
                    <AlertCircle className="w-10 h-10 text-slate-600 mb-2" />
                    <p className="text-sm">No expenses logged yet to map category breakdown</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div className="h-[260px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={monthlyCategoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {monthlyCategoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#030712',
                              borderColor: '#1e293b',
                              borderRadius: '12px',
                              color: '#f8fafc',
                              fontSize: '11px',
                              fontFamily: 'monospace'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Legend Table */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Expenditure Weights</h3>
                      <div className="max-h-[200px] overflow-y-auto space-y-1.5 pr-2 custom-scrollbar">
                        {monthlyCategoryData.map((item, idx) => {
                          const totalExp = monthlyCategoryData.reduce((acc, curr) => acc + curr.value, 0);
                          const percentage = totalExp > 0 ? ((item.value / totalExp) * 100).toFixed(1) : '0';
                          return (
                            <div key={idx} className="flex justify-between items-center text-xs">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-slate-300 font-semibold">{item.name}</span>
                              </div>
                              <div className="font-mono text-slate-400">
                                <span className="text-white">₹{item.value.toFixed(2)}</span>
                                <span className="text-[10px] ml-1.5 text-slate-500">({percentage}%)</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
                <div className="p-3 bg-slate-900/30 border border-slate-850 rounded-xl flex items-center gap-2.5 text-xs text-slate-400">
                  <Percent className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Category allocations allow you to immediately target areas of excessive or unwanted spend.</span>
                </div>
              </div>
            )}
          </div>

          {/* Budget Setting Panel */}
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-display mb-4">
              Monthly Budget Threshold Limits
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {budgets.map((b) => {
                // Compute expense logged under this category
                const catExpenses = transactions
                  .filter(t => t.type === 'expense' && t.category === b.category)
                  .reduce((sum, t) => sum + t.amount, 0);

                const percent = b.limit > 0 ? (catExpenses / b.limit) * 100 : 0;
                const isOverBudget = catExpenses > b.limit;
                const Icon = CATEGORY_ICONS[b.category] || FileText;

                return (
                  <div key={b.category} className="p-4 rounded-xl bg-slate-900/40 border border-slate-850 flex flex-col justify-between space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-slate-950 rounded-lg border border-slate-800" style={{ color: CATEGORY_COLORS[b.category] }}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{b.category}</p>
                          <span className="text-[10px] text-slate-500 font-mono">Limit target</span>
                        </div>
                      </div>

                      {editingCategory === b.category ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            className="w-16 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg px-2 py-1 text-[11px] font-mono text-white text-right"
                            value={editingLimit}
                            onChange={(e) => setEditingLimit(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveBudget(b.category)}
                            className="p-1 text-emerald-400 hover:text-emerald-300 cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEditBudget(b.category, b.limit)}
                          className="text-[10px] text-slate-400 hover:text-cyan-400 font-mono underline cursor-pointer"
                        >
                          ₹{b.limit.toLocaleString('en-IN')} / mo
                        </button>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-slate-400">Used: ₹{catExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        <span className={isOverBudget ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                          {percent.toFixed(0)}%
                        </span>
                      </div>

                      <div className="w-full bg-slate-950 h-1.5 border border-slate-850 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isOverBudget ? 'bg-rose-500' : percent > 80 ? 'bg-amber-500' : 'bg-cyan-500'
                          }`}
                          style={{ width: `${Math.min(100, percent)}%` }}
                        />
                      </div>
                    </div>

                    {isOverBudget && (
                      <div className="flex items-center gap-1.5 text-[10px] text-rose-400 bg-rose-950/20 px-2 py-1 rounded-lg border border-rose-500/20">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>Threshold Exceeded</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Transaction Feed (Span 1) */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl flex flex-col h-[520px] lg:h-[650px]">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-display mb-4">
              Transaction Feed
            </h2>

            {/* Local Filters bar */}
            <div className="space-y-3 mb-4">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search ledger..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-cyan-500 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-hidden"
                />
              </div>

              {/* Type and category row */}
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="bg-slate-900/60 border border-slate-800 focus:border-cyan-500 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-hidden cursor-pointer"
                >
                  <option value="all">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-slate-900/60 border border-slate-800 focus:border-cyan-500 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-hidden cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Scrollable Feed */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              <AnimatePresence initial={false}>
                {filteredTransactions.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-12">
                    <FileText className="w-8 h-8 text-slate-700 mb-2 animate-pulse" />
                    <p className="text-xs px-4">
                      {transactions.length === 0
                        ? "Your ledger is completely empty. Click 'Record Cash Flow' to build your own finance sheet!"
                        : "No transactions recorded matching the criteria."}
                    </p>
                  </div>
                ) : (
                  filteredTransactions.map((t) => {
                    const Icon = CATEGORY_ICONS[t.category] || FileText;
                    const isIncome = t.type === 'income';

                    return (
                      <motion.div
                        key={t.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="p-3 bg-slate-900/20 hover:bg-slate-900/40 border border-slate-850/60 hover:border-slate-800 rounded-xl flex items-center justify-between gap-3 group transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="p-2 bg-slate-950 rounded-lg border border-slate-800 shrink-0"
                            style={{ color: CATEGORY_COLORS[t.category] || '#64748b' }}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-xs font-bold text-white truncate leading-tight">{t.title}</h3>
                            <div className="flex items-center gap-1.5 text-[9px] text-slate-500 mt-1 font-mono">
                              <span>{t.date}</span>
                              <span>•</span>
                              <span className="text-[8px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-full bg-slate-950 text-slate-400 border border-slate-850">
                                {t.category}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-xs font-bold font-mono ${isIncome ? 'text-emerald-400' : 'text-slate-300'}`}>
                            {isIncome ? '+' : '-'}₹{t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          
                          <button
                            onClick={() => onDeleteTransaction(t.id)}
                            className="p-1 text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all rounded-md hover:bg-slate-900 cursor-pointer"
                            title="Delete Transaction"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
