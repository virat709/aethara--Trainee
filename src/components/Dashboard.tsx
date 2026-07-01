import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  Activity,
  Flame,
  Calendar,
  Heart,
  Droplet,
  Coffee,
  CheckCircle,
  Plus,
  Compass,
  Sparkles,
  Zap,
  ArrowUpRight,
  Smile,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { Goal, Habit, DailyLog, ScheduleEvent, GoalCategory } from '../types';
import {
  getTodayDateString,
  getCategoryStyles,
  getMoodDetails,
  calculateStreak,
  formatHumanDate,
} from '../utils';

interface DashboardProps {
  goals: Goal[];
  habits: Habit[];
  logs: DailyLog[];
  events: ScheduleEvent[];
  onToggleHabit: (habitId: string, dateStr: string) => void;
  onQuickLog: (metrics: Partial<DailyLog>) => void;
  setCurrentTab: (tab: string) => void;
  searchTerm?: string;
  waterTarget: number;
  stepsTarget: number;
  sleepTarget: number;
  darkMode?: boolean;
}

export default function Dashboard({
  goals,
  habits,
  logs,
  events,
  onToggleHabit,
  onQuickLog,
  setCurrentTab,
  searchTerm = '',
  waterTarget,
  stepsTarget,
  sleepTarget,
  darkMode = true
}: DashboardProps) {
  const todayStr = getTodayDateString();

  // Find today's log or supply defaults with custom targets
  const todayLog = useMemo(() => {
    return logs.find((l) => l.date === todayStr) || {
      id: '',
      date: todayStr,
      waterIntake: 0,
      waterTarget: waterTarget,
      steps: 0,
      stepsTarget: stepsTarget,
      sleepHours: 0,
      sleepTarget: sleepTarget,
      mood: 0,
      notes: '',
      createdAt: '',
    };
  }, [logs, todayStr, waterTarget, stepsTarget, sleepTarget]);

  // Compute high-fidelity stats
  const stats = useMemo(() => {
    // 1. Habits streak
    let bestStreakVal = 0;
    let totalCompletions = 0;
    habits.forEach((h) => {
      const { current, best } = calculateStreak(h.completedDates);
      if (best > bestStreakVal) bestStreakVal = best;
      totalCompletions += h.completedDates.length;
    });

    // 2. Goal progress
    const completedGoals = goals.filter((g) => g.completed || g.currentValue >= g.targetValue).length;
    const goalProgressPercent = goals.length > 0 ? Math.round((completedGoals / goals.length) * 100) : 0;

    // 3. Today's events
    const todayEvents = events.filter((e) => e.date === todayStr);
    const todayCompletedEvents = todayEvents.filter((e) => e.completed).length;

    // 4. Mood average
    const recentLogs = [...logs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7);
    const avgMood =
      recentLogs.length > 0
        ? (recentLogs.reduce((acc, curr) => acc + curr.mood, 0) / recentLogs.length).toFixed(1)
        : '0.0';

    return {
      bestStreak: bestStreakVal,
      totalCompletions,
      completedGoals,
      goalProgressPercent,
      todayEventsCount: todayEvents.length,
      todayCompletedEvents,
      avgMood,
      recentLogs,
    };
  }, [goals, habits, logs, events, todayStr]);

  // Sort and format logs for charts (past 7 logs)
  const chartData = useMemo(() => {
    return [...logs]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7)
      .map((l) => ({
        ...l,
        formattedDate: formatHumanDate(l.date),
        moodLabel: getMoodDetails(l.mood).label,
      }));
  }, [logs]);

  // Handle quick water addition
  const handleAddWater = (amount: number) => {
    const currentWater = todayLog.waterIntake;
    onQuickLog({
      date: todayStr,
      waterIntake: currentWater + amount,
    });
  };

  // Handle quick steps update
  const handleAddSteps = (amount: number) => {
    const currentSteps = todayLog.steps;
    onQuickLog({
      date: todayStr,
      steps: currentSteps + amount,
    });
  };

  // Handle quick mood logging
  const handleSetMood = (rating: number) => {
    onQuickLog({
      date: todayStr,
      mood: rating,
    });
  };

  // Today's habits with completion state & Search filtering
  const todayHabits = useMemo(() => {
    return habits
      .map((h) => {
        const isCompletedToday = h.completedDates.includes(todayStr);
        const { current } = calculateStreak(h.completedDates);
        return {
          ...h,
          isCompletedToday,
          currentStreak: current,
        };
      })
      .filter((h) => h.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [habits, todayStr, searchTerm]);

  // Next upcoming events with Search filtering
  const upcomingEvents = useMemo(() => {
    return events
      .filter((e) => e.date >= todayStr)
      .filter((e) => e.title.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.startTime.localeCompare(b.startTime);
      })
      .slice(0, 3);
  }, [events, todayStr, searchTerm]);

  // Container variants for staggered entrance animations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
      id="dashboard-root"
    >
      {/* Welcome Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs bg-cyan-950 text-cyan-400 border border-cyan-800/40 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Telemetry Active
            </span>
            <span className="text-xs bg-slate-900 text-slate-400 px-2 py-0.5 rounded-full font-mono">
              7D Rollup View
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight flex items-center gap-3">
            <span>Aethera Workspace</span>
            <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse" />
          </h1>
          <p className="text-slate-400 mt-1 max-w-xl">
            Real-time biometric analytics, milestone tracking, and daily schedule streams for <span className="text-cyan-400 font-semibold">{formatHumanDate(todayStr)}</span>.
          </p>
        </div>
        
        {/* Quick Navigate Controls */}
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setCurrentTab('logs')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-100 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 shadow-lg"
            id="btn-nav-logs"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            Add Telemetry Log
          </button>
          <button
            onClick={() => setCurrentTab('calendar')}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 shadow-lg"
            id="btn-nav-calendar"
          >
            <Calendar className="w-3.5 h-3.5 text-white" />
            Schedule Event
          </button>
        </div>
      </div>

      {/* KPI Cards Grid with Glowing Neon Elements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Habit Streaks */}
        <motion.div
          variants={itemVariants}
          className="glass-panel p-6 rounded-2xl relative overflow-hidden transition-all duration-300 hover:scale-102 hover:border-rose-500/30 group"
          id="stat-streak"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl transition-all group-hover:bg-rose-500/10" />
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 font-display uppercase tracking-widest block">Habit Streaks</span>
              <h3 className="text-3xl font-display font-extrabold text-white flex items-baseline gap-1 mt-1">
                {stats.bestStreak} <span className="text-xs font-semibold text-slate-400 font-sans">days max</span>
              </h3>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1.5 pt-1">
                <CheckCircle className="w-3 h-3 text-emerald-400 fill-emerald-400/20" />
                {stats.totalCompletions} total records done
              </p>
            </div>
            <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20 group-hover:bg-rose-500/20 transition-all">
              <Flame className="w-5 h-5 fill-rose-500/30" />
            </div>
          </div>
        </motion.div>

        {/* KPI 2: Goal Progress */}
        <motion.div
          variants={itemVariants}
          className="glass-panel p-6 rounded-2xl relative overflow-hidden transition-all duration-300 hover:scale-102 hover:border-cyan-500/30 group"
          id="stat-goals"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl transition-all group-hover:bg-cyan-500/10" />
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 font-display uppercase tracking-widest block">Goal Telemetry</span>
              <h3 className="text-3xl font-display font-extrabold text-white mt-1">
                {stats.goalProgressPercent}%
              </h3>
              <div className="w-24 bg-slate-900 h-1 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-400 to-blue-500 h-1 rounded-full transition-all duration-500"
                  style={{ width: `${stats.goalProgressPercent}%` }}
                />
              </div>
            </div>
            <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20 group-hover:bg-cyan-500/20 transition-all">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </motion.div>

        {/* KPI 3: Today's Schedule status */}
        <motion.div
          variants={itemVariants}
          className="glass-panel p-6 rounded-2xl relative overflow-hidden transition-all duration-300 hover:scale-102 hover:border-purple-500/30 group"
          id="stat-events"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl transition-all group-hover:bg-purple-500/10" />
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 font-display uppercase tracking-widest block">Planner Sprints</span>
              <h3 className="text-3xl font-display font-extrabold text-white mt-1">
                {stats.todayCompletedEvents}/{stats.todayEventsCount}
              </h3>
              <p className="text-[10px] text-slate-400 pt-1">
                {stats.todayEventsCount - stats.todayCompletedEvents} events remaining today
              </p>
            </div>
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20 group-hover:bg-purple-500/20 transition-all">
              <Zap className="w-5 h-5 text-purple-400 fill-purple-400/20" />
            </div>
          </div>
        </motion.div>

        {/* KPI 4: Mean Mood Index */}
        <motion.div
          variants={itemVariants}
          className="glass-panel p-6 rounded-2xl relative overflow-hidden transition-all duration-300 hover:scale-102 hover:border-amber-500/30 group"
          id="stat-mood"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl transition-all group-hover:bg-amber-500/10" />
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 font-display uppercase tracking-widest block">Mood Index (7d)</span>
              <h3 className="text-3xl font-display font-extrabold text-white flex items-baseline gap-1 mt-1">
                {stats.avgMood} <span className="text-xs font-semibold text-slate-400 font-sans">/ 5.0</span>
              </h3>
              <p className="text-[10px] text-slate-400 pt-1">Based on telemetry logs</p>
            </div>
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 group-hover:bg-amber-500/20 transition-all">
              <Smile className="w-5 h-5 text-amber-400" />
            </div>
          </div>
        </motion.div>

      </div>

      {/* Main Grid: Interactive Tasks (Left) vs High-Quality Analytics (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Hand: Habits Checklist & Quick Logger */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Habits Card */}
          <motion.div
            variants={itemVariants}
            className="glass-panel p-6 rounded-2xl space-y-4"
            id="habits-checklist-card"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-900/60">
              <div>
                <h2 className="text-base font-display font-bold text-white flex items-center gap-2">
                  <span>Daily Habits Routine</span>
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">Quick checklist to fire up daily streaks</p>
              </div>
              <button
                onClick={() => setCurrentTab('habits')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                Manage
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            {todayHabits.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs space-y-2.5">
                <Compass className="w-8 h-8 mx-auto text-slate-700" />
                <p>{searchTerm ? 'No habits matching search query.' : 'No active habits tracked today.'}</p>
                <button
                  onClick={() => setCurrentTab('habits')}
                  className="text-xs text-cyan-400 font-bold hover:underline"
                >
                  Configure new habit
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                {todayHabits.map((h) => {
                  const styles = getCategoryStyles(h.category);
                  return (
                    <div
                      key={h.id}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        h.isCompletedToday
                          ? 'border-cyan-500/20 bg-cyan-950/10'
                          : 'border-slate-800 bg-slate-900/30 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onToggleHabit(h.id, todayStr)}
                          className={`w-5 h-5 rounded-md flex items-center justify-center transition-all cursor-pointer border ${
                            h.isCompletedToday
                              ? 'bg-cyan-500 border-cyan-500 text-slate-950'
                              : 'border-slate-700 bg-slate-850 hover:border-slate-650'
                          }`}
                        >
                          {h.isCompletedToday && <CheckCircle className="w-3.5 h-3.5 text-slate-950 fill-none" />}
                        </button>
                        <div>
                          <p
                            className={`text-xs font-bold transition-all ${
                              h.isCompletedToday ? 'text-slate-500 line-through' : 'text-slate-200'
                            }`}
                          >
                            {h.title}
                          </p>
                          <span className={`inline-block text-[9px] px-1.5 py-0.2 rounded-md mt-1 font-bold ${styles.bg} ${styles.text}`}>
                            {styles.label}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-orange-400" title="Streak count">
                        <Flame className="w-3.5 h-3.5 fill-orange-500/20" />
                        <span className="text-xs font-extrabold">{h.currentStreak}d</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Quick Telemetry Logger */}
          <motion.div
            variants={itemVariants}
            className="glass-panel p-6 rounded-2xl space-y-4"
            id="quick-log-card"
          >
            <div className="pb-2 border-b border-slate-900/60">
              <h2 className="text-base font-display font-bold text-white">Direct Log Entry</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Increment wellness indicators on the fly</p>
            </div>

            {/* Quick Mood Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 block">Current Mood Telemetry</label>
              <div className="flex justify-between p-1 bg-slate-950 border border-slate-900 rounded-xl">
                {[1, 2, 3, 4, 5].map((val) => {
                  const details = getMoodDetails(val);
                  const isSelected = todayLog.mood === val;
                  return (
                    <button
                      key={val}
                      onClick={() => handleSetMood(val)}
                      type="button"
                      className={`flex-1 py-1.5 text-lg rounded-lg transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                        isSelected
                          ? 'bg-slate-900 border border-slate-800 text-white shadow-md scale-105'
                          : 'opacity-50 hover:opacity-100 hover:scale-102'
                      }`}
                      title={details.label}
                    >
                      <span>{details.emoji}</span>
                      <span className="text-[9px] font-mono font-bold text-slate-400">{val}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Incremental Indicators */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              
              {/* Quick Water Accumulator */}
              <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-cyan-400">
                    <Droplet className="w-3.5 h-3.5 fill-cyan-400/20" />
                    <span className="text-xs font-bold font-display">Water</span>
                  </div>
                  <span className="text-xs font-mono font-extrabold text-slate-300">
                    {todayLog.waterIntake} ml
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-500 h-1 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min((todayLog.waterIntake / waterTarget) * 100, 100)}%`,
                    }}
                  />
                </div>
                <div className="flex gap-1.5 pt-0.5">
                  <button
                    onClick={() => handleAddWater(250)}
                    className="flex-1 py-1 text-[10px] font-bold bg-cyan-950 hover:bg-cyan-900 text-cyan-400 border border-cyan-900/30 rounded-lg cursor-pointer transition-colors"
                  >
                    +250ml
                  </button>
                  <button
                    onClick={() => handleAddWater(500)}
                    className="flex-1 py-1 text-[10px] font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg cursor-pointer transition-colors"
                  >
                    +500ml
                  </button>
                </div>
              </div>

              {/* Quick Steps Accumulator */}
              <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-purple-400">
                    <Activity className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold font-display">Steps</span>
                  </div>
                  <span className="text-xs font-mono font-extrabold text-slate-300">
                    {todayLog.steps.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-500 h-1 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min((todayLog.steps / stepsTarget) * 100, 100)}%`,
                    }}
                  />
                </div>
                <div className="flex gap-1.5 pt-0.5">
                  <button
                    onClick={() => handleAddSteps(1000)}
                    className="flex-1 py-1 text-[10px] font-bold bg-purple-950 hover:bg-purple-900 text-purple-400 border border-purple-900/30 rounded-lg cursor-pointer transition-colors"
                  >
                    +1k
                  </button>
                  <button
                    onClick={() => handleAddSteps(2500)}
                    className="flex-1 py-1 text-[10px] font-bold bg-purple-500 hover:bg-purple-400 text-white rounded-lg cursor-pointer transition-colors"
                  >
                    +2.5k
                  </button>
                </div>
              </div>

            </div>
          </motion.div>

        </div>

        {/* Right Hand: High-fidelity Analytics & Interactive Graphs */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Chart Area */}
          <motion.div
            variants={itemVariants}
            className="glass-panel p-6 rounded-2xl space-y-4"
            id="chart-mood-sleep"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>Wellness Chronology telemetry</span>
                </h3>
                <p className="text-[11px] text-slate-400">Co-relating sleep hours with mood scores over the current cycle</p>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono">
                <span className="flex items-center gap-1.5 font-bold text-cyan-400">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  Mood Rating (1-5)
                </span>
                <span className="flex items-center gap-1.5 font-bold text-purple-400">
                  <span className="w-2 h-2 rounded bg-purple-500" />
                  Sleep (hours)
                </span>
              </div>
            </div>

            <div className="h-[230px] w-full">
              {chartData.length < 2 ? (
                <div className="h-full flex flex-col justify-center items-center text-slate-500 text-xs gap-2.5">
                  <TrendingUp className="w-8 h-8 text-slate-700" />
                  <p>Awaiting wellness records. Add logs across multiple days to map vectors.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorSleep" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} vertical={false} />
                    <XAxis dataKey="formattedDate" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis domain={[0, 10]} stroke="#64748b" fontSize={10} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: darkMode ? '#090a16' : '#ffffff',
                        borderRadius: '12px',
                        border: darkMode ? '1px solid #334155' : '1px solid #cbd5e1',
                        color: darkMode ? '#fff' : '#0f172a'
                      }}
                      labelStyle={{ fontWeight: 'bold', color: '#06b6d4' }}
                    />
                    <Area type="monotone" name="Mood" dataKey="mood" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMood)" />
                    <Area type="monotone" name="Sleep Hours" dataKey="sleepHours" stroke="#a855f7" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSleep)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

          {/* Hydration & Movement Double Chart */}
          <motion.div
            variants={itemVariants}
            className="glass-panel p-6 rounded-2xl space-y-4"
            id="chart-water-steps"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  <span>Hydration and Movement Vectors</span>
                </h3>
                <p className="text-[11px] text-slate-400">Comparative chart plotting steps taken alongside water intake ml</p>
              </div>
              <div className="flex gap-3 text-[10px] font-mono">
                <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Steps Completed
                </span>
                <span className="flex items-center gap-1.5 font-bold text-blue-400">
                  <span className="w-2 h-2 rounded bg-blue-500" />
                  Water (ml)
                </span>
              </div>
            </div>

            <div className="h-[230px] w-full">
              {chartData.length < 2 ? (
                <div className="h-full flex flex-col justify-center items-center text-slate-500 text-xs gap-2.5">
                  <Activity className="w-8 h-8 text-slate-700" />
                  <p>Log daily metrics for multiple days to render analytical comparative tables.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} vertical={false} />
                    <XAxis dataKey="formattedDate" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis yAxisId="left" stroke="#10b981" fontSize={10} tickLine={false} domain={[0, 'dataMax + 2000']} />
                    <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" fontSize={10} tickLine={false} domain={[0, 'dataMax + 500']} />
                    <Tooltip
                      contentStyle={{
                        background: darkMode ? '#090a16' : '#ffffff',
                        borderRadius: '12px',
                        border: darkMode ? '1px solid #334155' : '1px solid #cbd5e1',
                        color: darkMode ? '#fff' : '#0f172a'
                      }}
                    />
                    <Bar yAxisId="left" name="Steps" dataKey="steps" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={20} />
                    <Bar yAxisId="right" name="Water ml" dataKey="waterIntake" fill="#3b82f6" radius={[3, 3, 0, 0]} maxBarSize={20} opacity={0.85} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

        </div>

      </div>

      {/* Dynamic Schedule Preview Row */}
      <motion.div
        variants={itemVariants}
        className="glass-panel p-6 rounded-2xl space-y-4"
        id="upcoming-schedule-preview"
      >
        <div className="flex justify-between items-center pb-2 border-b border-slate-900/60">
          <div>
            <h2 className="text-base font-display font-bold text-white flex items-center gap-2">
              <Calendar className="w-4.5 h-4.5 text-cyan-400" />
              <span>SaaS Schedule Stream</span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Automated compilation of upcoming planned events</p>
          </div>
          <button
            onClick={() => setCurrentTab('calendar')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer transition-colors"
          >
            Expand Planner
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        {upcomingEvents.length === 0 ? (
          <div className="py-6 text-center text-slate-500 text-xs">
            <p>{searchTerm ? 'No scheduled events matching search query.' : 'No upcoming milestones scheduled in system.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcomingEvents.map((e) => {
              const styles = getCategoryStyles(e.category);
              return (
                <div
                  key={e.id}
                  className={`p-4.5 rounded-xl border ${styles.border} bg-slate-900/35 flex flex-col justify-between hover:shadow-[0_0_15px_rgba(6,182,212,0.05)] transition-all`}
                >
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center gap-2">
                      <span className={`text-[8px] uppercase font-extrabold tracking-widest px-2 py-0.5 rounded-full ${styles.bg} ${styles.text}`}>
                        {styles.label}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {e.date === todayStr ? 'Today' : formatHumanDate(e.date)}
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-xs mt-2.5">{e.title}</h4>
                    {e.notes && <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mt-1">{e.notes}</p>}
                  </div>
                  <div className="mt-4 pt-3.5 border-t border-slate-900 flex justify-between items-center text-[10px] font-mono">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      {e.startTime} - {e.endTime}
                    </span>
                    <span className={`font-bold ${e.completed ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {e.completed ? '✓ SUCCESS' : 'PENDING'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

    </motion.div>
  );
}
