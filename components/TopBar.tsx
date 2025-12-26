
import React from 'react';
import { ICONS } from '../constants';

interface TopBarProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  toggleAiSidebar: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  theme,
  onToggleTheme,
  searchQuery,
  setSearchQuery,
  toggleAiSidebar
}) => {
  return (
    <div className="h-20 border-b border-zinc-100 dark:border-zinc-900 flex items-center px-10 justify-between bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl z-20">
      <div className="flex-1 max-w-3xl flex items-center">
        <div className="relative w-full group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-indigo-500 transition-colors">
            {ICONS.Search}
          </div>
          <input
            id="global-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ask Flowyn AI to find anything... (e.g. 'flight tickets for next month')"
            className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[20px] py-3.5 pl-12 pr-6 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white dark:focus:bg-zinc-900 transition-all dark:text-zinc-100 text-zinc-900 font-bold placeholder-zinc-400"
          />
          <div className="absolute right-4 top-3.5 px-2 py-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg text-[10px] font-black text-zinc-500 tracking-tighter shadow-sm border border-zinc-200 dark:border-zinc-700">
            CMD + K
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-6 ml-10">
        <button 
          onClick={onToggleTheme}
          className="p-3 text-zinc-400 hover:text-indigo-500 hover:bg-indigo-500/10 rounded-2xl transition-all"
        >
          {theme === 'dark' ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.243 16.243l.707.707M7.757 7.757l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          )}
        </button>

        <button 
          onClick={toggleAiSidebar}
          className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl text-xs font-black shadow-xl shadow-indigo-600/20 transition-all active:scale-95 group"
        >
          <span className="group-hover:animate-spin duration-1000">{ICONS.Sparkles}</span>
          <span className="tracking-widest">FLOWYN AI</span>
        </button>
      </div>
    </div>
  );
};
