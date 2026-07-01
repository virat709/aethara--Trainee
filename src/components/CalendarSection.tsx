import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Trash2,
  Sparkles,
  MapPin,
  Flame,
} from 'lucide-react';
import { ScheduleEvent, Habit, GoalCategory } from '../types';
import {
  getTodayDateString,
  getCategoryStyles,
  formatDateString,
  formatHumanDate,
} from '../utils';

interface CalendarSectionProps {
  events: ScheduleEvent[];
  habits: Habit[];
  onAddEvent: (event: Omit<ScheduleEvent, 'id'>) => void;
  onToggleEventComplete: (id: string) => void;
  onDeleteEvent: (id: string) => void;
  searchTerm?: string;
}

export default function CalendarSection({
  events,
  habits,
  onAddEvent,
  onToggleEventComplete,
  onDeleteEvent,
  searchTerm = '',
}: CalendarSectionProps) {
  const todayStr = getTodayDateString();
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date(2026, 6, 1)); // Default July 1, 2026
  const [selectedDateStr, setSelectedDateStr] = useState(todayStr);
  const [showAddForm, setShowAddForm] = useState(false);

  // Add Event Form State
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [category, setCategory] = useState<GoalCategory>('health');
  const [notes, setNotes] = useState('');

  // Calendar math
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const monthName = currentMonthDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const calendarCells = useMemo(() => {
    // Days in current month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // First day of current month (0 is Sun, 6 is Sat)
    const firstDayIndex = new Date(year, month, 1).getDay();

    const cells = [];

    // Prev month days to backfill
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const mStr = String(prevMonth + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      cells.push({
        dayNum: d,
        dateStr: `${prevYear}-${mStr}-${dStr}`,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const mStr = String(month + 1).padStart(2, '0');
      const dStr = String(i).padStart(2, '0');
      cells.push({
        dayNum: i,
        dateStr: `${year}-${mStr}-${dStr}`,
        isCurrentMonth: true,
      });
    }

    // Next month days to pad to full weeks (multiple of 7, 42 cells total)
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const mStr = String(nextMonth + 1).padStart(2, '0');
      const dStr = String(i).padStart(2, '0');
      cells.push({
        dayNum: i,
        dateStr: `${nextYear}-${mStr}-${dStr}`,
        isCurrentMonth: false,
      });
    }

    return cells;
  }, [year, month]);

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const handleGoToday = () => {
    const today = new Date();
    setCurrentMonthDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDateStr(todayStr);
  };

  // Compute indicators for each dateStr to render on calendar cells (number of events & completed habits)
  const cellIndicators = useMemo(() => {
    const map: Record<string, { eventsCount: number; completedHabitsCount: number }> = {};

    events.forEach((e) => {
      if (!map[e.date]) map[e.date] = { eventsCount: 0, completedHabitsCount: 0 };
      map[e.date].eventsCount++;
    });

    habits.forEach((h) => {
      h.completedDates.forEach((dateStr) => {
        if (!map[dateStr]) map[dateStr] = { eventsCount: 0, completedHabitsCount: 0 };
        map[dateStr].completedHabitsCount++;
      });
    });

    return map;
  }, [events, habits]);

  // List of events for the SELECTED date (filtered by search term)
  const selectedDateEvents = useMemo(() => {
    return events
      .filter((e) => e.date === selectedDateStr)
      .filter((e) => e.title.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [events, selectedDateStr, searchTerm]);

  // List of habits completed on the SELECTED date
  const selectedDateHabits = useMemo(() => {
    return habits.filter((h) => h.completedDates.includes(selectedDateStr));
  }, [habits, selectedDateStr]);

  const handleAddEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddEvent({
      title,
      date: selectedDateStr,
      startTime,
      endTime,
      category,
      notes: notes.trim() || undefined,
      completed: false,
    });

    // Reset Form
    setTitle('');
    setStartTime('09:00');
    setEndTime('10:00');
    setCategory('health');
    setNotes('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6" id="calendar-section-root">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300 tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-8 h-8 text-cyan-400" />
            <span>SaaS Event Scheduler</span>
          </h1>
          <p className="text-slate-400 mt-1">
            Build structural daily timelines. Coordinate focus blocks, project sprints, and wellness activities.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 shadow-lg"
          id="btn-toggle-add-event"
        >
          <Plus className="w-4 h-4" />
          <span>Deploy Event block</span>
        </button>
      </div>

      {/* Grid: Interactive Month Grid (Left/Top) vs Selected Day Details (Right/Bottom) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Calendar Panel (Span 7) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl" />

            {/* Calendar Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-900/60">
              <h2 className="text-base font-display font-bold text-white flex items-center gap-2">
                <span>{monthName}</span>
              </h2>
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 border border-slate-900 rounded-xl">
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                  title="Previous month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleGoToday}
                  className="px-2.5 py-1 text-[10px] uppercase font-bold text-cyan-400 hover:bg-slate-900 rounded-lg cursor-pointer font-mono"
                >
                  TODAY
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                  title="Next month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Weekdays Headers */}
            <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider py-3.5 font-mono">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Days Matrix Cells */}
            <div className="grid grid-cols-7 gap-1.5">
              {calendarCells.map((cell, idx) => {
                const indicators = cellIndicators[cell.dateStr] || { eventsCount: 0, completedHabitsCount: 0 };
                const isSelected = selectedDateStr === cell.dateStr;
                const isTodayDate = cell.dateStr === todayStr;

                return (
                  <button
                    key={`${cell.dateStr}_${idx}`}
                    onClick={() => setSelectedDateStr(cell.dateStr)}
                    className={`min-h-16 p-2 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer relative group ${
                      !cell.isCurrentMonth
                        ? 'opacity-20 border-transparent bg-transparent'
                        : isSelected
                        ? 'bg-gradient-to-tr from-cyan-950/50 to-cyan-500/10 border-cyan-400 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.12)] scale-102'
                        : isTodayDate
                        ? 'border-slate-700 bg-slate-900/60 text-slate-200'
                        : 'border-slate-900 bg-slate-950/20 text-slate-400 hover:border-slate-800'
                    }`}
                  >
                    <span className="text-xs font-bold font-display">{cell.dayNum}</span>
                    
                    {/* Tiny telemetry dots */}
                    {(indicators.eventsCount > 0 || indicators.completedHabitsCount > 0) && (
                      <div className="flex gap-1 mt-1">
                        {indicators.eventsCount > 0 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" title={`${indicators.eventsCount} Events`} />
                        )}
                        {indicators.completedHabitsCount > 0 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-400" title={`${indicators.completedHabitsCount} Habits Complete`} />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Day details and Add event block form (Span 5) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Add Event Form Panel (Collapsible inline form) */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="glass-panel p-5 rounded-2xl relative overflow-hidden"
              >
                <h3 className="text-xs font-bold text-white uppercase tracking-widest font-display mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Configure Event Block</span>
                </h3>

                <form onSubmit={handleAddEventSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-400">Activity Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Daily Sync, Gym HIIT, Budgeting"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500/50"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-400">Start Time</label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-hidden"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-400">End Time</label>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-hidden"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-400">Activity Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as GoalCategory)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-hidden"
                    >
                      <option value="health">🌿 Health & Wellness</option>
                      <option value="work">💼 Work & Projects</option>
                      <option value="personal">🌱 Personal Growth</option>
                      <option value="finance">💰 Finance & Savings</option>
                      <option value="other">📍 Other Focus</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-400">Context / Notes (Optional)</label>
                    <textarea
                      placeholder="Add brief details about the event block..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden resize-none"
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-3 py-1.5 text-[10px] font-bold text-slate-400 hover:text-white bg-slate-900 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 text-[10px] font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg"
                    >
                      Schedule
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Selected Date telemetry list */}
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden space-y-4">
            <div className="pb-2 border-b border-slate-900/60">
              <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500 font-mono">Date Focus telemetry</span>
              <h3 className="text-base font-display font-bold text-white mt-0.5">
                {formatHumanDate(selectedDateStr)}
              </h3>
            </div>

            {/* List entries */}
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              
              {/* Scheduled events matching search query */}
              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 font-mono font-semibold block">Scheduled Sprint blocks ({selectedDateEvents.length})</span>
                {selectedDateEvents.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">No active sprints scheduled for this target block.</p>
                ) : (
                  selectedDateEvents.map((e) => {
                    const styles = getCategoryStyles(e.category);
                    return (
                      <div
                        key={e.id}
                        className="p-3 bg-slate-900/40 border border-slate-800 rounded-xl flex items-center justify-between gap-4"
                      >
                        <div className="space-y-1 min-w-0">
                          <p className={`text-xs font-bold truncate ${e.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                            {e.title}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                            <Clock className="w-3 h-3 text-cyan-400" />
                            <span>{e.startTime} - {e.endTime}</span>
                            <span>•</span>
                            <span className={styles.text}>{styles.label}</span>
                          </div>
                        </div>

                        {/* Complete & delete buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => onToggleEventComplete(e.id)}
                            className={`p-1 rounded-md border transition-colors cursor-pointer ${
                              e.completed
                                ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                                : 'border-slate-800 hover:border-slate-700 text-slate-500 hover:text-slate-300'
                            }`}
                            title={e.completed ? 'Mark pending' : 'Mark complete'}
                          >
                            <Clock className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteEvent(e.id)}
                            className="p-1 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 text-red-400 rounded-md cursor-pointer transition-all"
                            title="Delete event"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Completed Habits for that day */}
              <div className="space-y-2 pt-2 border-t border-slate-900/50">
                <span className="text-[10px] text-slate-400 font-mono font-semibold block flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span>Routines Finished ({selectedDateHabits.length})</span>
                </span>
                {selectedDateHabits.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">No habit routines registered complete on this day.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDateHabits.map((h) => {
                      const styles = getCategoryStyles(h.category);
                      return (
                        <span
                          key={h.id}
                          className={`text-[10px] font-bold px-2 py-1 rounded-lg border border-slate-850 bg-slate-900/50 text-slate-300 flex items-center gap-1`}
                        >
                          <span>✓</span>
                          <span>{h.title}</span>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
