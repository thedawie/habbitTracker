import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Settings, Home as HomeIcon } from 'lucide-react';
import { HabitList } from './components/HabitList';
import { HabitForm } from './components/HabitForm';
import { Habit } from './types';
import { startOfDay, isSameDay, parseISO } from 'date-fns';

function App() {
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('habits');
    const parsedHabits = saved ? JSON.parse(saved) : [];
    return parsedHabits.map((habit: Habit) => ({
      ...habit,
      completedDates: habit.completedDates || [],
    }));
  });

  useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits));
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

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        <nav className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <Link to="/" className="flex items-center px-4 text-indigo-600 hover:text-indigo-800 transition-colors">
                  <HomeIcon className="h-5 w-5" />
                  <span className="ml-2 font-medium">Home</span>
                </Link>
              </div>
              <div className="flex">
                <Link to="/manage" className="flex items-center px-4 text-indigo-600 hover:text-indigo-800 transition-colors">
                  <Settings className="h-5 w-5" />
                  <span className="ml-2 font-medium">Manage Habits</span>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={
              <div className="space-y-6">
                <div className="text-center mb-12">
                  <h1 className="text-4xl font-bold text-indigo-900 mb-2">Daily Progress</h1>
                  <p className="text-gray-600">Track your habits, build your future</p>
                </div>
                <div className="max-w-3xl mx-auto">
                  <HabitList 
                    habits={getTodayHabits()} 
                    onComplete={handleCompleteHabit}
                    showActions={false}
                  />
                </div>
              </div>
            } />
            <Route path="/manage" element={
              <div className="space-y-8">
                <h1 className="text-3xl font-bold text-indigo-900">Manage Habits</h1>
                <div className="bg-white shadow-lg rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Habit</h2>
                  <HabitForm onSubmit={handleAddHabit} />
                </div>
                <div className="bg-white shadow-lg rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">All Habits</h2>
                  <HabitList 
                    habits={habits} 
                    onComplete={handleCompleteHabit}
                    onDelete={handleDeleteHabit}
                    onReset={handleResetHabit}
                    onEdit={handleEditHabit}
                    showActions={true}
                  />
                </div>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;