
import React from 'react';
import { Email } from '../types';
import { format } from 'date-fns';
import { ICONS } from '../constants';

interface MessageListProps {
  emails: Email[];
  selectedEmail: Email | null;
  selectedEmailIds: Set<string>;
  onSelectEmail: (email: Email) => void;
  onToggleSelect: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, email: Email) => void;
  onAIOrganize: () => void;
  isOrganizing: boolean;
  onSync: () => void;
  isSyncing: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
  emails,
  selectedEmail,
  selectedEmailIds,
  onSelectEmail,
  onToggleSelect,
  onContextMenu,
  onAIOrganize,
  isOrganizing,
  onSync,
  isSyncing
}) => {
  const handleDragStart = (e: React.DragEvent, email: Email) => {
    const ids = selectedEmailIds.has(email.id) 
      ? Array.from(selectedEmailIds) 
      : [email.id];
    e.dataTransfer.setData('emails', JSON.stringify(ids));
    if (ids.length > 1) {
      const dragEl = document.createElement('div');
      dragEl.className = 'bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-xs';
      dragEl.innerText = `Moving ${ids.length} messages`;
      document.body.appendChild(dragEl);
      e.dataTransfer.setDragImage(dragEl, 0, 0);
      setTimeout(() => document.body.removeChild(dragEl), 0);
    }
  };

  return (
    <div className="w-[420px] border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-zinc-50 dark:bg-zinc-950 overflow-hidden transition-colors">
      <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm">
        <h2 className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em]">Threads</h2>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={onSync}
            disabled={isSyncing}
            title="Sync all accounts"
            className={`p-2 rounded-xl transition-all ${isSyncing ? 'animate-spin text-indigo-500' : 'text-zinc-400 hover:text-indigo-500 hover:bg-zinc-100 dark:hover:bg-zinc-900'}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          
          <button 
            onClick={onAIOrganize}
            disabled={isOrganizing || isSyncing}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500/20 transition-all disabled:opacity-50"
          >
            {isOrganizing ? <div className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /> : ICONS.Sparkles}
            <span>AI Organize</span>
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-1">
        {isSyncing && emails.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-full py-20 animate-in fade-in duration-700">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Retrieving latest 10 messages...</p>
           </div>
        ) : emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-600 p-10 text-center opacity-40">
            <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
            <p className="text-sm font-bold tracking-tight">Zero Inbox Bliss</p>
          </div>
        ) : (
          emails.map((email) => (
            <div
              key={email.id}
              draggable
              onDragStart={(e) => handleDragStart(e, email)}
              onClick={() => onSelectEmail(email)}
              onContextMenu={(e) => onContextMenu(e, email)}
              className={`group flex items-start p-4 cursor-pointer rounded-2xl transition-all duration-300 relative ${
                selectedEmail?.id === email.id 
                  ? 'bg-white dark:bg-zinc-900 shadow-md ring-1 ring-zinc-200 dark:ring-zinc-800' 
                  : (selectedEmailIds.has(email.id) ? 'bg-indigo-500/10 dark:bg-indigo-500/20' : 'hover:bg-zinc-100 dark:hover:bg-zinc-900/30')
              }`}
            >
              <div 
                onClick={(e) => { e.stopPropagation(); onToggleSelect(email.id); }}
                className={`mt-1 mr-4 w-4 h-4 rounded border flex items-center justify-center transition-all ${
                  selectedEmailIds.has(email.id) 
                    ? 'bg-indigo-600 border-indigo-600 text-white' 
                    : 'border-zinc-300 dark:border-zinc-700 opacity-0 group-hover:opacity-100'
                }`}
              >
                {selectedEmailIds.has(email.id) && (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    {!email.isRead && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-sm" />
                    )}
                    <span className={`text-sm truncate max-w-[150px] ${!email.isRead ? 'font-black dark:text-white text-zinc-900' : 'font-bold text-zinc-500 dark:text-zinc-400'}`}>
                      {email.from.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-black uppercase tracking-tighter">
                    {format(new Date(email.date), 'h:mm a')}
                  </span>
                </div>
                
                <div className={`text-sm mb-1 truncate ${!email.isRead ? 'font-bold dark:text-zinc-100 text-zinc-900' : 'text-zinc-600 dark:text-zinc-300'}`}>
                  {email.subject}
                </div>
                
                <div className="text-xs text-zinc-400 dark:text-zinc-500 line-clamp-1 leading-relaxed font-medium">
                  {email.snippet}
                </div>
                
                {/* Account indicator */}
                <div className="mt-2 flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: email.isImportant ? '#6366f1' : '#d1d5db' }} />
                  <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">{email.accountId.split('@')[0]}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
