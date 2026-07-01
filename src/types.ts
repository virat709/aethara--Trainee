export type GoalCategory = 'health' | 'work' | 'personal' | 'finance' | 'other';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string; // YYYY-MM-DD
  notes?: string;
}

export interface Budget {
  category: string;
  limit: number;
}

export interface Goal {
  id: string;
  title: string;
  category: GoalCategory;
  targetValue: number;
  currentValue: number;
  unit: string;
  period: 'daily' | 'weekly' | 'monthly';
  completed: boolean;
  createdAt: string; // ISO String
  deadline?: string; // YYYY-MM-DD
}

export interface Habit {
  id: string;
  title: string;
  category: GoalCategory;
  frequency: 'daily' | 'weekly';
  completedDates: string[]; // array of YYYY-MM-DD
  createdAt: string; // ISO String
}

export interface DailyLog {
  id: string;
  date: string; // YYYY-MM-DD
  waterIntake: number; // in ml
  waterTarget: number; // in ml
  steps: number;
  stepsTarget: number;
  sleepHours: number;
  sleepTarget: number;
  mood: number; // 1 to 5
  notes: string;
  createdAt: string; // ISO String
}

export interface ScheduleEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  category: GoalCategory;
  notes?: string;
  completed: boolean;
}
