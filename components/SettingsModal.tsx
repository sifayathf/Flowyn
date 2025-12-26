
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
    
    try {
      // Simulate real auth latency
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newAcc: Account = {
        id: emailInput, // Use email as unique ID for simplicity in this demo
        email: emailInput,
        name: emailInput.split('@')[0],
        type: loginStep,
        color: loginStep === 'GMAIL' ? '#ea4335' : (loginStep === 'OUTLOOK' ? '#00a4ef' : '#7b2cb1'),
        avatar: `https://picsum.photos/seed/${emailInput}/40/40`,
        status: 'CONNECTED'
      };

      // Fetch the last 10 emails from the simulated server (Gemini)
      const simulatedMails = await fetchSimulatedEmails(emailInput, loginStep);
      
      setAccounts(prev => {
        // Prevent duplicate accounts
        if (prev.find(a => a.id === newAcc.id)) return prev;
        return [...prev, newAcc];
      });
      
      onEmailsSync(simulatedMails);
      resetForm();
    } catch (err) {
      console.error("Login failed", err);
      alert("Failed to connect account. Please check your AI API Key.");
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-zinc-950/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-zinc-950 w-full max-w-xl border border-zinc-200 dark:border-zinc-800 rounded-[40px] shadow-2xl flex flex-col overflow-hidden">
        <div className="p-8 border-b border-zinc-100 dark:border-zinc-900 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/20">
          <div>
            <h2 className="text-2xl font-black dark:text-white text-zinc-900 tracking-tight">Flowyn Hub</h2>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Manage your connected spaces</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-all">
            <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-12 no-scrollbar min-h-[450px]">
          {isSyncing ? (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in-95">
              <div className="relative w-20 h-20 mb-8">
                <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h3 className="text-xl font-black dark:text-white text-zinc-900 tracking-tight">Syncing Mailbox...</h3>
              <p className="text-sm font-bold text-zinc-500 mt-2 text-center max-w-xs">
                Establishing encrypted handshake and fetching your last 10 messages from {loginStep}.
              </p>
            </div>
          ) : (
            <>
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em]">Connected Accounts</h3>
                  {!isAdding && (
                    <button 
                      onClick={() => setIsAdding(true)}
                      className="px-4 py-2 bg-indigo-600 text-white text-xs font-black rounded-xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20"
                    >
                      + Connect New
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
                            className="flex flex-col items-center p-6 rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 transition-all group hover:bg-white dark:hover:bg-zinc-800"
                          >
                            <div className="w-12 h-12 mb-3 rounded-2xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <span className="font-black text-zinc-500 group-hover:text-indigo-500">{type[0]}</span>
                            </div>
                            <span className="text-[10px] font-black tracking-widest text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">{type}</span>
                          </button>
                        ))}
                        <button onClick={resetForm} className="col-span-2 mt-4 text-xs font-bold text-zinc-400 hover:text-zinc-600 transition-colors">Go Back</button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2 mb-4">
                          <button onClick={() => setLoginStep(null)} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                          </button>
                          <h4 className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase">Login to {loginStep}</h4>
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
                        <button 
                          onClick={connectAccount} 
                          className="w-full bg-indigo-600 text-white font-black py-4 rounded-xl text-xs tracking-[0.2em] hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 mt-4 active:scale-95"
                        >
                          SIGN IN & FETCH 10 MAILS
                        </button>
                        <p className="text-[10px] text-zinc-400 text-center font-bold uppercase tracking-wider">Secure OAuth handshake via Flowyn Edge</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {accounts.length === 0 ? (
                      <div className="py-12 text-center text-zinc-400 font-bold uppercase tracking-widest text-xs opacity-50">No accounts connected</div>
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
                              <div className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mt-0.5">{acc.type} • Last sync: just now</div>
                            </div>
                          </div>
                          <button 
                            onClick={() => setAccounts(prev => prev.filter(a => a.id !== acc.id))}
                            className="opacity-0 group-hover:opacity-100 text-[10px] font-black text-red-500 uppercase tracking-widest px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
                          >
                            Disconnect
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </section>

              <section>
                <h3 className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em] mb-8">AI Synchronization</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800">
                    <div>
                      <div className="text-sm font-black dark:text-white text-zinc-900">Neural Sync Depth</div>
                      <p className="text-[10px] text-zinc-400 mt-1 uppercase font-bold tracking-widest">Active: Latest 10 messages</p>
                    </div>
                    <div className="flex space-x-1">
                      {[10, 25, 50].map(val => (
                        <div key={val} className={`px-2 py-1 rounded-md text-[10px] font-black ${val === 10 ? 'bg-indigo-600 text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400'}`}>
                          {val}
                        </div>
                      ))}
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
