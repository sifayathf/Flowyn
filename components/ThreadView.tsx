
import React, { useState } from 'react';
import { Email } from '../types';
import { format } from 'date-fns';
import { ICONS } from '../constants';

interface ThreadViewProps {
  email: Email | null;
  onClose: () => void;
  onAction: (action: 'star' | 'read' | 'archive' | 'delete') => void;
}

export const ThreadView: React.FC<ThreadViewProps> = ({ email, onClose, onAction }) => {
  if (!email) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-zinc-950 text-zinc-400 transition-colors">
        <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-900 rounded-[32px] flex items-center justify-center mb-6 shadow-xl shadow-blue-500/5 rotate-3 animate-pulse">
          <svg className="w-10 h-10 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
        </div>
        <p className="text-lg font-bold tracking-tight opacity-50">Deep work starts here</p>
        <p className="text-xs mt-2 opacity-30 font-bold uppercase tracking-widest">Select an email to begin</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-zinc-950 overflow-hidden transition-colors">
      <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-900 flex justify-between items-start sticky top-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md z-10">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-black dark:text-white text-zinc-900 tracking-tight mb-4 leading-tight">
            {email.subject}
          </h1>
          <div className="flex items-center space-x-4">
            <img src={email.from.avatar} className="w-12 h-12 rounded-[18px] object-cover border-2 border-zinc-100 dark:border-zinc-800 shadow-sm" alt="" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{email.from.name}</span>
                <span className="text-zinc-400 text-xs font-medium">via {email.accountId}</span>
              </div>
              <div className="text-[10px] text-zinc-400 mt-1 uppercase tracking-[0.1em] font-black">
                {format(new Date(email.date), 'MMMM d, yyyy • h:mm a')}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-1">
          <button onClick={() => onAction('star')} className={`p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-all ${email.isStarred ? 'text-amber-500' : 'text-zinc-400'}`}>
            {ICONS.Star}
          </button>
          <button onClick={() => onAction('archive')} className="p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl text-zinc-400 hover:text-blue-500 transition-all">
            {ICONS.Archive}
          </button>
          <button onClick={() => onAction('delete')} className="p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl text-zinc-400 hover:text-red-500 transition-all">
            {ICONS.Trash}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-12 no-scrollbar">
        <div className="max-w-3xl mx-auto">
          <div 
            className="prose dark:prose-invert prose-zinc max-w-none dark:text-zinc-300 text-zinc-800 leading-relaxed text-base font-medium"
            dangerouslySetInnerHTML={{ __html: email.body }}
          />

          <div className="mt-20 border-t border-zinc-100 dark:border-zinc-900 pt-10">
            <div className="flex items-center space-x-3 text-zinc-400 mb-6">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
              <span className="text-[10px] font-black uppercase tracking-widest">Quick Reply</span>
            </div>
            <div className="border border-zinc-100 dark:border-zinc-800 rounded-3xl bg-zinc-50 dark:bg-zinc-900/30 overflow-hidden focus-within:ring-2 ring-blue-500/30 transition-all shadow-xl shadow-zinc-500/5">
              <textarea 
                placeholder={`Reply to ${email.from.name}...`}
                className="w-full bg-transparent border-none p-6 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none min-h-[120px] resize-none font-medium"
              />
              <div className="flex items-center justify-between p-4 border-t border-zinc-100 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-950/50">
                <button className="p-2 text-zinc-400 hover:text-blue-500 transition-all">
                  {ICONS.Sparkles}
                </button>
                <button className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-black py-2 px-6 rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95">
                  SEND REPLY
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
