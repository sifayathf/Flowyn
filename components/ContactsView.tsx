
import React from 'react';
import { Contact } from '../types';

export const ContactsView: React.FC<{ contacts: Contact[] }> = ({ contacts }) => {
  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-zinc-950 p-8 animate-in fade-in">
      <div className="max-w-4xl mx-auto w-full">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-black dark:text-white text-zinc-900 tracking-tight">Address Book</h2>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Synced across {new Set(contacts.map(c => c.accountId)).size} accounts</p>
          </div>
          <button className="px-6 py-3 bg-zinc-100 dark:bg-zinc-900 text-sm font-bold rounded-2xl">+ New Contact</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contacts.map(contact => (
            <div key={contact.id} className="p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-zinc-100 dark:border-zinc-800 flex items-center space-x-5 hover:border-indigo-500/50 transition-all">
              <img src={contact.avatar || `https://ui-avatars.com/api/?name=${contact.name}`} className="w-14 h-14 rounded-2xl object-cover" alt="" />
              <div className="flex-1 min-w-0">
                <div className="font-black text-zinc-900 dark:text-white truncate">{contact.name}</div>
                <div className="text-xs text-zinc-400 font-bold mb-1">{contact.company}</div>
                <div className="text-[10px] text-indigo-500 font-black uppercase tracking-widest">{contact.email}</div>
              </div>
            </div>
          ))}
          {contacts.length === 0 && (
            <div className="col-span-full py-20 text-center opacity-30">
              <div className="text-4xl mb-4">📇</div>
              <p className="font-bold uppercase tracking-widest text-xs">No contacts synced yet. Trigger a sync from Settings.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
