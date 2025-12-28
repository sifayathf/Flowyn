
import React, { useState } from 'react';
import { ChatMessage, Account } from '../types';
import { format } from 'date-fns';

export const ChatView: React.FC<{ chats: ChatMessage[], accounts: Account[] }> = ({ chats, accounts }) => {
  const [input, setInput] = useState('');

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-zinc-950 animate-in fade-in">
      <div className="p-8 border-b border-zinc-100 dark:border-zinc-900 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md">
        <h2 className="text-2xl font-black dark:text-white text-zinc-900 tracking-tight">Team Comms</h2>
        <div className="flex items-center space-x-2 mt-1">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Active via Exchange Server</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
        {chats.map(msg => (
          <div key={msg.id} className="flex items-start space-x-4 max-w-2xl">
            <div className="w-10 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-black text-zinc-500">
              {msg.senderName[0]}
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-black text-sm dark:text-white text-zinc-900">{msg.senderName}</span>
                <span className="text-[10px] text-zinc-400 font-bold">{format(new Date(msg.timestamp), 'h:mm a')}</span>
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-300 font-medium leading-relaxed bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl rounded-tl-none border border-zinc-100 dark:border-zinc-800">
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {chats.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center py-20 opacity-30">
            <div className="text-4xl mb-4">💬</div>
            <p className="font-bold uppercase tracking-widest text-xs">Start a conversation across your linked services.</p>
          </div>
        )}
      </div>

      <div className="p-8 border-t border-zinc-100 dark:border-zinc-800">
        <div className="max-w-3xl mx-auto relative group">
          <input 
            value={input}
            onChange={e => setInput(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-zinc-900 p-6 rounded-3xl outline-none focus:ring-2 ring-indigo-500/20 text-sm font-bold dark:text-white text-zinc-900"
            placeholder="Type a message to the group..."
          />
          <button className="absolute right-4 top-4 p-3 bg-indigo-600 text-white rounded-2xl shadow-lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};
