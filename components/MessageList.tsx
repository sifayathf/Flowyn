
import React from 'react';
import { Email } from '../types';
import { format } from 'date-fns';

interface MessageListProps {
  emails: Email[];
  selectedEmail: Email | null;
  onSelectEmail: (email: Email) => void;
  onContextMenu: (e: React.MouseEvent, email: Email) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  emails,
  selectedEmail,
  onSelectEmail,
  onContextMenu
}) => {
  return (
    <div className="w-[420px] border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-zinc-50 dark:bg-zinc-950 overflow-hidden transition-colors">
      <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm">
        <h2 className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em]">Inbox</h2>
        <div className="flex space-x-2">
          <button className="text-[10px] px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 text-zinc-500 border border-zinc-200 dark:border-zinc-800 font-bold hover:text-zinc-300 transition-all">Newest</button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-1">
        {emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-600 p-10 text-center opacity-40">
            <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
            <p className="text-sm font-bold tracking-tight">Zero Inbox Bliss</p>
          </div>
        ) : (
          emails.map((email) => (
            <div
              key={email.id}
              onClick={() => onSelectEmail(email)}
              onContextMenu={(e) => onContextMenu(e, email)}
              className={`group flex flex-col p-4 cursor-pointer rounded-2xl transition-all duration-300 relative ${
                selectedEmail?.id === email.id 
                  ? 'bg-white dark:bg-zinc-900 shadow-md ring-1 ring-zinc-200 dark:ring-zinc-800' 
                  : 'hover:bg-zinc-100 dark:hover:bg-zinc-900/30'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  {!email.isRead && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-sm" />
                  )}
                  <span className={`text-sm truncate max-w-[180px] ${!email.isRead ? 'font-bold dark:text-white text-zinc-900' : 'font-medium text-zinc-500 dark:text-zinc-400'}`}>
                    {email.from.name}
                  </span>
                </div>
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter">
                  {format(new Date(email.date), 'h:mm a')}
                </span>
              </div>
              
              <div className={`text-sm mb-1 truncate ${!email.isRead ? 'font-bold dark:text-zinc-100 text-zinc-900' : 'text-zinc-600 dark:text-zinc-300'}`}>
                {email.subject}
              </div>
              
              <div className="text-xs text-zinc-400 dark:text-zinc-500 line-clamp-2 leading-relaxed font-medium">
                {email.snippet}
              </div>
              
              <div className="mt-3 flex items-center space-x-2">
                {email.isStarred && (
                  <svg className="w-3.5 h-3.5 text-amber-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                )}
                {email.labels.map(label => (
                  <span key={label} className="text-[9px] px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700 font-bold uppercase">
                    {label}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
