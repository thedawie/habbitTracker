export interface Habit {
  id: string;
  name: string;
  schedule: {
    days: number[]; // 0-6 for Sunday-Saturday
    frequency: 'daily' | 'weekly';
  };
  lastCompleted: Date | null;
  streak: number;
  missedOnce: boolean;
  completedDates: string[]; // Store dates as ISO strings
}