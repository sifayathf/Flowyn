
import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { MessageList } from './components/MessageList';
import { ThreadView } from './components/ThreadView';
import { TopBar } from './components/TopBar';
import { AISidebar } from './components/AISidebar';
import { Composer } from './components/Composer';
import { CalendarView } from './components/CalendarView';
import { SettingsModal } from './components/SettingsModal';
import { ContextMenu } from './components/ContextMenu';
import { EMAILS, ACCOUNTS, FOLDERS } from './mockData';
import { Email, Account, Folder, CalendarEvent, AppState } from './types';

const App: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem('flowyn_accounts');
    return saved ? JSON.parse(saved) : ACCOUNTS;
  });

  const [emails, setEmails] = useState<Email[]>(() => {
    const saved = localStorage.getItem('flowyn_emails');
    return saved ? JSON.parse(saved) : EMAILS;
  });

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('flowyn_theme') as 'dark' | 'light') || 'dark';
  });

  const [view, setView] = useState<'INBOX' | 'CALENDAR'>('INBOX');
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [activeFolderId, setActiveFolderId] = useState<string>('inbox');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, email: Email } | null>(null);

  useEffect(() => {
    localStorage.setItem('flowyn_accounts', JSON.stringify(accounts));
    localStorage.setItem('flowyn_emails', JSON.stringify(emails));
    localStorage.setItem('flowyn_theme', theme);
    document.documentElement.className = theme;
  }, [accounts, emails, theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const filteredEmails = useMemo(() => {
    return emails.filter(e => {
      const matchesAccount = !selectedAccountId || e.accountId === selectedAccountId;
      const matchesFolder = e.folderId === activeFolderId;
      const matchesSearch = e.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            e.from.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesAccount && matchesFolder && matchesSearch;
    });
  }, [emails, selectedAccountId, activeFolderId, searchQuery]);

  const handleAction = (emailId: string, action: 'star' | 'read' | 'archive' | 'delete') => {
    setEmails(prev => prev.map(e => {
      if (e.id !== emailId) return e;
      if (action === 'star') return { ...e, isStarred: !e.isStarred };
      if (action === 'read') return { ...e, isRead: !e.isRead };
      if (action === 'archive') return { ...e, folderId: 'archive' };
      if (action === 'delete') return { ...e, folderId: 'trash' };
      return e;
    }));
  };

  const handleSend = (newEmail: Email) => {
    setEmails(prev => [newEmail, ...prev]);
    setIsComposerOpen(false);
  };

  const handleSync = (newEmails: Email[]) => {
    setEmails(prev => [...newEmails, ...prev]);
  };

  const handleContextMenu = (e: React.MouseEvent, email: Email) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, email });
  };

  return (
    <div className="flex h-screen w-screen bg-white dark:bg-zinc-950 transition-colors duration-500 overflow-hidden select-none">
      <Sidebar 
        accounts={accounts}
        folders={FOLDERS}
        selectedAccountId={selectedAccountId}
        activeFolderId={activeFolderId}
        onSelectAccount={setSelectedAccountId}
        onSelectFolder={(id) => { setActiveFolderId(id); setView('INBOX'); }}
        onOpenCalendar={() => setView('CALENDAR')}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <div className="flex flex-col flex-1 min-w-0">
        <TopBar 
          theme={theme}
          onToggleTheme={toggleTheme}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          toggleAiSidebar={() => setIsAiSidebarOpen(!isAiSidebarOpen)}
        />

        <div className="flex flex-1 overflow-hidden">
          {view === 'INBOX' ? (
            <>
              <MessageList 
                emails={filteredEmails}
                selectedEmail={selectedEmail}
                onSelectEmail={setSelectedEmail}
                onContextMenu={handleContextMenu}
              />
              <ThreadView 
                email={selectedEmail}
                onClose={() => setSelectedEmail(null)}
                onAction={(action) => selectedEmail && handleAction(selectedEmail.id, action)}
              />
            </>
          ) : (
            <CalendarView accounts={accounts} />
          )}

          {isAiSidebarOpen && selectedEmail && (
            <AISidebar 
              email={selectedEmail}
              onClose={() => setIsAiSidebarOpen(false)}
            />
          )}
        </div>
      </div>

      {isComposerOpen && (
        <Composer 
          accounts={accounts}
          onClose={() => setIsComposerOpen(false)}
          onSend={handleSend}
          replyTo={null}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal 
          accounts={accounts}
          setAccounts={setAccounts}
          onEmailsSync={handleSync}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {contextMenu && (
        <ContextMenu 
          {...contextMenu} 
          onClose={() => setContextMenu(null)}
          onAction={(action) => handleAction(contextMenu.email.id, action)}
        />
      )}
    </div>
  );
};

export default App;
