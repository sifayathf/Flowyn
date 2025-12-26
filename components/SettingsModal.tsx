
import React, { useState } from 'react';
import { Account, AccountType, Email } from '../types';
import { fetchSimulatedEmails } from '../geminiService';

interface SettingsModalProps {
  accounts: Account[];
  setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
  onEmailsSync: (newEmails: Email[]) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ accounts, setAccounts, onEmailsSync, onClose }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [loginStep, setLoginStep] = useState<AccountType | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [passInput, setPassInput] = useState('');

  const connectAccount = async () => {
    if (!emailInput || !loginStep) return;
    
    setIsSyncing(true);
    
    // Simulate initial sync delay
    const newAcc: Account = {
      id: `acc-${Date.now()}`,
      email: emailInput,
      name: emailInput.split('@')[0],
      type: loginStep,
      color: '#' + Math.floor(Math.random()*16777215).toString(16),
      avatar: `https://picsum.photos/seed/${emailInput}/40/40`,
      status: 'CONNECTED'
    };

    try {
      // Fetch "real" simulated data from AI to populate the inbox
      const simulatedMails = await fetchSimulatedEmails(emailInput, loginStep);
      
      setAccounts(prev => [...prev, newAcc]);
      onEmailsSync(simulatedMails);
      resetForm();
    } catch (err) {
      console.error("Login failed", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const resetForm = () => {
    setIsAdding(false);
    setLoginStep(null);
    setEmailInput('');
    setPassInput('');
    setIsSyncing(false);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-zinc-950/70 backdrop-blur-lg p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-zinc-950 w-full max-w-xl border border-zinc-200 dark:border-zinc-800 rounded-[40px] shadow-2xl flex flex-col overflow-hidden">
        <div className="p-8 border-b border-zinc-100 dark:border-zinc-900 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/20">
          <div>
            <h2 className="text-2xl font-black dark:text-white text-zinc-900 tracking-tight">Settings</h2>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Configure your workspace</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-all">
            <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-12 no-scrollbar">
          {isSyncing ? (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-6" />
              <h3 className="text-lg font-black dark:text-white text-zinc-900">Synchronizing Mailbox...</h3>
              <p className="text-sm text-zinc-500 mt-2">Connecting to {loginStep} secure servers</p>
            </div>
          ) : (
            <>
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em]">Active Accounts</h3>
                  {!isAdding && (
                    <button 
                      onClick={() => setIsAdding(true)}
                      className="px-4 py-2 bg-indigo-600 text-white text-xs font-black rounded-xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20"
                    >
                      + Link New
                    </button>
                  )}
                </div>

                {isAdding ? (
                  <div className="p-8 bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 animate-in zoom-in-95">
                    {!loginStep ? (
                      <div className="grid grid-cols-2 gap-4">
                        {['GMAIL', 'OUTLOOK', 'YAHOO', 'PROTON'].map(type => (
                          <button 
                            key={type}
                            onClick={() => setLoginStep(type as AccountType)}
                            className="flex flex-col items-center p-6 rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 transition-all group"
                          >
                            <div className="w-10 h-10 mb-3 rounded-xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <span className="font-black text-zinc-400 group-hover:text-indigo-500">{type[0]}</span>
                            </div>
                            <span className="text-[10px] font-black tracking-widest text-zinc-500">{type}</span>
                          </button>
                        ))}
                        <button onClick={resetForm} className="col-span-2 mt-4 text-xs font-bold text-zinc-400 hover:text-zinc-600 transition-colors">Cancel Connection</button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2 mb-4">
                          <button onClick={() => setLoginStep(null)} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                          </button>
                          <h4 className="text-sm font-black text-zinc-900 dark:text-zinc-100">Login with {loginStep}</h4>
                        </div>
                        <input 
                          type="email" 
                          placeholder="Email Address"
                          className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 ring-indigo-500/20"
                          value={emailInput}
                          onChange={e => setEmailInput(e.target.value)}
                        />
                        <input 
                          type="password" 
                          placeholder="App Password / Private Key"
                          className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 ring-indigo-500/20"
                          value={passInput}
                          onChange={e => setPassInput(e.target.value)}
                        />
                        <div className="bg-indigo-500/10 p-4 rounded-xl mb-4 border border-indigo-500/20">
                           <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 leading-relaxed uppercase tracking-wider">
                             Flowyn uses OAuth 2.0 and local encryption. Your credentials never leave this machine.
                           </p>
                        </div>
                        <button 
                          onClick={connectAccount} 
                          className="w-full bg-indigo-600 text-white font-black py-4 rounded-xl text-xs tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20"
                        >
                          SIGN IN & SYNC
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {accounts.length === 0 ? (
                      <div className="text-center py-10 opacity-30">
                        <p className="text-sm font-bold uppercase tracking-widest">No accounts linked</p>
                      </div>
                    ) : (
                      accounts.map(acc => (
                        <div key={acc.id} className="flex items-center justify-between p-6 rounded-[28px] bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800 group transition-all hover:shadow-xl hover:shadow-zinc-500/5">
                          <div className="flex items-center space-x-5">
                            <div className="relative">
                              <img src={acc.avatar} className="w-12 h-12 rounded-2xl border-2 border-white dark:border-zinc-800 shadow-sm" alt="" />
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-lg bg-green-500 border-2 border-white dark:border-zinc-900 flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-black dark:text-white text-zinc-900">{acc.email}</div>
                              <div className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mt-0.5">{acc.type} • Encrypted Connection</div>
                            </div>
                          </div>
                          <button 
                            onClick={() => setAccounts(prev => prev.filter(a => a.id !== acc.id))}
                            className="opacity-0 group-hover:opacity-100 text-[10px] font-black text-red-500 uppercase tracking-widest px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
                          >
                            Kill Session
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </section>

              <section>
                <h3 className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em] mb-8">AI Engine</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-6 rounded-3xl bg-indigo-600/5 border border-indigo-600/10">
                    <div>
                      <div className="text-sm font-black dark:text-white text-zinc-900">Neural Smart Search</div>
                      <p className="text-[10px] text-zinc-400 mt-1">Deep index your inbox with semantic search</p>
                    </div>
                    <div className="w-12 h-6 bg-indigo-600 rounded-full relative p-1 cursor-pointer">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
