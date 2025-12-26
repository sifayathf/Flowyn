
import React from 'react';
import { Account, Folder } from '../types';
import { ICONS } from '../constants';

interface SidebarProps {
  accounts: Account[];
  folders: Folder[];
  selectedAccountId: string | null;
  activeFolderId: string;
  onSelectAccount: (id: string | null) => void;
  onSelectFolder: (id: string) => void;
  onOpenCalendar: () => void;
  onOpenSettings: () => void;
  onCompose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  accounts,
  folders,
  selectedAccountId,
  activeFolderId,
  onSelectAccount,
  onSelectFolder,
  onOpenCalendar,
  onOpenSettings,
  onCompose
}) => {
  return (
    <div className="w-64 border-r border-zinc-200 dark:border-zinc-800 flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 transition-all">
      <div className="p-8 pb-4 flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/30">
          <span className="font-black text-white text-2xl italic">F</span>
        </div>
        <span className="font-black text-2xl tracking-tighter dark:text-white text-zinc-900">Flowyn</span>
      </div>

      <div className="px-4 py-4">
        <button 
          onClick={onCompose}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center space-x-2 text-sm active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
          <span>Compose</span>
        </button>
      </div>

      <div className="px-4 py-2 space-y-1">
        <button 
          onClick={() => onSelectAccount(null)}
          className={`w-full flex items-center px-4 py-3 rounded-2xl text-sm font-bold transition-all ${!selectedAccountId ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-white shadow-md' : 'text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-900'}`}
        >
          <div className="mr-3 w-5 h-5 flex items-center justify-center opacity-70">
            {ICONS.Inbox}
          </div>
          Unified Inbox
        </button>
        
        <button 
          onClick={onOpenCalendar}
          className="w-full flex items-center px-4 py-3 rounded-2xl text-sm font-bold text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-900 transition-all"
        >
          <div className="mr-3 w-5 h-5 flex items-center justify-center opacity-70">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          Schedule
        </button>
      </div>

      <div className="mt-6 px-8 text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-2">
        Connected Spaces
      </div>
      <div className="px-4 py-1 space-y-1 max-h-40 overflow-y-auto no-scrollbar">
        {accounts.map(acc => (
          <button
            key={acc.id}
            onClick={() => onSelectAccount(acc.id)}
            className={`w-full flex items-center px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${selectedAccountId === acc.id ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-900'}`}
          >
            <div className="mr-3 w-6 h-6 rounded-lg border-2 shadow-inner overflow-hidden" style={{ borderColor: acc.color }}>
              <img src={acc.avatar} className="w-full h-full object-cover" alt="" />
            </div>
            <span className="truncate">{acc.email}</span>
          </button>
        ))}
      </div>

      <div className="mt-6 px-8 text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-2">
        Folders
      </div>
      <div className="px-4 py-1 flex-1 space-y-1 overflow-y-auto no-scrollbar">
        {folders.map(folder => (
          <button
            key={folder.id}
            onClick={() => onSelectFolder(folder.id)}
            className={`w-full flex items-center px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeFolderId === folder.id ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-900'}`}
          >
            <div className="mr-3 text-zinc-400 opacity-60">
              {(ICONS as any)[folder.name] || ICONS.Inbox}
            </div>
            <span className="flex-1 text-left capitalize">{folder.name}</span>
            {folder.count && folder.count > 0 ? (
              <span className="text-[10px] bg-indigo-500/10 dark:bg-indigo-500/20 px-2 py-0.5 rounded-full text-indigo-600 dark:text-indigo-400 font-black">
                {folder.count}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-zinc-400 mt-auto">
        <button 
          onClick={onOpenSettings}
          className="p-3 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-2xl transition-all"
        >
          {ICONS.Settings}
        </button>
        <div className="flex space-x-2">
          <div className="w-10 h-10 rounded-2xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-black border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400">
            {accounts[0]?.email[0].toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </div>
  );
};
