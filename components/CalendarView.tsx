
import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths } from 'date-fns';
import { Account } from '../types';

export const CalendarView: React.FC<{ accounts: Account[] }> = ({ accounts }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-zinc-950 p-8 animate-in fade-in duration-500">
      <div className="max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold dark:text-white text-zinc-900">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <div className="flex space-x-2">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-[10px] font-bold text-zinc-500 uppercase tracking-widest py-2">
              {day}
            </div>
          ))}
          {days.map(day => (
            <div 
              key={day.toISOString()} 
              className={`h-32 p-3 border rounded-2xl transition-all ${
                isToday(day) 
                  ? 'border-blue-500 bg-blue-500/5' 
                  : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/20'
              }`}
            >
              <span className={`text-sm font-semibold ${isToday(day) ? 'text-blue-500' : 'text-zinc-500'}`}>
                {format(day, 'd')}
              </span>
              
              {/* Mock events for visual utility */}
              {day.getDate() % 5 === 0 && (
                <div className="mt-2 p-1.5 text-[10px] bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-md truncate font-medium">
                  Product Demo Sync
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
