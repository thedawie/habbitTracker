import React, { useState } from 'react';
import { Habit } from '../types';

interface HabitFormProps {
  onSubmit: (habit: Omit<Habit, 'id' | 'lastCompleted' | 'streak' | 'missedOnce'>) => void;
  initialData?: Habit;
}

export function HabitForm({ onSubmit, initialData }: HabitFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>(initialData?.schedule.frequency || 'daily');
  const [selectedDays, setSelectedDays] = useState<number[]>(
    initialData?.schedule.frequency === 'weekly' ? initialData.schedule.days : []
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      schedule: {
        days: frequency === 'daily' ? [0, 1, 2, 3, 4, 5, 6] : selectedDays,
        frequency,
      },
      completedDates: []
    });
    if (!initialData) {
      setName('');
      setFrequency('daily');
      setSelectedDays([]);
    }
  };

  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-bold text-white">
          Habit Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-white">Frequency</label>
        <select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as 'daily' | 'weekly')}
          className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
      </div>

      {frequency === 'weekly' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Days</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {weekDays.map((day, index) => (
              <label key={day} className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={selectedDays.includes(index)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedDays([...selectedDays, index].sort());
                    } else {
                      setSelectedDays(selectedDays.filter(d => d !== index));
                    }
                  }}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  required={frequency === 'weekly' && selectedDays.length === 0}
                />
                <span className="ml-2">{day}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <button
        type="submit"
        className="w-full inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
      >
        {initialData ? 'Update Habit' : 'Add Habit'}
      </button>
    </form>
  );
}