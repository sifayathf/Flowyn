
import React, { useState, useEffect } from 'react';
import { Email, Thread } from '../types';
import { summarizeThread, triageEmail } from '../geminiService';
import { ICONS } from '../constants';

interface AISidebarProps {
  email: Email;
  onClose: () => void;
}

export const AISidebar: React.FC<AISidebarProps> = ({ email, onClose }) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [triage, setTriage] = useState<{ importance: number; category: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const analyze = async () => {
      setLoading(true);
      try {
        const thread: Thread = {
          id: email.threadId,
          emails: [email],
          subject: email.subject,
          lastMessageDate: email.date,
          participants: [email.from, ...email.to]
        };
        const [sum, tri] = await Promise.all([
          summarizeThread(thread),
          triageEmail(email)
        ]);
        setSummary(sum);
        setTriage(tri);
      } catch (err) {
        console.error("AI Analysis failed", err);
      } finally {
        setLoading(false);
      }
    };
    analyze();
  }, [email]);

  return (
    <div className="w-80 border-l border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/80 backdrop-blur-xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-300">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-900/30">
        <div className="flex items-center space-x-2 text-indigo-500">
          {ICONS.Sparkles}
          <span className="text-xs font-black uppercase tracking-[0.2em]">Flowyn AI</span>
        </div>
        <button onClick={onClose} className="text-zinc-500 hover:text-indigo-500 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
        {loading ? (
          <div className="space-y-6">
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse w-3/4" />
            <div className="h-24 bg-zinc-200 dark:bg-zinc-800 rounded-2xl animate-pulse" />
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse w-1/2" />
            <div className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-2xl animate-pulse" />
          </div>
        ) : (
          <>
            <section>
              <h3 className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em] mb-4">Thread Summary</h3>
              <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 text-sm dark:text-zinc-300 text-zinc-700 leading-relaxed whitespace-pre-wrap font-medium shadow-sm">
                {summary}
              </div>
            </section>

            <section>
              <h3 className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em] mb-4">Intelligent Triage</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col items-center shadow-sm">
                  <span className="text-[10px] text-zinc-400 mb-2 uppercase font-bold tracking-widest">Priority</span>
                  <span className={`text-2xl font-black ${triage && triage.importance > 7 ? 'text-rose-500' : 'text-indigo-500'}`}>
                    {triage?.importance ?? '—'}/10
                  </span>
                </div>
                <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col items-center shadow-sm">
                  <span className="text-[10px] text-zinc-400 mb-2 uppercase font-bold tracking-widest">Category</span>
                  <span className="text-sm font-black dark:text-zinc-100 text-zinc-900 truncate w-full text-center">
                    {triage?.category ?? '—'}
                  </span>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em] mb-4">Smart Suggestions</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/50 text-xs text-zinc-500 dark:text-zinc-400 transition-all hover:text-indigo-600 shadow-sm font-bold">
                  "Remind me tomorrow"
                </button>
                <button className="w-full text-left p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/50 text-xs text-zinc-500 dark:text-zinc-400 transition-all hover:text-indigo-600 shadow-sm font-bold">
                  "Draft a short reply"
                </button>
              </div>
            </section>
          </>
        )}
      </div>

      <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30">
        <div className="relative group">
          <input 
            type="text" 
            placeholder="Ask AI anything..."
            className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-2xl py-3 pl-4 pr-12 text-xs dark:text-zinc-200 text-zinc-800 focus:ring-2 ring-indigo-500 outline-none transition-all font-medium"
          />
          <button className="absolute right-3 top-2.5 text-zinc-400 hover:text-indigo-500 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};
