import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Settings, Home as HomeIcon } from 'lucide-react';
import { HabitList } from './components/HabitList';
import { HabitForm } from './components/HabitForm';
import { Habit } from './types';
import { startOfDay, isSameDay, parseISO } from 'date-fns';
import { getFromLocalStorage, setToLocalStorage } from './utils/localStorage';
import { ProgressBar } from './components/ProgressBar';

function handleLocalStorageError(error: Error) {
  console.error('LocalStorage Error:', error);
  // Optionally, display a user-friendly message or log to an external service
}

function App() {
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
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">
        <header className="text-center py-8">
          <h1 className="text-4xl font-bold mb-2">HABIT TRACKER</h1>
          <p className="text-lg text-gray-400">Stay consistent and achieve your goals</p>
        </header>

        <main className="max-w-3xl mx-auto px-4">
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
    </Router>
  );
}

export default App;