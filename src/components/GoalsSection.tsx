import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Target, Plus, CheckCircle, Trash2, Calendar, Award, Sparkles, Filter, ChevronRight, Check } from 'lucide-react';
import { Goal, GoalCategory } from '../types';
import { getCategoryStyles, getCategoryEmoji, getTodayDateString } from '../utils';

interface GoalsSectionProps {
  goals: Goal[];
  onAddGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
  onUpdateGoalProgress: (id: string, value: number) => void;
  onToggleGoalComplete: (id: string) => void;
  onDeleteGoal: (id: string) => void;
  searchTerm?: string;
}

export default function GoalsSection({
  goals,
  onAddGoal,
  onUpdateGoalProgress,
  onToggleGoalComplete,
  onDeleteGoal,
  searchTerm = '',
}: GoalsSectionProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<GoalCategory>('health');
  const [targetValue, setTargetValue] = useState(10);
  const [unit, setUnit] = useState('km');
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [deadline, setDeadline] = useState('');

  // Process and search-filter goals
  const processedGoals = goals.filter((g) => {
    // 1. Search term match
    const matchesSearch = g.title.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    // 2. Tab filter match
    if (filter === 'active') return !g.completed && g.currentValue < g.targetValue;
    if (filter === 'completed') return g.completed || g.currentValue >= g.targetValue;
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddGoal({
      title,
      category,
      targetValue: Number(targetValue),
      currentValue: 0,
      unit,
      period,
      completed: false,
      deadline: deadline || undefined,
    });

    // Reset form
    setTitle('');
    setCategory('health');
    setTargetValue(10);
    setUnit('km');
    setPeriod('weekly');
    setDeadline('');
    setShowAddForm(false);
  };

  const handleQuickIncrement = (id: string, current: number, target: number, unit: string) => {
    let increment = 1;
    if (unit.toLowerCase() === '$' || unit.toLowerCase() === 'usd' || unit.toLowerCase() === 'credits') increment = 50;
    else if (unit.toLowerCase() === 'ml') increment = 250;
    else if (unit.toLowerCase() === 'steps') increment = 1000;
    else if (unit.toLowerCase() === 'km') increment = 2;

    onUpdateGoalProgress(id, Math.min(current + increment, target));
  };

  const handleQuickDecrement = (id: string, current: number) => {
    onUpdateGoalProgress(id, Math.max(current - 1, 0));
  };

  // Stats for local Goals KPI Section
  const totalCount = goals.length;
  const completedCount = goals.filter((g) => g.completed || g.currentValue >= g.targetValue).length;
  const activeCount = totalCount - completedCount;
  const aggregateSuccessRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6" id="goals-section-root">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300 tracking-tight flex items-center gap-2">
            <Target className="w-8 h-8 text-cyan-400" />
            <span>Target Milestones</span>
          </h1>
          <p className="text-slate-400 mt-1">
            Establish high-value health, financial, project, and personal performance goals.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-cyan-500/10"
          id="btn-toggle-add-goal"
        >
          <Plus className="w-4 h-4" />
          <span>Add Goal Metric</span>
        </button>
      </div>

      {/* Mini Stats Bar inside Goals Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Aggregate Goals</span>
          <p className="text-xl font-display font-bold text-white mt-1">{totalCount} items</p>
        </div>
        <div className="glass-panel p-4 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold">Completed</span>
          <p className="text-xl font-display font-bold text-emerald-400 mt-1">{completedCount} items</p>
        </div>
        <div className="glass-panel p-4 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold">Active Sprints</span>
          <p className="text-xl font-display font-bold text-cyan-400 mt-1">{activeCount} items</p>
        </div>
        <div className="glass-panel p-4 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] text-purple-400 uppercase tracking-widest font-bold">Completion Rate</span>
          <p className="text-xl font-display font-bold text-purple-400 mt-1">{aggregateSuccessRate}%</p>
        </div>
      </div>

      {/* Add Goal Form Card */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 rounded-2xl relative overflow-hidden"
          id="add-goal-form"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl" />
          <h2 className="text-base font-display font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-4.5 h-4.5 text-cyan-400" />
            <span>Provision New Target Objective</span>
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-slate-400">Goal Objective Title</label>
                <input
                  type="text"
                  placeholder="e.g. Complete quarterly cloud architecture review"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500/50"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Venture Category</label>
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
                <label className="text-xs font-semibold text-slate-400">Duration Period</label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as 'daily' | 'weekly' | 'monthly')}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-hidden focus:border-cyan-500/50"
                >
                  <option value="daily">Daily Goal</option>
                  <option value="weekly">Weekly Target</option>
                  <option value="monthly">Monthly Milestone</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Target Value</label>
                <input
                  type="number"
                  min="1"
                  value={targetValue}
                  onChange={(e) => setTargetValue(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-hidden focus:border-cyan-500/50"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Unit of Measurement</label>
                <input
                  type="text"
                  placeholder="e.g. km, books, $, times"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-hidden focus:border-cyan-500/50"
                  required
                />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-slate-400">Target Deadline (Optional)</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-hidden focus:border-cyan-500/50"
                />
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
                Launch Objective
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Tabs Filter Controls */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-900 rounded-xl max-w-sm">
        {['all', 'active', 'completed'].map((tabOpt) => (
          <button
            key={tabOpt}
            onClick={() => setFilter(tabOpt as any)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
              filter === tabOpt
                ? 'bg-slate-900 border border-slate-800 text-cyan-400 font-bold'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {tabOpt}
          </button>
        ))}
      </div>

      {/* Goals Output Stream */}
      {processedGoals.length === 0 ? (
        <div className="glass-panel py-16 text-center text-slate-500 rounded-2xl text-xs space-y-2">
          <Target className="w-10 h-10 mx-auto text-slate-800" />
          <p className="font-semibold text-slate-400">No active goal objectives match current filters.</p>
          <p className="text-[11px]">Deploy a new milestone target to kick off your records!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {processedGoals.map((g) => {
            const styles = getCategoryStyles(g.category);
            const isFinished = g.completed || g.currentValue >= g.targetValue;
            const completionPercent = Math.min(Math.round((g.currentValue / g.targetValue) * 100), 100);

            return (
              <motion.div
                key={g.id}
                layout
                className="glass-panel p-5 rounded-2xl flex flex-col justify-between gap-4 hover:border-slate-700/80 transition-all group"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <span className={`text-[8px] uppercase font-extrabold tracking-widest px-2 py-0.5 rounded-full ${styles.bg} ${styles.text}`}>
                      {getCategoryEmoji(g.category)} {styles.label}
                    </span>
                    <span className="text-[9px] uppercase font-mono text-slate-500 font-bold">
                      {g.period} target
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-200 text-sm leading-snug group-hover:text-white transition-colors">
                    {g.title}
                  </h3>

                  {g.deadline && (
                    <p className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-slate-600" />
                      Target Date: {g.deadline}
                    </p>
                  )}
                </div>

                {/* Progress bar and incremental telemetry updates */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end text-[11px] font-mono">
                    <span className="text-slate-400">Progress</span>
                    <span className="text-white font-bold">
                      {g.currentValue} / {g.targetValue} <span className="text-slate-500 font-sans">{g.unit}</span> ({completionPercent}%)
                    </span>
                  </div>

                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        isFinished
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          : 'bg-gradient-to-r from-cyan-400 to-blue-500'
                      }`}
                      style={{ width: `${completionPercent}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center pt-2 gap-2">
                    
                    {/* Telemetry quick values */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleQuickDecrement(g.id, g.currentValue)}
                        className="w-7 h-7 bg-slate-900 hover:bg-slate-800 border border-slate-800/80 rounded-lg flex items-center justify-center text-xs text-slate-400 hover:text-white font-mono cursor-pointer transition-colors"
                        title="Decrement -1"
                      >
                        -
                      </button>
                      <button
                        onClick={() => handleQuickIncrement(g.id, g.currentValue, g.targetValue, g.unit)}
                        className="px-2.5 h-7 bg-slate-900 hover:bg-slate-800 border border-slate-800/80 rounded-lg flex items-center justify-center text-xs text-cyan-400 hover:text-cyan-300 font-bold cursor-pointer transition-colors"
                        title="Quick telemetry increment"
                      >
                        + Accumulate
                      </button>
                    </div>

                    {/* Check complete toggle & delete */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onToggleGoalComplete(g.id)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          isFinished
                            ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-400'
                            : 'bg-slate-900 hover:bg-slate-800 border-slate-800/80 text-slate-500 hover:text-slate-300'
                        }`}
                        title={isFinished ? 'Re-open milestone' : 'Mark complete'}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete goal objective "${g.title}"?`)) {
                            onDeleteGoal(g.id);
                          }
                        }}
                        className="p-1.5 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 text-red-400 rounded-lg cursor-pointer transition-all"
                        title="Delete goal objective"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                </div>

              </motion.div>
            );
          })}
        </div>
      )}

    </div>
  );
}
