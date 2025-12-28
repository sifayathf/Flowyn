
import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { MessageList } from './components/MessageList';
import { ThreadView } from './components/ThreadView';
import { TopBar } from './components/TopBar';
import { AISidebar } from './components/AISidebar';
import { Composer } from './components/Composer';
import { CalendarView } from './components/CalendarView';
import { ContactsView } from './components/ContactsView';
import { ChatView } from './components/ChatView';
import { SettingsModal } from './components/SettingsModal';
import { ContextMenu } from './components/ContextMenu';
import { BatchToolbar } from './components/BatchToolbar';
import { EMAILS, ACCOUNTS, FOLDERS } from './mockData';
import { Email, Account, Folder, Contact, ChatMessage } from './types';
import { classifyEmails, fetchSimulatedEmails, fetchSimulatedContacts, fetchSimulatedChats } from './geminiService';
import { api } from './apiService';

const App: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [emails, setEmails] = useState<Email[]>(() => {
    const saved = localStorage.getItem('flowyn_emails');
    return saved ? JSON.parse(saved) : EMAILS;
  });

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [folders, setFolders] = useState<Folder[]>(FOLDERS);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('flowyn_theme') as any) || 'dark');
  const [view, setView] = useState<'INBOX' | 'CALENDAR' | 'CONTACTS' | 'CHAT'>('INBOX');
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [activeFolderId, setActiveFolderId] = useState<string>('inbox');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [selectedEmailIds, setSelectedEmailIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(false);
  const [isOrganizing, setIsOrganizing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, email: Email } | null>(null);

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const data = await api.getAccounts();
        setAccounts(data.length > 0 ? data : ACCOUNTS);
      } catch (e) {
        setAccounts(ACCOUNTS);
      }
    };
    loadAccounts();
  }, []);

  useEffect(() => {
    localStorage.setItem('flowyn_emails', JSON.stringify(emails));
    localStorage.setItem('flowyn_theme', theme);
    document.documentElement.className = theme;
  }, [emails, theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const handleSyncAll = async () => {
    if (accounts.length === 0 || isSyncing) return;
    setIsSyncing(true);
    try {
      const allNewEmails: Email[] = [];
      const syncTasks = accounts.map(async acc => {
        const mails = await fetchSimulatedEmails(acc.email, acc.type);
        allNewEmails.push(...mails);
      });
      await Promise.all(syncTasks);
      setEmails(prev => [...allNewEmails, ...prev]);
    } catch (err) {
      console.error("Global Sync failed", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleEmailAction = (emailId: string, action: string) => {
    setEmails(prev => prev.map(e => {
      if (e.id !== emailId) return e;
      switch (action) {
        case 'star': return { ...e, isStarred: !e.isStarred };
        case 'read': return { ...e, isRead: true };
        case 'unread': return { ...e, isRead: false };
        case 'archive': return { ...e, folderId: 'archive' };
        case 'delete': return { ...e, folderId: 'trash' };
        default: return e;
      }
    }));
    if (selectedEmail?.id === emailId && (action === 'archive' || action === 'delete')) {
      setSelectedEmail(null);
    }
    setContextMenu(null);
  };

  const handleBatchAction = (action: 'archive' | 'delete' | 'read') => {
    setEmails(prev => prev.map(e => {
      if (!selectedEmailIds.has(e.id)) return e;
      switch (action) {
        case 'read': return { ...e, isRead: true };
        case 'archive': return { ...e, folderId: 'archive' };
        case 'delete': return { ...e, folderId: 'trash' };
        default: return e;
      }
    }));
    if (selectedEmail && selectedEmailIds.has(selectedEmail.id) && (action === 'archive' || action === 'delete')) {
      setSelectedEmail(null);
    }
    setSelectedEmailIds(new Set());
  };

  const filteredEmails = useMemo(() => {
    return emails.filter(e => {
      const matchesAccount = !selectedAccountId || e.accountId === selectedAccountId;
      const matchesFolder = e.folderId === activeFolderId;
      const matchesSearch = !searchQuery || e.subject.toLowerCase().includes(searchQuery.toLowerCase()) || e.from.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesAccount && matchesFolder && matchesSearch;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [emails, selectedAccountId, activeFolderId, searchQuery]);

  return (
    <div className="flex h-screen w-screen bg-white dark:bg-zinc-950 transition-colors duration-500 overflow-hidden select-none">
      <Sidebar 
        accounts={accounts}
        folders={folders}
        selectedAccountId={selectedAccountId}
        activeFolderId={activeFolderId}
        onSelectAccount={setSelectedAccountId}
        onSelectFolder={setActiveFolderId}
        onViewChange={(v) => { setView(v as any); setSelectedEmail(null); }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onCompose={() => setIsComposerOpen(true)}
      />

      <div className="flex flex-col flex-1 min-w-0 relative">
        <TopBar 
          theme={theme}
          onToggleTheme={toggleTheme}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          toggleAiSidebar={() => setIsAiSidebarOpen(!isAiSidebarOpen)}
        />

        <div className="flex flex-1 overflow-hidden">
          {view === 'INBOX' && (
            <>
              <MessageList 
                emails={filteredEmails}
                selectedEmail={selectedEmail}
                selectedEmailIds={selectedEmailIds}
                onSelectEmail={setSelectedEmail}
                onToggleSelect={(id) => {
                  setSelectedEmailIds(prev => {
                    const next = new Set(prev);
                    if (next.has(id)) next.delete(id); else next.add(id);
                    return next;
                  });
                }}
                onContextMenu={(e, email) => {
                  e.preventDefault();
                  setContextMenu({ x: e.clientX, y: e.clientY, email });
                }}
                onAIOrganize={() => {}} // Connect if needed
                isOrganizing={isOrganizing}
                onSync={handleSyncAll}
                isSyncing={isSyncing}
              />
              <ThreadView 
                email={selectedEmail}
                onClose={() => setSelectedEmail(null)}
                onAction={(action) => selectedEmail && handleEmailAction(selectedEmail.id, action)}
              />
            </>
          )}

          {view === 'CALENDAR' && <CalendarView accounts={accounts} />}
          {view === 'CONTACTS' && <ContactsView contacts={contacts} />}
          {view === 'CHAT' && <ChatView chats={chats} accounts={accounts} />}

          {isAiSidebarOpen && selectedEmail && (
            <AISidebar email={selectedEmail} onClose={() => setIsAiSidebarOpen(false)} />
          )}
        </div>
      </div>

      {contextMenu && (
        <ContextMenu 
          x={contextMenu.x} 
          y={contextMenu.y} 
          onClose={() => setContextMenu(null)} 
          onAction={(action) => handleEmailAction(contextMenu.email.id, action)} 
        />
      )}

      {selectedEmailIds.size > 0 && (
        <BatchToolbar 
          count={selectedEmailIds.size} 
          onAction={handleBatchAction} 
          onClear={() => setSelectedEmailIds(new Set())} 
        />
      )}

      {isSettingsOpen && (
        <SettingsModal 
          accounts={accounts}
          setAccounts={setAccounts}
          onEmailsSync={(mails) => setEmails(prev => [...mails, ...prev])}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {isComposerOpen && <Composer accounts={accounts} onClose={() => setIsComposerOpen(false)} onSend={(m) => setEmails([m, ...emails])} replyTo={null} />}
    </div>
  );
};

// Fixed: Added default export for App component
export default App;
