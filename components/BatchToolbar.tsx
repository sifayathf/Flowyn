
import React from 'react';
import { ICONS } from '../constants';

interface BatchToolbarProps {
  count: number;
  onAction: (action: 'archive' | 'delete' | 'read') => void;
  onClear: () => void;
}

export const BatchToolbar: React.FC<BatchToolbarProps> = ({ count, onAction, onClear }) => {
  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-10 duration-500">
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-zinc-200 dark:border-zinc-800 rounded-full px-8 py-4 shadow-2xl flex items-center space-x-8 ring-1 ring-indigo-500/20">
        <div className="flex items-center space-x-4 border-r border-zinc-200 dark:border-zinc-800 pr-8">
          <span className="text-lg font-black dark:text-white text-zinc-900">{count}</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Selected</span>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={() => onAction('archive')}
            className="p-3 text-zinc-500 hover:text-indigo-600 hover:bg-indigo-500/10 rounded-2xl transition-all flex items-center space-x-2"
          >
            {ICONS.Archive}
            <span className="text-[10px] font-black uppercase tracking-widest pr-2">Archive</span>
          </button>
          
          <button 
            onClick={() => onAction('delete')}
            className="p-3 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all flex items-center space-x-2"
          >
            {ICONS.Trash}
            <span className="text-[10px] font-black uppercase tracking-widest pr-2">Delete</span>
          </button>

          <button 
            onClick={() => onAction('read')}
            className="p-3 text-zinc-500 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-2xl transition-all flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            <span className="text-[10px] font-black uppercase tracking-widest pr-2">Mark Read</span>
          </button>
        </div>

        <button 
          onClick={onClear}
          className="p-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  );
};
