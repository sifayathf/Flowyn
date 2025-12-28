
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
  onViewChange: (view: string) => void;
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
  onViewChange,
  onOpenSettings,
  onCompose
}) => {
  return (
    <div className="w-64 border-r border-zinc-200 dark:border-zinc-800 flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 transition-all">
      <div className="p-8 pb-4 flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
          <span className="font-black text-white text-2xl italic">F</span>
        </div>
        <span className="font-black text-2xl tracking-tighter dark:text-white text-zinc-900">Flowyn</span>
      </div>

      <div className="px-4 py-4">
        <button onClick={onCompose} className="w-full bg-indigo-600 text-white font-black py-3 rounded-2xl transition-all hover:bg-indigo-500 shadow-xl shadow-indigo-600/20 active:scale-95">
          <span>Compose</span>
        </button>
      </div>

      <div className="mt-4 px-8 text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-2">Core Apps</div>
      <div className="px-4 space-y-1">
        {[
          { id: 'INBOX', name: 'Mail', icon: ICONS.Inbox },
          { id: 'CALENDAR', name: 'Calendar', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
          { id: 'CONTACTS', name: 'Contacts', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
          { id: 'CHAT', name: 'Chat', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg> }
        ].map(item => (
          <button 
            key={item.id} 
            onClick={() => onViewChange(item.id)}
            className="w-full flex items-center px-4 py-3 rounded-2xl text-sm font-bold text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-900 transition-all"
          >
            <div className="mr-3 w-5 h-5 flex items-center justify-center">{item.icon}</div>
            {item.name}
          </button>
        ))}
      </div>

      <div className="mt-8 px-8 text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-2">Folders</div>
      <div className="px-4 flex-1 space-y-1 overflow-y-auto no-scrollbar">
        {folders.map(folder => (
          <button
            key={folder.id}
            onClick={() => { onSelectFolder(folder.id); onViewChange('INBOX'); }}
            className={`w-full flex items-center px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeFolderId === folder.id ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-white shadow-sm' : 'text-zinc-500'}`}
          >
            <span className="flex-1 text-left capitalize">{folder.name}</span>
          </button>
        ))}
      </div>

      <div className="p-6 mt-auto">
        <button onClick={onOpenSettings} className="w-full flex items-center px-4 py-3 bg-zinc-100 dark:bg-zinc-900 rounded-2xl text-sm font-bold text-zinc-500 hover:text-indigo-600 transition-all">
          <div className="mr-3">{ICONS.Settings}</div>
          Settings
        </button>
      </div>
    </div>
  );
};
