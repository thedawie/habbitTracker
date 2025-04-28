import { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Settings, ListChecks } from 'lucide-react';
import { HabitList } from './components/HabitList';
import { HabitForm } from './components/HabitForm';
import { Habit } from './types';
import { startOfDay, isSameDay, parseISO } from 'date-fns';
import { getFromLocalStorage, setToLocalStorage } from './utils/localStorage';
import { ProgressBar } from './components/ProgressBar';
import { Toaster, toast } from 'react-hot-toast';
import { usePageViewMetrics } from './hooks/usePageViewMetrics.ts';


function handleLocalStorageError(error: Error) {
  console.error('LocalStorage Error:', error);
  // Optionally, display a user-friendly message or log to an external service
}

function App() {

  usePageViewMetrics();

  const [habits, setHabits] = useState<Habit[]>(() => {
    return getFromLocalStorage<Habit[]>('habits', [], handleLocalStorageError).map((habit: Habit) => ({
      ...habit,
      completedDates: habit.completedDates || [],
    }));
  });

  useEffect(() => {
    setToLocalStorage('habits', habits, handleLocalStorageError);
  }, [habits]);

  const handleAddHabit = (newHabit: Omit<Habit, 'id' | 'lastCompleted' | 'streak' | 'missedOnce' | 'completedDates'>) => {
    const habit: Habit = {
      ...newHabit,
      id: Date.now().toString(),
      lastCompleted: null,
      streak: 0,
      missedOnce: false,
      completedDates: [],
    };
    setHabits([...habits, habit]);
    toast.success('Habit added successfully!');
  };

  const handleCompleteHabit = (habitId: string) => {
    const today = startOfDay(new Date()).toISOString();
    
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        const isAlreadyCompletedToday = habit.completedDates.some(date => 
          isSameDay(parseISO(date), new Date())
        );

        let newCompletedDates;
        if (isAlreadyCompletedToday) {
          // If already completed today, remove today's completion
          newCompletedDates = habit.completedDates.filter(date => 
            !isSameDay(parseISO(date), new Date())
          );
        } else {
          // If not completed today, add today's completion
          newCompletedDates = [...habit.completedDates, today];
        }

        return {
          ...habit,
          lastCompleted: isAlreadyCompletedToday ? habit.lastCompleted : new Date(),
          streak: isAlreadyCompletedToday ? habit.streak - 1 : habit.streak + 1,
          completedDates: newCompletedDates,
        };
      }
      return habit;
    }));
  };

  const handleDeleteHabit = (habitId: string) => {
    setHabits(habits.filter(habit => habit.id !== habitId));
    toast.success('Habit deleted successfully!');
  };

  const handleResetHabit = (habitId: string) => {
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        return {
          ...habit,
          lastCompleted: null,
          streak: 0,
          missedOnce: false,
          completedDates: [],
        };
      }
      return habit;
    }));
  };

  const handleEditHabit = (habitId: string, updatedHabit: Partial<Habit>) => {
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        return {
          ...habit,
          ...updatedHabit,
        };
      }
      return habit;
    }));
    toast.success('Habit updated successfully!');
  };

  const getTodayHabits = () => {
    const today = new Date().getDay();
    return habits.filter(habit => 
      habit.schedule.frequency === 'daily' || 
      habit.schedule.days.includes(today)
    );
  };

  const getCompletionPercentage = () => {
    const todayHabits = getTodayHabits();
    const completedHabits = todayHabits.filter(habit => {
      return habit.completedDates.some(date => isSameDay(parseISO(date), new Date()));
    });
    return Math.round((completedHabits.length / todayHabits.length) * 100) || 0;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Toaster position="top-right" />
      <header className="text-center py-8">
        <h1 className="text-4xl font-bold mb-2">HABIT TRACKER</h1>
        <p className="text-lg text-gray-400">Stay consistent and achieve your goals</p>
      </header>

      <main className="max-w-3xl mx-auto px-4">
        <nav className="flex justify-between items-center mb-8">
          <Link to="/">
            <ListChecks className="w-10 h-10 text-white" />
          </Link>
          <Link to="/manage">
            <Settings className="w-10 h-10 text-white" />
          </Link>
        </nav>

        <section className="mb-8 text-center">
          <h2 className="text-xl font-semibold mb-4">✨ Daily Momentum ✨</h2>
          <ProgressBar percentage={getCompletionPercentage()} />
        </section>

        <Routes>
          <Route path="/" element={
            <div className="space-y-6">
              <HabitList 
                habits={getTodayHabits()} 
                onComplete={handleCompleteHabit}
                showActions={false}
              />
            </div>
          } />
          <Route path="/manage" element={
            <div className="space-y-8">
              <HabitForm onSubmit={handleAddHabit} />
              <HabitList 
                habits={habits} 
                onComplete={handleCompleteHabit}
                onDelete={handleDeleteHabit}
                onReset={handleResetHabit}
                onEdit={handleEditHabit}
                showActions={true}
              />
            </div>
          } />
        </Routes>
      </main>
    </div>
  );
}

export default App;