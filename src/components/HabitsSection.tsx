import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Flame, Plus, Trash2, CheckCircle, Award, RefreshCw, Calendar, Check } from 'lucide-react';
import { Habit, GoalCategory } from '../types';
import {
  getCategoryStyles,
  getCategoryEmoji,
  calculateStreak,
  getTodayDateString,
  formatDateString,
} from '../utils';

interface HabitsSectionProps {
  habits: Habit[];
  onAddHabit: (habit: Omit<Habit, 'id' | 'completedDates' | 'createdAt'>) => void;
  onToggleHabit: (id: string, dateStr: string) => void;
  onDeleteHabit: (id: string) => void;
  searchTerm?: string;
}

export default function HabitsSection({
  habits,
  onAddHabit,
  onToggleHabit,
  onDeleteHabit,
  searchTerm = '',
}: HabitsSectionProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<GoalCategory>('health');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');

  const todayStr = getTodayDateString();

  // Generate list of past 7 days for the beautiful interactive calendar matrix row
  const pastSevenDays = useMemo(() => {
    const list = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = formatDateString(d);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'narrow' });
      const dayNum = d.getDate();
      list.push({ dateStr, dayName, dayNum, isToday: dateStr === todayStr });
    }
    return list;
  }, [todayStr]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddHabit({
      title,
      category,
      frequency,
    });

    setTitle('');
    setCategory('health');
    setFrequency('daily');
    setShowAddForm(false);
  };

  // Filter habits by search term
  const filteredHabits = useMemo(() => {
    return habits.filter((h) => h.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [habits, searchTerm]);

  // Compute stats for Habit telemetry insights
  const stats = useMemo(() => {
    let globalBestStreak = 0;
    let globalActiveStreaks = 0;
    let completedTodayCount = 0;

    habits.forEach((h) => {
      const { current, best } = calculateStreak(h.completedDates);
      if (best > globalBestStreak) globalBestStreak = best;
      if (current > 0) globalActiveStreaks++;
      if (h.completedDates.includes(todayStr)) completedTodayCount++;
    });

    return {
      globalBestStreak,
      globalActiveStreaks,
      completedTodayCount,
      totalHabitsCount: habits.length,
    };
  }, [habits, todayStr]);

  return (
    <div className="space-y-6" id="habits-section-root">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300 tracking-tight flex items-center gap-2">
            <Flame className="w-8 h-8 text-rose-500 animate-pulse" />
            <span>Habits & Streaks VM</span>
          </h1>
          <p className="text-slate-400 mt-1">
            Build compounding discipline. Complete routines, monitor active streaks, and review 7-day completion grids.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 shadow-lg"
          id="btn-toggle-add-habit"
        >
          <Plus className="w-4 h-4" />
          <span>Formulate Habit</span>
        </button>
      </div>

      {/* Habits local KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Total Habits</span>
          <p className="text-xl font-display font-bold text-white mt-1">{stats.totalHabitsCount} tracking</p>
        </div>
        <div className="glass-panel p-4 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold">Completed Today</span>
          <p className="text-xl font-display font-bold text-cyan-400 mt-1">{stats.completedTodayCount} items</p>
        </div>
        <div className="glass-panel p-4 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] text-orange-400 uppercase tracking-widest font-bold">Active Streaks</span>
          <p className="text-xl font-display font-bold text-orange-400 mt-1">{stats.globalActiveStreaks} routines</p>
        </div>
        <div className="glass-panel p-4 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] text-rose-400 uppercase tracking-widest font-bold">Best Record Streak</span>
          <p className="text-xl font-display font-bold text-rose-400 mt-1">{stats.globalBestStreak} days</p>
        </div>
      </div>

      {/* Add Habit Inline Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 rounded-2xl relative overflow-hidden"
          id="add-habit-form"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl" />
          <h2 className="text-base font-display font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-4.5 h-4.5 text-cyan-400" />
            <span>Formulate Routine Architecture</span>
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-slate-400">Habit Name / Specific Routine</label>
                <input
                  type="text"
                  placeholder="e.g. Read tech whitepaper, cardio drills"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500/50"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Focus Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as GoalCategory)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-hidden focus:border-cyan-500/50"
                >
                  <option value="health">🌿 Health & Wellness</option>
                  <option value="work">💼 Work & Projects</option>
                  <option value="personal">🌱 Personal Growth</option>
                  <option value="finance">💰 Finance & Savings</option>
                  <option value="other">📍 Other Focus</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Trigger Frequency</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as 'daily' | 'weekly')}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-hidden focus:border-cyan-500/50"
                >
                  <option value="daily">Daily Habit Loop</option>
                  <option value="weekly">Weekly Target Cycle</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white rounded-xl bg-slate-900/60 border border-slate-850"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl transition-all shadow-lg"
              >
                Launch Habit Routine
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Habits Stream List */}
      {filteredHabits.length === 0 ? (
        <div className="glass-panel py-16 text-center text-slate-500 rounded-2xl text-xs space-y-2">
          <Flame className="w-10 h-10 mx-auto text-slate-800" />
          <p className="font-semibold text-slate-400">No habits match current search parameters.</p>
          <p className="text-[11px]">Deploy a new habit loop now to begin tracking streaks!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHabits.map((h) => {
            const styles = getCategoryStyles(h.category);
            const { current: streakVal, best: bestStreak } = calculateStreak(h.completedDates);
            const completedToday = h.completedDates.includes(todayStr);

            return (
              <motion.div
                key={h.id}
                layout
                className="glass-panel p-5 rounded-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 hover:border-slate-700/80 transition-all group"
              >
                {/* Habit details */}
                <div className="space-y-2.5 min-w-0 max-w-sm">
                  <div className="flex items-center gap-2">
                    <span className={`text-[8px] uppercase font-extrabold tracking-widest px-2 py-0.5 rounded-full ${styles.bg} ${styles.text}`}>
                      {getCategoryEmoji(h.category)} {styles.label}
                    </span>
                    <span className="text-[9px] uppercase font-mono text-slate-500 font-bold">
                      {h.frequency} Loop
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-100 text-sm group-hover:text-white transition-colors">
                    {h.title}
                  </h3>
                  <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      🔥 Streak: <span className="text-orange-400 font-bold">{streakVal} days</span>
                    </span>
                    <span className="text-slate-600">•</span>
                    <span>
                      Best Streak: <span className="text-cyan-400 font-bold">{bestStreak} days</span>
                    </span>
                  </div>
                </div>

                {/* Past 7 Days interactive calendar Matrix block */}
                <div className="space-y-2">
                  <span className="text-[9px] font-bold text-slate-400 font-mono block">7-Day Biometric Tracker Grid</span>
                  <div className="flex gap-2">
                    {pastSevenDays.map((day) => {
                      const completedOnDate = h.completedDates.includes(day.dateStr);
                      return (
                        <button
                          key={day.dateStr}
                          onClick={() => onToggleHabit(h.id, day.dateStr)}
                          className={`w-11 py-2 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer border ${
                            completedOnDate
                              ? 'bg-gradient-to-tr from-cyan-950/40 to-cyan-500/10 border-cyan-500 text-cyan-400 scale-102 shadow-[0_0_10px_rgba(6,182,212,0.1)]'
                              : day.isToday
                              ? 'border-slate-700 bg-slate-900/50 text-slate-300'
                              : 'border-slate-850 bg-slate-900/10 text-slate-500 hover:border-slate-800'
                          }`}
                          title={`${completedOnDate ? 'Completed' : 'Pending'} on ${day.dateStr}`}
                        >
                          <span className="text-[9px] font-extrabold uppercase font-mono">{day.dayName}</span>
                          <span className="text-xs font-bold mt-1 font-display">{day.dayNum}</span>
                          {completedOnDate && <div className="w-1 h-1 rounded-full bg-cyan-400 mt-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Operations column */}
                <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                  <button
                    onClick={() => onToggleHabit(h.id, todayStr)}
                    className={`px-3 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      completedToday
                        ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                        : 'bg-slate-900 hover:bg-slate-800 border-slate-800/80 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{completedToday ? 'Done Today' : 'Mark Done'}</span>
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Permanently delete habit loop "${h.title}"?`)) {
                        onDeleteHabit(h.id);
                      }
                    }}
                    className="p-2.5 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 text-red-400 rounded-xl cursor-pointer transition-all"
                    title="Delete habit loop"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

              </motion.div>
            );
          })}
        </div>
      )}

    </div>
  );
}
