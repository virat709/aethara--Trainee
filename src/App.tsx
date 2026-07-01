import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Target,
  Flame,
  Activity,
  Calendar,
  RotateCcw,
  Sparkles,
  Heart,
  Search,
  Bell,
  Settings,
  X,
  Check,
  Award,
  Sliders,
  Shield,
  Clock,
  Droplet,
  ChevronDown,
  Sun,
  Moon,
  Menu,
  CloudOff,
  RefreshCw
} from 'lucide-react';
import { Goal, Habit, DailyLog, ScheduleEvent } from './types';
import {
  INITIAL_GOALS,
  INITIAL_HABITS,
  INITIAL_LOGS,
  INITIAL_EVENTS,
} from './data';
import Dashboard from './components/Dashboard';
import GoalsSection from './components/GoalsSection';
import HabitsSection from './components/HabitsSection';
import LogsSection from './components/LogsSection';
import CalendarSection from './components/CalendarSection';
import ThreeDBackground from './components/ThreeDBackground';

const safeGetItem = (key: string, fallback: string): string => {
  try {
    return localStorage.getItem(key) || fallback;
  } catch (e) {
    return fallback;
  }
};

const safeGetJSON = <T,>(key: string, fallback: T): T => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (e) {
    return fallback;
  }
};

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = safeGetItem('tracker_theme', 'dark');
    return saved === 'dark';
  });

  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'restricted'>('synced');
  const [syncMessage, setSyncMessage] = useState<string>('All changes saved to local cache');
  const syncTimeoutRef = React.useRef<any>(null);
  const isRestrictedRef = React.useRef<boolean>(false);
  const isFirstMountRef = React.useRef<boolean>(true);

  // Initialize and check environment storage accessibility
  useEffect(() => {
    try {
      const testKey = '__aethera_storage_test__';
      localStorage.setItem(testKey, 'ok');
      localStorage.removeItem(testKey);
      isRestrictedRef.current = false;
      setSyncStatus('synced');
      setSyncMessage('All data verified and persistent');
    } catch (e) {
      isRestrictedRef.current = true;
      setSyncStatus('restricted');
      setSyncMessage('Storage restricted: Running in transient mode');
    }

    // Mark initialization complete after brief delay to avoid triggers on initial mount
    const timer = setTimeout(() => {
      isFirstMountRef.current = false;
    }, 150);

    return () => {
      clearTimeout(timer);
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  const performSave = React.useCallback((key: string, value: string) => {
    if (isRestrictedRef.current) {
      setSyncStatus('restricted');
      setSyncMessage('Storage restricted: Running in transient mode');
      return;
    }

    if (isFirstMountRef.current) {
      return;
    }

    try {
      setSyncStatus('saving');
      setSyncMessage('Saving telemetry updates...');

      localStorage.setItem(key, value);

      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }

      syncTimeoutRef.current = setTimeout(() => {
        setSyncStatus('synced');
        setSyncMessage('All changes saved to local cache');
      }, 700);
    } catch (e) {
      isRestrictedRef.current = true;
      setSyncStatus('restricted');
      setSyncMessage('Storage restricted: Running in transient mode');
    }
  }, []);

  useEffect(() => {
    performSave('tracker_theme', darkMode ? 'dark' : 'light');
    const shell = document.getElementById('app-shell');
    if (shell) {
      if (darkMode) {
        shell.classList.remove('light-mode');
      } else {
        shell.classList.add('light-mode');
      }
    }
  }, [darkMode, performSave]);

  // Load state from localStorage or fallback to initial high-fidelity mock data
  const [goals, setGoals] = useState<Goal[]>(() => safeGetJSON('tracker_goals', INITIAL_GOALS));
  const [habits, setHabits] = useState<Habit[]>(() => safeGetJSON('tracker_habits', INITIAL_HABITS));
  const [logs, setLogs] = useState<DailyLog[]>(() => safeGetJSON('tracker_logs', INITIAL_LOGS));
  const [events, setEvents] = useState<ScheduleEvent[]>(() => safeGetJSON('tracker_events', INITIAL_EVENTS));

  // User Customizable Settings (Enterprise Quality)
  const [userName, setUserName] = useState<string>(() => {
    return safeGetItem('tracker_user_name', 'Vishnu Virat');
  });
  const [userEmail, setUserEmail] = useState<string>(() => {
    return safeGetItem('tracker_user_email', 'vishnuvirat709@gmail.com');
  });
  const [waterTarget, setWaterTarget] = useState<number>(() => {
    const saved = safeGetItem('tracker_water_target', '2000');
    return Number(saved);
  });
  const [stepsTarget, setStepsTarget] = useState<number>(() => {
    const saved = safeGetItem('tracker_steps_target', '10000');
    return Number(saved);
  });
  const [sleepTarget, setSleepTarget] = useState<number>(() => {
    const saved = safeGetItem('tracker_sleep_target', '8');
    return Number(saved);
  });

  // Persist state changes in localStorage
  useEffect(() => {
    performSave('tracker_goals', JSON.stringify(goals));
  }, [goals, performSave]);

  useEffect(() => {
    performSave('tracker_habits', JSON.stringify(habits));
  }, [habits, performSave]);

  useEffect(() => {
    performSave('tracker_logs', JSON.stringify(logs));
  }, [logs, performSave]);

  useEffect(() => {
    performSave('tracker_events', JSON.stringify(events));
  }, [events, performSave]);

  useEffect(() => {
    performSave('tracker_user_name', userName);
  }, [userName, performSave]);

  useEffect(() => {
    performSave('tracker_user_email', userEmail);
  }, [userEmail, performSave]);

  useEffect(() => {
    performSave('tracker_water_target', String(waterTarget));
  }, [waterTarget, performSave]);

  useEffect(() => {
    performSave('tracker_steps_target', String(stepsTarget));
  }, [stepsTarget, performSave]);

  useEffect(() => {
    performSave('tracker_sleep_target', String(sleepTarget));
  }, [sleepTarget, performSave]);

  // Dynamic system notifications generated based on habits & wellness logs
  const dynamicNotifications = React.useMemo(() => {
    const list = [];
    const todayStr = new Date().toISOString().split('T')[0];
    const todayLog = logs.find(l => l.date === todayStr);

    if (!todayLog || todayLog.waterIntake < waterTarget * 0.4) {
      list.push({
        id: 'n_water',
        title: 'Hydration Level Low',
        description: `You've registered minimal water intake today. Drink at least 500ml now to stay fresh.`,
        type: 'warning',
        time: 'Just now'
      });
    }

    const pendingEvents = events.filter(e => e.date === todayStr && !e.completed);
    if (pendingEvents.length > 0) {
      list.push({
        id: 'n_schedule',
        title: 'Upcoming Events Active',
        description: `You have ${pendingEvents.length} scheduled sprint milestones left to complete today.`,
        type: 'info',
        time: '15m ago'
      });
    }

    const activeStreaks = habits.map(h => {
      const dates = h.completedDates;
      return dates.includes(todayStr) ? 1 : 0;
    }).reduce((a, b) => a + b, 0);

    if (activeStreaks === habits.length) {
      list.push({
        id: 'n_streak',
        title: 'Daily Habits Mastered!',
        description: `Flawless execution! You checked off all habits today. Streak multiplier online.`,
        type: 'success',
        time: '2h ago'
      });
    } else {
      list.push({
        id: 'n_streak_pending',
        title: 'Pending Routines',
        description: `Don't break your momentum. You still have active routine habits waiting for completion today.`,
        type: 'info',
        time: '1h ago'
      });
    }

    return list;
  }, [logs, events, habits, waterTarget]);

  // Goal updates
  const handleAddGoal = (newGoal: Omit<Goal, 'id' | 'createdAt'>) => {
    const goal: Goal = {
      ...newGoal,
      id: `g_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setGoals((prev) => [goal, ...prev]);
  };

  const handleUpdateGoalProgress = (id: string, value: number) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const nextValue = Math.min(value, g.targetValue);
        const nextCompleted = nextValue >= g.targetValue;
        return {
          ...g,
          currentValue: nextValue,
          completed: nextCompleted,
        };
      })
    );
  };

  const handleToggleGoalComplete = (id: string) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const nextCompleted = !g.completed;
        return {
          ...g,
          completed: nextCompleted,
          currentValue: nextCompleted ? g.targetValue : 0,
        };
      })
    );
  };

  const handleDeleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  // Habit updates
  const handleAddHabit = (newHabit: Omit<Habit, 'id' | 'completedDates' | 'createdAt'>) => {
    const habit: Habit = {
      ...newHabit,
      id: `h_${Date.now()}`,
      completedDates: [],
      createdAt: new Date().toISOString(),
    };
    setHabits((prev) => [habit, ...prev]);
  };

  const handleToggleHabit = (id: string, dateStr: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        const exists = h.completedDates.includes(dateStr);
        const nextDates = exists
          ? h.completedDates.filter((d) => d !== dateStr)
          : [...h.completedDates, dateStr];
        return {
          ...h,
          completedDates: nextDates,
        };
      })
    );
  };

  const handleDeleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  // Log updates
  const handleAddOrUpdateLog = (
    newLog: Omit<DailyLog, 'id' | 'createdAt'> & { id?: string }
  ) => {
    setLogs((prev) => {
      const existingIdx = prev.findIndex((l) => l.date === newLog.date);
      if (existingIdx !== -1) {
        // Update existing log
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          ...newLog,
        };
        return updated;
      } else {
        // Create new log
        const log: DailyLog = {
          ...newLog,
          id: `l_${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        return [log, ...prev];
      }
    });
  };

  // Helper for quick logging metrics (e.g. from Dashboard buttons)
  const handleQuickLog = (partialLog: Partial<DailyLog> & { date: string }) => {
    setLogs((prev) => {
      const existingIdx = prev.findIndex((l) => l.date === partialLog.date);
      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          ...partialLog,
        };
        return updated;
      } else {
        // Hydrate with defaults
        const log: DailyLog = {
          id: `l_${Date.now()}`,
          date: partialLog.date,
          waterIntake: partialLog.waterIntake ?? 0,
          waterTarget: waterTarget,
          steps: partialLog.steps ?? 0,
          stepsTarget: stepsTarget,
          sleepHours: partialLog.sleepHours ?? 7,
          sleepTarget: sleepTarget,
          mood: partialLog.mood ?? 4,
          notes: partialLog.notes ?? '',
          createdAt: new Date().toISOString(),
        };
        return [log, ...prev];
      }
    });
  };

  const handleDeleteLog = (id: string) => {
    setLogs((prev) => prev.filter((l) => l.id !== id));
  };

  // Event updates
  const handleAddEvent = (newEvent: Omit<ScheduleEvent, 'id'>) => {
    const event: ScheduleEvent = {
      ...newEvent,
      id: `e_${Date.now()}`,
    };
    setEvents((prev) => [...prev, event]);
  };

  const handleToggleEventComplete = (id: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, completed: !e.completed } : e))
    );
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  // Reset or flush local changes to restore the high-fidelity template states
  const handleRestoreTemplateData = () => {
    if (
      window.confirm(
        'Are you sure you want to restore the initial demo tracker entries? This will replace any custom changes you’ve recorded.'
      )
    ) {
      setGoals(INITIAL_GOALS);
      setHabits(INITIAL_HABITS);
      setLogs(INITIAL_LOGS);
      setEvents(INITIAL_EVENTS);
      setWaterTarget(2000);
      setStepsTarget(10000);
      setSleepTarget(8);
      setUserName('Vishnu Virat');
      setUserEmail('vishnuvirat709@gmail.com');
      localStorage.removeItem('tracker_goals');
      localStorage.removeItem('tracker_habits');
      localStorage.removeItem('tracker_logs');
      localStorage.removeItem('tracker_events');
      localStorage.removeItem('tracker_water_target');
      localStorage.removeItem('tracker_steps_target');
      localStorage.removeItem('tracker_sleep_target');
      localStorage.removeItem('tracker_user_name');
      localStorage.removeItem('tracker_user_email');
    }
  };

  // Active Tab View selector
  const renderActiveView = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <Dashboard
            goals={goals}
            habits={habits}
            logs={logs}
            events={events}
            onToggleHabit={handleToggleHabit}
            onQuickLog={handleQuickLog}
            setCurrentTab={setCurrentTab}
            searchTerm={globalSearch}
            waterTarget={waterTarget}
            stepsTarget={stepsTarget}
            sleepTarget={sleepTarget}
            darkMode={darkMode}
          />
        );
      case 'goals':
        return (
          <GoalsSection
            goals={goals}
            onAddGoal={handleAddGoal}
            onUpdateGoalProgress={handleUpdateGoalProgress}
            onToggleGoalComplete={handleToggleGoalComplete}
            onDeleteGoal={handleDeleteGoal}
            searchTerm={globalSearch}
          />
        );
      case 'habits':
        return (
          <HabitsSection
            habits={habits}
            onAddHabit={handleAddHabit}
            onToggleHabit={handleToggleHabit}
            onDeleteHabit={handleDeleteHabit}
            searchTerm={globalSearch}
          />
        );
      case 'logs':
        return (
          <LogsSection
            logs={logs}
            onAddOrUpdateLog={handleAddOrUpdateLog}
            onDeleteLog={handleDeleteLog}
            searchTerm={globalSearch}
            waterTarget={waterTarget}
            stepsTarget={stepsTarget}
            sleepTarget={sleepTarget}
          />
        );
      case 'calendar':
        return (
          <CalendarSection
            events={events}
            habits={habits}
            onAddEvent={handleAddEvent}
            onToggleEventComplete={handleToggleEventComplete}
            onDeleteEvent={handleDeleteEvent}
            searchTerm={globalSearch}
          />
        );
      case 'settings':
        return (
          <div className="space-y-6" id="settings-section">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 tracking-tight flex items-center gap-2">
                  <Settings className="w-8 h-8 text-cyan-400" />
                  <span>SaaS System Settings</span>
                </h1>
                <p className="text-slate-400 mt-1">Configure your personal health targets, workspace profile details, and telemetry rules.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile Config Card */}
              <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 font-display">
                  <Award className="w-5 h-5 text-purple-400" />
                  <span>Enterprise Profile Settings</span>
                </h2>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400">Full Name</label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full bg-slate-900/60 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-hidden transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400">Workstation Email Address</label>
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-full bg-slate-900/60 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-hidden transition-colors"
                    />
                  </div>
                  <div className="p-3.5 bg-cyan-950/20 border border-cyan-800/40 rounded-xl space-y-1">
                    <span className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-widest">Active License</span>
                    <p className="text-xs font-bold text-white">SaaS Professional Plan • Pro Active</p>
                    <p className="text-[10px] text-slate-400">Billed monthly. Subscribed since June 2026.</p>
                  </div>
                </div>
              </div>

              {/* Targets Config Card */}
              <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl" />
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 font-display">
                  <Sliders className="w-5 h-5 text-cyan-400" />
                  <span>Daily Health & Wellness Benchmarks</span>
                </h2>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <label className="font-semibold text-slate-400">Daily Water Target (ml)</label>
                      <span className="text-cyan-400 font-bold">{waterTarget} ml</span>
                    </div>
                    <input
                      type="range"
                      min="1000"
                      max="4000"
                      step="250"
                      value={waterTarget}
                      onChange={(e) => setWaterTarget(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <label className="font-semibold text-slate-400">Daily Steps Goal</label>
                      <span className="text-purple-400 font-bold">{stepsTarget.toLocaleString()} steps</span>
                    </div>
                    <input
                      type="range"
                      min="4000"
                      max="20000"
                      step="500"
                      value={stepsTarget}
                      onChange={(e) => setStepsTarget(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <label className="font-semibold text-slate-400">Sleep Target Hours</label>
                      <span className="text-amber-400 font-bold">{sleepTarget} hours</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="12"
                      step="0.5"
                      value={sleepTarget}
                      onChange={(e) => setSleepTarget(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    />
                  </div>

                  <div className="p-3 bg-purple-950/20 border border-purple-800/40 rounded-xl">
                    <p className="text-xs text-purple-200 font-medium">✨ Target adjustments will take effect across the active Dashboard, manual wellness logger, and system insight telemetry systems instantly.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions / Reset System */}
            <div className="glass-panel p-6 rounded-2xl">
              <h2 className="text-lg font-bold text-white mb-2 font-display">Administrative Operations</h2>
              <p className="text-xs text-slate-400 mb-4">Reset telemetry storage to original default simulation data, or restore cached cloud states.</p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleRestoreTemplateData}
                  className="px-4 py-2.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-200 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Restore Demo High-Fidelity Records
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Sidebar navigation options
  const sidebarNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'habits', label: 'Habits', icon: Flame },
    { id: 'logs', label: 'Daily Logs', icon: Activity },
    { id: 'calendar', label: 'Scheduler', icon: Calendar },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-cyber-dark text-slate-100 flex flex-col md:flex-row font-sans" id="app-shell">
      
      {/* Interactive 3D Background Engine */}
      <ThreeDBackground darkMode={darkMode} />

      {/* Mobile Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Side Navigation Rail */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-950 flex flex-col justify-between border-r border-slate-900 shadow-2xl transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } shrink-0`}>
        <div className="p-6 space-y-8">
          
          {/* Main Logo Header */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg border border-slate-800/80 p-0.5 bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 shrink-0">
                <img
                  src="/src/assets/images/app_logo_1782907414969.jpg"
                  alt="Aethera Logo"
                  className="w-full h-full object-cover rounded-[10px]"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h2 className="font-display font-extrabold text-base tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300">
                  Aethera
                </h2>
                <span className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-widest mt-1 block">
                  SaaS Wellness VM
                </span>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden p-1.5 rounded-lg border border-slate-850 text-slate-400 hover:text-white hover:border-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5" id="sidebar-nav">
            {sidebarNavItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    setGlobalSearch('');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-between cursor-pointer text-left group relative ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-950/40 to-indigo-950/40 border border-cyan-500/20 text-white shadow-[0_0_15px_rgba(6,182,212,0.08)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <IconComponent className={`w-4 h-4 transition-all ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-300'}`} />
                    <span className="font-display font-medium tracking-wide">{item.label}</span>
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-indicator"
                      className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-xs"
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card Profile & Reset Button */}
        <div className="p-4 border-t border-slate-900 space-y-4">
          
          {/* User profile details customized */}
          <div className="flex items-center gap-3 p-2 bg-slate-900/50 rounded-xl border border-slate-800/60">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 text-white font-extrabold flex items-center justify-center text-xs shadow-md">
              {userName.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-200 truncate leading-none">
                {userName}
              </p>
              <span className="text-[8px] bg-cyan-950 text-cyan-400 border border-cyan-800/30 px-1.5 py-0.5 rounded-full font-extrabold uppercase mt-1 inline-block tracking-widest">
                PRO ACTIVE
              </span>
            </div>
          </div>

          {/* Restore Template Trigger */}
          <button
            onClick={handleRestoreTemplateData}
            className="w-full px-3.5 py-2.5 border border-slate-900 hover:border-slate-800 hover:bg-slate-900/40 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
            id="btn-restore-template"
            title="Restore initial high-fidelity template records"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500 group-hover:rotate-180 transition-transform duration-500" />
            <span>Restore Demo Entries</span>
          </button>
        </div>
      </aside>

      {/* Primary Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        
        {/* Sticky Header Top Navigation (Linear / Vercel style) */}
        <header className="sticky top-0 bg-cyber-dark/80 backdrop-blur-xl border-b border-slate-900/80 p-3 sm:p-4 flex items-center justify-between gap-2 sm:gap-4 z-50">
          
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-xl border border-slate-800 bg-slate-950 text-slate-400 hover:text-white hover:border-slate-700 cursor-pointer flex items-center justify-center shrink-0"
            title="Open Menu"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Active section info */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-medium font-mono">
            <span>workspace</span>
            <span className="text-slate-600">/</span>
            <span className="text-cyan-400 font-bold capitalize">{currentTab}</span>
          </div>

          {/* Interactive Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search across active ${currentTab} telemetry...`}
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full bg-slate-900/40 border border-slate-800/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500/50 transition-colors"
            />
            {globalSearch && (
              <button
                onClick={() => setGlobalSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-800 text-slate-400"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Notifications and Profile Widgets */}
          <div className="flex items-center gap-3 relative">
            
            {/* Sync Status Indicator Capsule */}
            <div
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border bg-slate-950 text-[10px] font-bold font-mono select-none cursor-help transition-all ${
                syncStatus === 'saving'
                  ? 'border-cyan-500/30 text-cyan-400 bg-cyan-950/10 shadow-sm shadow-cyan-500/5'
                  : syncStatus === 'synced'
                  ? 'border-emerald-500/20 text-slate-300 hover:text-white bg-slate-900/30'
                  : 'border-amber-500/30 text-amber-500 bg-amber-950/10 shadow-sm shadow-amber-500/5 animate-pulse'
              }`}
              title={syncMessage}
            >
              {syncStatus === 'saving' && (
                <>
                  <RefreshCw className="w-3 h-3 text-cyan-400 animate-spin shrink-0" />
                  <span className="hidden sm:inline-block">TELEMETRY SAVING</span>
                  <span className="inline-block sm:hidden">SAVING</span>
                </>
              )}
              {syncStatus === 'synced' && (
                <>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/50 shrink-0" />
                  <span className="hidden sm:inline-block text-slate-400">TELEMETRY SYNCED</span>
                  <span className="inline-block sm:hidden text-slate-400">SYNCED</span>
                </>
              )}
              {syncStatus === 'restricted' && (
                <>
                  <CloudOff className="w-3 h-3 text-amber-500 shrink-0" />
                  <span className="hidden sm:inline-block">TRANSIENT MODE</span>
                  <span className="inline-block sm:hidden">TRANSIENT</span>
                </>
              )}
            </div>

            {/* Theme Toggle Trigger */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl transition-all border bg-slate-950 border-slate-900 text-slate-400 hover:text-white hover:border-slate-800 cursor-pointer flex items-center justify-center"
              id="theme-mode-toggle"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500" />
              )}
            </button>

            {/* Notifications Trigger */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileMenu(false);
                }}
                className={`p-2 rounded-xl transition-all border relative cursor-pointer ${
                  showNotifications
                    ? 'bg-slate-900 border-cyan-500/40 text-cyan-400'
                    : 'bg-slate-950 border-slate-900 text-slate-400 hover:text-white hover:border-slate-800'
                }`}
              >
                <Bell className="w-4 h-4" />
                {dynamicNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-cyber-dark animate-pulse" />
                )}
              </button>

              {/* Notifications Dropdown Panel (Glassmorphic design) */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2.5 w-80 max-w-[calc(100vw-2rem)] bg-slate-950/95 border border-slate-800 rounded-2xl shadow-2xl p-4 space-y-3 z-50 backdrop-blur-xl"
                  >
                    <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                      <span className="text-xs font-bold text-white font-display">System Alerts</span>
                      <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800/30 px-2 py-0.5 rounded-full font-bold">
                        {dynamicNotifications.length} Active
                      </span>
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
                      {dynamicNotifications.length === 0 ? (
                        <p className="text-xs text-slate-500 text-center py-4">No active system notifications or wellness recommendations.</p>
                      ) : (
                        dynamicNotifications.map(notif => (
                          <div key={notif.id} className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/80 text-left space-y-1">
                            <div className="flex justify-between items-center">
                              <span className={`text-[10px] font-bold ${notif.type === 'warning' ? 'text-orange-400' : 'text-cyan-400'}`}>
                                {notif.title}
                              </span>
                              <span className="text-[9px] text-slate-500 font-mono">{notif.time}</span>
                            </div>
                            <p className="text-[11px] text-slate-300 leading-normal">{notif.description}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown Menu Trigger */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-950 border border-slate-900 text-left hover:border-slate-800 transition-all cursor-pointer"
              >
                <div className="w-6.5 h-6.5 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 text-white font-extrabold flex items-center justify-center text-[10px]">
                  {userName.split(' ').map(n => n[0]).join('')}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2.5 w-56 max-w-[calc(100vw-2rem)] bg-slate-950/95 border border-slate-800 rounded-2xl shadow-2xl p-3 space-y-2 z-50 backdrop-blur-xl text-left"
                  >
                    <div className="px-2 py-1.5">
                      <p className="text-xs font-bold text-white leading-none">{userName}</p>
                      <p className="text-[10px] text-slate-500 mt-1 truncate">{userEmail}</p>
                    </div>
                    <div className="border-t border-slate-900 my-1" />
                    <button
                      onClick={() => {
                        setCurrentTab('settings');
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-900 transition-all cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Configure Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        setCurrentTab('dashboard');
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-900 transition-all cursor-pointer"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-purple-400" />
                      <span>My Analytics VM</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

        </header>

        {/* Main Content Pane */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto w-full max-w-7xl mx-auto space-y-8">
          
          {/* Render Active Module with Elegant Transition */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
          
          {/* Footer Credit */}
          <footer className="pt-8 border-t border-slate-900/60 flex justify-between items-center text-xs text-slate-500 font-medium font-mono">
            <span className="flex items-center gap-1.5">
              Powered by <Heart className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/20" /> enterprise wellness engine
            </span>
            <span>© 2026 Aethera Analytics Platform v3.5</span>
          </footer>
        </main>

      </div>

    </div>
  );
}
