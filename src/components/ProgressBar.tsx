import React from 'react';

interface ProgressBarProps {
  percentage: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ percentage }) => {
  return (
    <div className="w-full bg-gray-800 rounded-full h-6 overflow-hidden relative">
      <div
        className="bg-green-500 h-full text-xs text-white font-bold flex items-center justify-center absolute top-0 left-0"
        style={{ width: `${percentage}%` }}
      >
        {percentage > 0 ? `${percentage}% Completed` : ''}
      </div>
    </div>
  );
};