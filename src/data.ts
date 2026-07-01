import { Goal, Habit, DailyLog, ScheduleEvent, Transaction, Budget } from './types';

export const INITIAL_GOALS: Goal[] = [
  {
    id: 'g1',
    title: 'Weekly Cardio Run',
    category: 'health',
    targetValue: 30,
    currentValue: 18,
    unit: 'km',
    period: 'weekly',
    completed: false,
    createdAt: new Date('2026-06-25T08:00:00Z').toISOString(),
    deadline: '2026-07-02'
  },
  {
    id: 'g2',
    title: 'Monthly Savings Goal',
    category: 'finance',
    targetValue: 500,
    currentValue: 350,
    unit: '₹',
    period: 'monthly',
    completed: false,
    createdAt: new Date('2026-06-01T08:00:00Z').toISOString(),
    deadline: '2026-07-31'
  },
  {
    id: 'g3',
    title: 'Read 2 Books',
    category: 'personal',
    targetValue: 2,
    currentValue: 1,
    unit: 'books',
    period: 'monthly',
    completed: false,
    createdAt: new Date('2026-06-01T08:00:00Z').toISOString(),
    deadline: '2026-07-31'
  },
  {
    id: 'g4',
    title: 'Daily Coding Practice',
    category: 'work',
    targetValue: 5,
    currentValue: 4,
    unit: 'days',
    period: 'weekly',
    completed: false,
    createdAt: new Date('2026-06-25T08:00:00Z').toISOString(),
    deadline: '2026-07-02'
  }
];

export const INITIAL_HABITS: Habit[] = [
  {
    id: 'h1',
    title: 'Morning Mindfulness',
    category: 'health',
    frequency: 'daily',
    completedDates: [
      '2026-06-25',
      '2026-06-26',
      '2026-06-27',
      '2026-06-28',
      '2026-06-29',
      '2026-06-30',
      '2026-07-01'
    ],
    createdAt: new Date('2026-06-20T08:00:00Z').toISOString()
  },
  {
    id: 'h2',
    title: '10K Daily Steps Walk',
    category: 'health',
    frequency: 'daily',
    completedDates: [
      '2026-06-25',
      '2026-06-26',
      '2026-06-28',
      '2026-06-29',
      '2026-06-30',
      '2026-07-01'
    ],
    createdAt: new Date('2026-06-20T08:00:00Z').toISOString()
  },
  {
    id: 'h3',
    title: 'Read Tech Article',
    category: 'personal',
    frequency: 'daily',
    completedDates: [
      '2026-06-25',
      '2026-06-27',
      '2026-06-28',
      '2026-06-29',
      '2026-06-30'
    ],
    createdAt: new Date('2026-06-20T08:00:00Z').toISOString()
  },
  {
    id: 'h4',
    title: 'Limit Out-of-Home Food',
    category: 'finance',
    frequency: 'daily',
    completedDates: [
      '2026-06-26',
      '2026-06-27',
      '2026-06-28',
      '2026-06-30',
      '2026-07-01'
    ],
    createdAt: new Date('2026-06-20T08:00:00Z').toISOString()
  }
];

export const INITIAL_LOGS: DailyLog[] = [
  {
    id: 'l1',
    date: '2026-06-25',
    waterIntake: 1800,
    waterTarget: 2000,
    steps: 8400,
    stepsTarget: 10000,
    sleepHours: 7.2,
    sleepTarget: 8,
    mood: 4,
    notes: 'Had a productive morning! Felt high energy after yoga session.',
    createdAt: new Date('2026-06-25T21:30:00Z').toISOString()
  },
  {
    id: 'l2',
    date: '2026-06-26',
    waterIntake: 2200,
    waterTarget: 2000,
    steps: 11200,
    stepsTarget: 10000,
    sleepHours: 8.0,
    sleepTarget: 8,
    mood: 5,
    notes: 'Exceeded steps goal! Sleep was amazing, woke up feeling rested.',
    createdAt: new Date('2026-06-26T21:45:00Z').toISOString()
  },
  {
    id: 'l3',
    date: '2026-06-27',
    waterIntake: 1500,
    waterTarget: 2000,
    steps: 5800,
    stepsTarget: 10000,
    sleepHours: 6.5,
    sleepTarget: 8,
    mood: 3,
    notes: 'Felt a bit tired today. Didn’t drink enough water. Need to adjust sleep cycle.',
    createdAt: new Date('2026-06-27T22:00:00Z').toISOString()
  },
  {
    id: 'l4',
    date: '2026-06-28',
    waterIntake: 2000,
    waterTarget: 2000,
    steps: 10400,
    stepsTarget: 10000,
    sleepHours: 7.5,
    sleepTarget: 8,
    mood: 4,
    notes: 'Sunday hike was incredible! Recharged my batteries for the week.',
    createdAt: new Date('2026-06-28T21:15:00Z').toISOString()
  },
  {
    id: 'l5',
    date: '2026-06-29',
    waterIntake: 2400,
    waterTarget: 2000,
    steps: 9200,
    stepsTarget: 10000,
    sleepHours: 7.0,
    sleepTarget: 8,
    mood: 4,
    notes: 'Intense day at work but handled it well. Hydrated well.',
    createdAt: new Date('2026-06-29T21:50:00Z').toISOString()
  },
  {
    id: 'l6',
    date: '2026-06-30',
    waterIntake: 2100,
    waterTarget: 2000,
    steps: 10200,
    stepsTarget: 10000,
    sleepHours: 8.2,
    sleepTarget: 8,
    mood: 5,
    notes: 'Solid routine today. All target parameters checked! High focus.',
    createdAt: new Date('2026-06-30T22:10:00Z').toISOString()
  },
  {
    id: 'l7',
    date: '2026-07-01',
    waterIntake: 1200,
    waterTarget: 2000,
    steps: 6400,
    stepsTarget: 10000,
    sleepHours: 7.5,
    sleepTarget: 8,
    mood: 4,
    notes: 'Midweek progress checks. Trackers are helping me stay focused.',
    createdAt: new Date('2026-07-01T15:30:00Z').toISOString()
  }
];

export const INITIAL_EVENTS: ScheduleEvent[] = [
  {
    id: 'e1',
    title: 'Gym Session & Cardio',
    date: '2026-07-01',
    startTime: '07:00',
    endTime: '08:00',
    category: 'health',
    notes: 'Focusing on high intensity interval training (HIIT).',
    completed: true
  },
  {
    id: 'e2',
    title: 'Daily Standup Meeting',
    date: '2026-07-01',
    startTime: '10:00',
    endTime: '10:30',
    category: 'work',
    notes: 'Aligning with the team on sprints and releases.',
    completed: true
  },
  {
    id: 'e3',
    title: 'Finance Review & Plan',
    date: '2026-07-01',
    startTime: '14:00',
    endTime: '15:00',
    category: 'finance',
    notes: 'Checking current month budgets, bills, and allocating savings.',
    completed: false
  },
  {
    id: 'e4',
    title: 'Read tech paper & design',
    date: '2026-07-01',
    startTime: '16:00',
    endTime: '17:30',
    category: 'personal',
    notes: 'Read up on React concurrency and performance guidelines.',
    completed: false
  },
  {
    id: 'e5',
    title: 'Strategic planning call',
    date: '2026-07-02',
    startTime: '09:30',
    endTime: '11:00',
    category: 'work',
    notes: 'Discuss Q3 milestones and deliverables.',
    completed: false
  },
  {
    id: 'e6',
    title: 'Monthly budget adjustment',
    date: '2026-06-30',
    startTime: '18:00',
    endTime: '19:00',
    category: 'finance',
    notes: 'Adjust savings targets for July.',
    completed: true
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    title: 'Monthly Salary Credit',
    amount: 4500,
    type: 'income',
    category: 'Salary',
    date: '2026-07-01',
    notes: 'Primary workstation salary credit'
  },
  {
    id: 't2',
    title: 'Monthly Apartment Rent',
    amount: 1450,
    type: 'expense',
    category: 'Housing',
    date: '2026-07-01',
    notes: 'July Rent payment auto-debit'
  },
  {
    id: 't3',
    title: 'Freelance Design Project',
    amount: 650,
    type: 'income',
    category: 'Freelance',
    date: '2026-06-28',
    notes: 'Mobile app UI mockup project'
  },
  {
    id: 't4',
    title: 'Whole Foods Grocery Run',
    amount: 145.20,
    type: 'expense',
    category: 'Groceries',
    date: '2026-06-30',
    notes: 'Weekly pantry restocking'
  },
  {
    id: 't5',
    title: 'Electric & Gas Utility Bill',
    amount: 112.40,
    type: 'expense',
    category: 'Utilities',
    date: '2026-06-29',
    notes: 'Power grid monthly payment'
  },
  {
    id: 't6',
    title: 'Friday Dinner with Friends',
    amount: 85.50,
    type: 'expense',
    category: 'Dining Out',
    date: '2026-06-26',
    notes: 'Downtown sushi spot'
  },
  {
    id: 't7',
    title: 'Premium Cloud Storage Subscription',
    amount: 15.00,
    type: 'expense',
    category: 'Subscriptions',
    date: '2026-06-27',
    notes: 'Dev resources storage'
  },
  {
    id: 't8',
    title: 'Gas Station Fuel',
    amount: 45.00,
    type: 'expense',
    category: 'Transport',
    date: '2026-06-28',
    notes: 'Car tank refill'
  },
  {
    id: 't9',
    title: 'Dividend Payout',
    amount: 42.50,
    type: 'income',
    category: 'Investments',
    date: '2026-06-25',
    notes: 'Quarterly ETF payout'
  },
  {
    id: 't10',
    title: 'Movie Tickets',
    amount: 32.00,
    type: 'expense',
    category: 'Entertainment',
    date: '2026-06-27',
    notes: 'IMAX Sci-fi movie night'
  }
];

export const INITIAL_BUDGETS: Budget[] = [
  { category: 'Housing', limit: 1500 },
  { category: 'Groceries', limit: 400 },
  { category: 'Dining Out', limit: 250 },
  { category: 'Utilities', limit: 180 },
  { category: 'Subscriptions', limit: 80 },
  { category: 'Transport', limit: 150 },
  { category: 'Entertainment', limit: 120 },
  { category: 'Other', limit: 200 }
];
