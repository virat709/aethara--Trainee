import { GoalCategory } from './types';

// Helper to get the YYYY-MM-DD string for today in local timezone
export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatHumanDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function calculateStreak(completedDates: string[]): { current: number; best: number } {
  if (completedDates.length === 0) return { current: 0, best: 0 };
  
  // Format dates consistently & unique them & sort ascending
  const uniqueDates = Array.from(new Set(completedDates.map(d => d.trim()))).sort();
  
  let best = 0;
  let currentRun = 0;
  let lastDate: Date | null = null;
  
  // Calculate best streak
  for (const dateStr of uniqueDates) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const currentDate = new Date(y, m - 1, d);
    
    if (!lastDate) {
      currentRun = 1;
    } else {
      const diffTime = currentDate.getTime() - lastDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        currentRun++;
      } else if (diffDays > 1) {
        if (currentRun > best) best = currentRun;
        currentRun = 1;
      }
    }
    lastDate = currentDate;
  }
  if (currentRun > best) best = currentRun;
  
  // Calculate current streak
  const todayStr = getTodayDateString();
  const todayDate = new Date();
  const yesterdayDate = new Date();
  yesterdayDate.setDate(todayDate.getDate() - 1);
  const yesterdayStr = formatDateString(yesterdayDate);
  
  let current = 0;
  const uniqueDatesSet = new Set(uniqueDates);
  
  if (uniqueDatesSet.has(todayStr) || uniqueDatesSet.has(yesterdayStr)) {
    const startingStr = uniqueDatesSet.has(todayStr) ? todayStr : yesterdayStr;
    const [y, m, d] = startingStr.split('-').map(Number);
    const checkDate = new Date(y, m - 1, d);
    
    while (true) {
      const checkStr = formatDateString(checkDate);
      if (uniqueDatesSet.has(checkStr)) {
        current++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }
  
  return { current, best: Math.max(best, current) };
}

export function getCategoryStyles(category: GoalCategory): {
  bg: string;
  text: string;
  border: string;
  colorHex: string;
  label: string;
} {
  switch (category) {
    case 'health':
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-950/20',
        text: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-800/50',
        colorHex: '#10b981',
        label: 'Health & Wellness',
      };
    case 'work':
      return {
        bg: 'bg-indigo-50 dark:bg-indigo-950/20',
        text: 'text-indigo-700 dark:text-indigo-400',
        border: 'border-indigo-200 dark:border-indigo-800/50',
        colorHex: '#6366f1',
        label: 'Work & Projects',
      };
    case 'personal':
      return {
        bg: 'bg-violet-50 dark:bg-violet-950/20',
        text: 'text-violet-700 dark:text-violet-400',
        border: 'border-violet-200 dark:border-violet-800/50',
        colorHex: '#8b5cf6',
        label: 'Personal Growth',
      };
    case 'finance':
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/20',
        text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-800/50',
        colorHex: '#f59e0b',
        label: 'Finance & Savings',
      };
    default:
      return {
        bg: 'bg-slate-50 dark:bg-slate-900',
        text: 'text-slate-600 dark:text-slate-400',
        border: 'border-slate-200 dark:border-slate-800',
        colorHex: '#64748b',
        label: 'Other Tasks',
      };
  }
}

export function getCategoryEmoji(category: GoalCategory): string {
  switch (category) {
    case 'health': return '🌿';
    case 'work': return '💼';
    case 'personal': return '🌱';
    case 'finance': return '💰';
    default: return '📍';
  }
}

export function getMoodDetails(mood: number): { emoji: string; label: string; color: string } {
  switch (mood) {
    case 5: return { emoji: '🥳', label: 'Amazing', color: 'text-emerald-500' };
    case 4: return { emoji: '😊', label: 'Good', color: 'text-teal-500' };
    case 3: return { emoji: '😐', label: 'Okay', color: 'text-amber-500' };
    case 2: return { emoji: '😔', label: 'Down', color: 'text-orange-500' };
    case 1: return { emoji: '😢', label: 'Stressed', color: 'text-red-500' };
    default: return { emoji: '😐', label: 'Neutral', color: 'text-slate-500' };
  }
}
