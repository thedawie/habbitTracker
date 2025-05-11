import { useState } from 'react';
import { format, differenceInDays, parseISO, isSameDay } from 'date-fns';
import { CheckCircle, AlertCircle, Trash2, RefreshCw, Edit2, X } from 'lucide-react';
import { Habit } from '../types';
import { HabitForm } from './HabitForm';
import clsx from 'clsx';
import { Link } from 'react-router-dom';

interface HabitListProps {
  habits: Habit[];
  onComplete: (habitId: string) => void;
  onDelete?: (habitId: string) => void;
  onReset?: (habitId: string) => void;
  onEdit?: (habitId: string, updatedHabit: Partial<Habit>) => void;
  showActions?: boolean;
}

export function HabitList({ 
  habits, 
  onComplete, 
  onDelete, 
  onReset, 
  onEdit,
  showActions = false 
}: HabitListProps) {
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [jigglingHabitId, setJigglingHabitId] = useState<string | null>(null);

  const isCompletedToday = (habit: Habit) => {
    return habit.completedDates.some(date => 
      isSameDay(parseISO(date), new Date())
    );
  };

  const getHabitStatus = (habit: Habit) => {
    if (isCompletedToday(habit)) return 'completed';
    if (!habit.lastCompleted) return 'pending';
    const daysSinceLastCompleted = differenceInDays(new Date(), new Date(habit.lastCompleted));
    
    if (daysSinceLastCompleted === 1) return 'warning';
    if (daysSinceLastCompleted > 1) return 'overdue';
    return 'pending';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 animate-pulse';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200 animate-pulse';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleEditSubmit = (habitId: string, updatedData: Omit<Habit, 'id' | 'lastCompleted' | 'streak' | 'missedOnce' | 'completedDates'>) => {
    onEdit?.(habitId, updatedData);
    setEditingHabitId(null);
  };

  const handleComplete = (habitId: string) => {
    setJigglingHabitId(habitId);
    setTimeout(() => setJigglingHabitId(null), 500); // Jiggle animation lasts 500ms
    onComplete(habitId);
  };

  const sortedHabits = [...habits].sort((a, b) => {
    const aCompleted = isCompletedToday(a) ? 1 : 0;
    const bCompleted = isCompletedToday(b) ? 1 : 0;
    return aCompleted - bCompleted; // Incomplete habits appear first
  });

  return (
    <div className="space-y-4">
      {sortedHabits.map((habit) => {
        const status = getHabitStatus(habit);
        const completed = isCompletedToday(habit);
        
        if (editingHabitId === habit.id) {
          return (
            <div key={habit.id} className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Edit Habit</h3>
                <button
                  onClick={() => setEditingHabitId(null)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <HabitForm
                initialData={habit}
                onSubmit={(data) => handleEditSubmit(habit.id, data)}
              />
            </div>
          );
        }

        return (
          <div
            key={habit.id}
            className={clsx(
              "p-6 rounded-lg border transition-all duration-300",
              getStatusColor(status),
              { "animate-jiggle": jigglingHabitId === habit.id }
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{habit.name}</h3>
                  <div className="flex items-center space-x-2">
                    {showActions && (
                      <>
                        <button
                          onClick={() => onReset?.(habit.id)}
                          className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                          title="Reset habit"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingHabitId(habit.id)}
                          className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                          title="Edit habit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete?.(habit.id)}
                          className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                          title="Delete habit"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleComplete(habit.id)}
                      className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                      title={completed ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                      {completed ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <AlertCircle className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="mt-2 space-y-1">
                  <p className="text-sm opacity-75">
                    {habit.schedule.frequency === 'daily' ? 'Every day' : 
                      'Weekly: ' + habit.schedule.days
                        .map(day => format(new Date(2024, 0, day), 'EEEE'))
                        .join(', ')}
                  </p>
                  <p className="text-sm">
                    Current streak: <span className="font-semibold">{habit.streak} days</span>
                  </p>
                  <p className="text-sm">
                    Status: <span className="font-semibold capitalize">{completed ? 'Completed today' : 'Not completed today'}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      {habits.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No habits found. Start by <Link to="/manage" className="text-indigo-500 hover:underline">adding a new habit</Link>!
        </div>
      )}
    </div>
  );
}