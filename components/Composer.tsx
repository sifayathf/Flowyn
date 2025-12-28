
import React, { useState } from 'react';
import { Account, Email } from '../types';
import { generateDraft } from '../geminiService';
import { ICONS } from '../constants';

interface ComposerProps {
  accounts: Account[];
  onClose: () => void;
  onSend: (email: Email) => void;
  replyTo: Email | null;
}

export const Composer: React.FC<ComposerProps> = ({ accounts, onClose, onSend, replyTo }) => {
  const [to, setTo] = useState(replyTo ? replyTo.from.email : '');
  const [subject, setSubject] = useState(replyTo ? `Re: ${replyTo.subject}` : '');
  const [body, setBody] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAiInput, setShowAiInput] = useState(false);

  const handleSend = () => {
    if (!to || !subject) return;
    const newEmail: Email = {
      id: `msg-${Date.now()}`,
      threadId: `th-${Date.now()}`,
      accountId: accounts[0]?.id || 'acc-1',
      from: { name: 'Alex Rivera', email: 'alex@flowyn.io', avatar: 'https://picsum.photos/seed/alex/40/40' },
      to: [{ name: to, email: to }],
      subject: subject,
      snippet: body.slice(0, 100),
      body: body,
      date: new Date().toISOString(),
      isRead: true,
      isStarred: false,
      isPinned: false,
      isImportant: true,
      labels: [],
      attachments: [],
      folderId: 'sent'
    };
    onSend(newEmail);
  };

  const handleAiCompose = async () => {
    if (!aiPrompt) return;
    setIsAiLoading(true);
    try {
      const draft = await generateDraft(aiPrompt, replyTo || undefined);
      setBody(prev => prev + (prev ? '\n\n' : '') + draft);
      setAiPrompt('');
      setShowAiInput(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-950 w-full max-w-4xl h-[650px] border border-zinc-200 dark:border-zinc-800 rounded-[32px] shadow-[0_0_50px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden animate-in zoom-in-95">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-900 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/30">
          <h2 className="text-xs font-black tracking-[0.2em] uppercase opacity-40 text-zinc-900 dark:text-zinc-100">Draft</h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="flex items-center border-b border-zinc-100 dark:border-zinc-900 pb-4">
            <span className="text-zinc-400 text-[10px] font-black uppercase tracking-widest w-16">To</span>
            <input 
              autoFocus
              type="text" 
              value={to} 
              onChange={e => setTo(e.target.value)}
              className="flex-1 bg-transparent border-none text-sm focus:ring-0 outline-none dark:text-zinc-100 text-zinc-900 font-bold" 
            />
          </div>
          <div className="flex items-center border-b border-zinc-100 dark:border-zinc-900 pb-4">
            <span className="text-zinc-400 text-[10px] font-black uppercase tracking-widest w-16">Subject</span>
            <input 
              type="text" 
              value={subject} 
              onChange={e => setSubject(e.target.value)}
              className="flex-1 bg-transparent border-none text-sm focus:ring-0 outline-none dark:text-zinc-100 text-zinc-900 font-bold" 
            />
          </div>
        </div>

        <div className="flex-1 relative">
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            className="w-full h-full bg-transparent border-none px-8 py-4 text-base dark:text-zinc-300 text-zinc-800 focus:ring-0 outline-none resize-none leading-relaxed font-medium"
            placeholder="Write your story..."
          />
          
          {showAiInput && (
            <div className="absolute bottom-8 left-8 right-8 bg-white dark:bg-zinc-900 border border-blue-500/40 rounded-3xl p-5 shadow-[0_10px_40px_rgba(59,130,246,0.1)] z-20 animate-in slide-in-from-bottom-4">
              <div className="flex items-center space-x-4">
                <div className="text-indigo-500">{ICONS.Sparkles}</div>
                <input 
                  autoFocus
                  type="text"
                  placeholder="Ask Flowyn AI to draft this..."
                  className="flex-1 bg-transparent border-none text-sm dark:text-zinc-200 text-zinc-900 outline-none focus:ring-0 font-medium"
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAiCompose()}
                />
                <button 
                  onClick={handleAiCompose}
                  disabled={isAiLoading || !aiPrompt}
                  className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-xs font-black hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-lg shadow-indigo-600/10"
                >
                  {isAiLoading ? 'THINKING...' : 'GENERATE'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center px-10">
          <div className="flex space-x-3">
            <button 
              onClick={() => setShowAiInput(!showAiInput)}
              className="flex items-center space-x-3 px-5 py-2.5 bg-indigo-600/10 dark:bg-indigo-500/10 hover:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 rounded-2xl text-xs font-black border border-indigo-500/20 transition-all shadow-sm"
            >
              {ICONS.Sparkles}
              <span>FLOWYN CORE</span>
            </button>
          </div>
          <div className="flex space-x-6 items-center">
            <button 
              onClick={onClose}
              className="text-sm font-bold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
            >
              Discard
            </button>
            <button 
              onClick={handleSend}
              className="px-10 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-black rounded-[20px] shadow-2xl shadow-indigo-600/20 transition-all active:scale-95 tracking-widest"
            >
              SEND
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
