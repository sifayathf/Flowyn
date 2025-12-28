
import React, { useState, useEffect } from 'react';
import { Account, AccountType, ProtocolType, Email } from '../types';
import { fetchSimulatedEmails, validateAccountSettings } from '../geminiService';
import { api } from '../apiService';

interface SettingsModalProps {
  accounts: Account[];
  setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
  onEmailsSync: (newEmails: Email[]) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ accounts, setAccounts, onEmailsSync, onClose }) => {
  const [step, setStep] = useState<'LIST' | 'CHOOSE_PATH' | 'OAUTH_WEBVIEW' | 'INFO' | 'MANUAL' | 'VERIFYING' | 'SERVICES'>('LIST');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [verificationSteps, setVerificationSteps] = useState<{ name: string; status: 'pending' | 'success' | 'error' | 'loading' }[]>([]);
  
  // Account Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('IMAP');
  const [showPassword, setShowPassword] = useState(false);
  
  // Manual Server Settings
  const [protocol, setProtocol] = useState<ProtocolType>('IMAP');
  const [incomingHost, setIncomingHost] = useState('');
  const [incomingPort, setIncomingPort] = useState('993');
  const [outgoingHost, setOutgoingHost] = useState('');
  const [outgoingPort, setOutgoingPort] = useState('465');
  const [security, setSecurity] = useState<'SSL/TLS' | 'STARTTLS' | 'NONE'>('SSL/TLS');

  const [linkedServices, setLinkedServices] = useState({
    calendar: true,
    contacts: true,
    chat: false
  });

  // OAuth Simulation State
  const [oauthStep, setOauthStep] = useState<'EMAIL' | 'PASSWORD' | 'GRANT'>('EMAIL');

  const selectProvider = (provider: AccountType) => {
    setAccountType(provider);
    setErrorMsg(null);
    setEmail('');
    setPassword('');
    if (provider === 'GMAIL' || provider === 'OUTLOOK') {
      setOauthStep('EMAIL');
      setStep('OAUTH_WEBVIEW');
    } else {
      setStep('INFO');
    }
  };

  const startManualVerification = async () => {
    setIsVerifying(true);
    setStep('VERIFYING');
    setVerificationSteps([
      { name: 'Establishing SSL/TLS', status: 'loading' },
      { name: 'IMAP Authentication', status: 'pending' },
      { name: 'SMTP Authorization', status: 'pending' }
    ]);

    const result = await validateAccountSettings({ email, password, protocol, incomingHost });
    
    if (result.success) {
      setVerificationSteps(v => v.map(s => ({ ...s, status: 'success' })));
      setTimeout(() => { setIsVerifying(false); setStep('SERVICES'); }, 800);
    } else {
      setIsVerifying(false);
      setErrorMsg(result.error || "Connection failed.");
      setVerificationSteps(v => v.map(s => ({ ...s, status: 'error' })));
    }
  };

  const handleOAuthComplete = () => {
    setIsVerifying(true);
    setStep('VERIFYING');
    setVerificationSteps([
      { name: 'Exchanging Auth Code', status: 'loading' },
      { name: 'Generating Refresh Token', status: 'pending' },
      { name: 'Vault Storage', status: 'pending' }
    ]);

    setTimeout(() => {
      setVerificationSteps(v => v.map((s, i) => i === 0 ? { ...s, status: 'success' } : (i === 1 ? { ...s, status: 'loading' } : s)));
      setTimeout(() => {
        setVerificationSteps(v => v.map((s, i) => i === 1 ? { ...s, status: 'success' } : (i === 2 ? { ...s, status: 'loading' } : s)));
        setTimeout(() => {
          setIsVerifying(false);
          setStep('SERVICES');
        }, 800);
      }, 1000);
    }, 1000);
  };

  const finalizeAndSave = async () => {
    setIsVerifying(true);
    try {
      const details = {
        email,
        name: fullName || email.split('@')[0],
        type: accountType,
        protocol: protocol,
        color: accountType === 'GMAIL' ? '#ea4335' : accountType === 'OUTLOOK' ? '#0078d4' : '#4f46e5',
        linkedServices,
        password: password, // For Manual
        oauth_token: "sim_token_123", // For OAuth
        refresh_token: "sim_refresh_123"
      };

      const newAcc = await api.createAccount(details);
      setAccounts(prev => [...prev, newAcc]);
      const mails = await fetchSimulatedEmails(email, accountType);
      onEmailsSync(mails);
      onClose();
    } catch (e: any) {
      setErrorMsg(e.message);
      setStep('INFO');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-zinc-950/95 backdrop-blur-2xl p-4">
      <div className="bg-white dark:bg-zinc-950 w-full max-w-2xl border border-zinc-200 dark:border-zinc-800 rounded-[48px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 ring-1 ring-white/10">
        
        {/* Header */}
        <div className="px-10 py-8 border-b border-zinc-100 dark:border-zinc-900 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black dark:text-white text-zinc-900 tracking-tighter">Connection Hub</h2>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mt-1">Thunderbird SASL Stack</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-all">
            <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-10 flex-1 overflow-y-auto max-h-[75vh] no-scrollbar">
          
          {step === 'LIST' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Linked Identites</h3>
                <button onClick={() => setStep('CHOOSE_PATH')} className="px-6 py-3 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg hover:bg-indigo-500">Add New</button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {accounts.map(acc => (
                  <div key={acc.id} className="p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-[32px] border border-zinc-100 dark:border-zinc-800 flex items-center justify-between group">
                    <div className="flex items-center space-x-5">
                      <div className="w-12 h-12 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                        <img src={acc.avatar} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div>
                        <div className="font-black text-zinc-900 dark:text-zinc-100 tracking-tight">{acc.email}</div>
                        <div className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">{acc.type} • {acc.status}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 'CHOOSE_PATH' && (
            <div className="space-y-6">
              <h3 className="text-3xl font-black dark:text-white text-zinc-900 tracking-tighter">Choose Provider</h3>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'GMAIL', name: 'Google Account', icon: 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png', desc: 'Login via Browser Handshake' },
                  { id: 'OUTLOOK', name: 'Microsoft Outlook', icon: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg', desc: 'Azure AD / Hotmail Login' },
                  { id: 'IMAP', name: 'Manual (IMAP/SMTP)', icon: null, desc: 'Enterprise Server Settings' }
                ].map(p => (
                  <button key={p.id} onClick={() => selectProvider(p.id as AccountType)} className="w-full p-8 bg-zinc-50 dark:bg-zinc-900 rounded-[32px] flex items-center space-x-6 hover:bg-indigo-600/5 border border-transparent hover:border-indigo-600/20 text-left transition-all group">
                    <div className="w-12 h-12 bg-white dark:bg-zinc-800 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      {p.icon ? <img src={p.icon} className="w-6 h-6" alt="" /> : <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                    </div>
                    <div>
                      <div className="font-black text-xl text-zinc-900 dark:text-white">{p.name}</div>
                      <div className="text-xs font-bold text-zinc-400">{p.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'OAUTH_WEBVIEW' && (
            <div className="bg-zinc-100 dark:bg-zinc-900/50 rounded-[40px] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-inner p-1">
              <div className="bg-white dark:bg-zinc-950 p-12 min-h-[400px] flex flex-col items-center animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-2xl mb-8">
                  <img src={accountType === 'GMAIL' ? "https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png" : "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"} className="w-10 h-10" alt="" />
                </div>
                
                {oauthStep === 'EMAIL' && (
                  <div className="w-full max-w-sm space-y-8">
                    <div className="text-center">
                      <h3 className="text-2xl font-black dark:text-white text-zinc-900">Sign in</h3>
                      <p className="text-sm text-zinc-500 font-bold mt-2">to continue to Flowyn Mail</p>
                    </div>
                    <div className="space-y-4">
                      <input value={email} onChange={e => setEmail(e.target.value)} className="w-full p-5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl outline-none focus:border-indigo-500 font-bold text-lg" placeholder="Email or phone" />
                      <button onClick={() => setOauthStep('PASSWORD')} className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-500 transition-all">Next</button>
                    </div>
                  </div>
                )}

                {oauthStep === 'PASSWORD' && (
                  <div className="w-full max-w-sm space-y-8">
                    <div className="text-center">
                      <h3 className="text-2xl font-black dark:text-white text-zinc-900">Welcome</h3>
                      <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full inline-flex items-center space-x-2 mt-4">
                        <div className="w-6 h-6 rounded-full bg-zinc-300" />
                        <span className="text-xs font-bold px-2">{email}</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl outline-none focus:border-indigo-500 font-bold text-lg" placeholder="Enter your password" />
                      <button onClick={() => setOauthStep('GRANT')} className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-500 transition-all">Sign In</button>
                    </div>
                  </div>
                )}

                {oauthStep === 'GRANT' && (
                  <div className="w-full max-w-sm space-y-8 text-center">
                    <h3 className="text-2xl font-black dark:text-white text-zinc-900">Allow Flowyn to?</h3>
                    <div className="space-y-3">
                      <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl flex items-center space-x-3 text-left">
                         <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></div>
                         <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Read, compose, and send email</div>
                      </div>
                      <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl flex items-center space-x-3 text-left">
                         <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
                         <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Manage your calendars</div>
                      </div>
                    </div>
                    <div className="flex space-x-3 pt-6">
                      <button onClick={() => setStep('CHOOSE_PATH')} className="flex-1 py-4 text-zinc-400 font-bold hover:text-zinc-600">Deny</button>
                      <button onClick={handleOAuthComplete} className="flex-1 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-500">Allow</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 'INFO' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-8">
              <h3 className="text-3xl font-black dark:text-white text-zinc-900 tracking-tighter">Server Identity</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">Display Name</label>
                  <input value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 outline-none focus:ring-2 ring-indigo-500/20 font-bold dark:text-white" placeholder="Alex Rivera" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">Email Address</label>
                  <input value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 outline-none focus:ring-2 ring-indigo-500/20 font-bold dark:text-white" placeholder="name@domain.com" />
                </div>
                <div className="space-y-2 relative">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">Account Password</label>
                  <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 outline-none focus:ring-2 ring-indigo-500/20 font-bold dark:text-white" placeholder="••••••••" />
                </div>
              </div>
              <div className="flex justify-between items-center pt-6">
                <button onClick={() => setStep('CHOOSE_PATH')} className="text-zinc-400 font-bold">Back</button>
                <button onClick={() => setStep('MANUAL')} className="px-12 py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl">Next</button>
              </div>
            </div>
          )}

          {step === 'MANUAL' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-8">
              <h3 className="text-3xl font-black dark:text-white text-zinc-900 tracking-tighter">Manual Topology</h3>
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-3">
                  {['IMAP', 'POP3'].map(p => (
                    <button key={p} onClick={() => setProtocol(p as ProtocolType)} className={`py-4 rounded-2xl border-2 font-black text-[10px] tracking-widest transition-all ${protocol === p ? 'border-indigo-600 bg-indigo-600/5 text-indigo-600' : 'border-zinc-100 dark:border-zinc-900 text-zinc-400'}`}>{p}</button>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest ml-1">Incoming ({protocol})</h4>
                    <input value={incomingHost} onChange={e => setIncomingHost(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl font-bold dark:text-white border border-zinc-100 dark:border-zinc-800" placeholder="imap.server.com" />
                    <div className="flex space-x-3">
                      <input value={incomingPort} onChange={e => setIncomingPort(e.target.value)} className="w-20 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl font-bold dark:text-white border border-zinc-100 dark:border-zinc-800" placeholder="993" />
                      <select value={security} onChange={(e: any) => setSecurity(e.target.value)} className="flex-1 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl font-black dark:text-white border border-zinc-100 dark:border-zinc-800 text-[10px] uppercase">
                        <option value="SSL/TLS">SSL/TLS</option>
                        <option value="STARTTLS">STARTTLS</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest ml-1">Outgoing (SMTP)</h4>
                    <input value={outgoingHost} onChange={e => setOutgoingHost(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl font-bold dark:text-white border border-zinc-100 dark:border-zinc-800" placeholder="smtp.server.com" />
                    <input value={outgoingPort} onChange={e => setOutgoingPort(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl font-bold dark:text-white border border-zinc-100 dark:border-zinc-800" placeholder="465" />
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center pt-8">
                <button onClick={() => setStep('INFO')} className="text-zinc-400 font-bold">Back</button>
                <button onClick={startManualVerification} className="px-12 py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl">Verify & Sync</button>
              </div>
            </div>
          )}

          {step === 'VERIFYING' && (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in">
              <div className="w-20 h-20 border-[6px] border-indigo-600/10 border-t-indigo-600 rounded-full animate-spin mb-10" />
              <h3 className="text-2xl font-black dark:text-white text-zinc-900 mb-8 tracking-tighter">Linking {email}</h3>
              <div className="w-full max-w-xs space-y-4 text-left">
                {verificationSteps.map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-5 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{s.name}</span>
                    <div className={`w-3 h-3 rounded-full ${s.status === 'success' ? 'bg-emerald-500' : s.status === 'loading' ? 'bg-indigo-500 animate-pulse' : 'bg-zinc-200'}`} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 'SERVICES' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-8">
              <div className="flex items-center space-x-6">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-[28px] flex items-center justify-center text-emerald-500 shadow-xl shadow-emerald-500/5"><svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></div>
                <div><h3 className="text-3xl font-black dark:text-white text-zinc-900 tracking-tighter">Verified</h3><p className="text-zinc-400 text-xs font-bold">{email}</p></div>
              </div>
              <div className="space-y-4">
                {['Calendar Sync', 'Contacts Indexing', 'Direct Chat Integration'].map((s, i) => (
                  <div key={i} className="p-8 bg-zinc-50 dark:bg-zinc-900/50 rounded-[40px] flex justify-between items-center border border-zinc-100 dark:border-zinc-800">
                    <span className="font-black text-zinc-900 dark:text-zinc-100 uppercase text-xs tracking-[0.2em]">{s}</span>
                    <div className="w-14 h-7 bg-indigo-600 rounded-full relative"><div className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full shadow-md" /></div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-8">
                <button onClick={() => setStep('CHOOSE_PATH')} className="text-zinc-400 font-bold">Restart</button>
                <button onClick={finalizeAndSave} className="px-16 py-6 bg-indigo-600 text-white font-black rounded-[32px] shadow-2xl tracking-widest uppercase text-xs hover:bg-indigo-500 transition-all">Ingest Mailbox</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
