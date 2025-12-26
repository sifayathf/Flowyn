
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
import { Email, Account, Folder } from './types';

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
    const saved = localStorage.getItem('flowyn_theme');
    return (saved as 'dark' | 'light') || 'dark';
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

  // Derived folder counts for unread messages
  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    emails.forEach(email => {
      if (!email.isRead) {
        counts[email.folderId] = (counts[email.folderId] || 0) + 1;
      }
    });
    return counts;
  }, [emails]);

  const updatedFolders = useMemo(() => {
    return FOLDERS.map(f => ({
      ...f,
      count: folderCounts[f.id] || 0
    }));
  }, [folderCounts]);

  const filteredEmails = useMemo(() => {
    return emails.filter(e => {
      const matchesAccount = !selectedAccountId || e.accountId === selectedAccountId;
      const matchesFolder = e.folderId === activeFolderId;
      const matchesSearch = 
        e.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
        e.from.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.body.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesAccount && matchesFolder && matchesSearch;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [emails, selectedAccountId, activeFolderId, searchQuery]);

  const handleAction = (emailId: string, action: 'star' | 'read' | 'archive' | 'delete' | 'unread') => {
    setEmails(prev => prev.map(e => {
      if (e.id !== emailId) return e;
      if (action === 'star') return { ...e, isStarred: !e.isStarred };
      if (action === 'read') return { ...e, isRead: true };
      if (action === 'unread') return { ...e, isRead: false };
      if (action === 'archive') return { ...e, folderId: 'archive' };
      if (action === 'delete') return { ...e, folderId: 'trash' };
      return e;
    }));
    
    // Close thread view if message was archived or deleted
    if (action === 'archive' || action === 'delete') {
      if (selectedEmail?.id === emailId) {
        setSelectedEmail(null);
      }
    }
    // Close context menu if open
    setContextMenu(null);
  };

  const handleSend = (newEmail: Email) => {
    setEmails(prev => [newEmail, ...prev]);
    setIsComposerOpen(false);
  };

  const handleSync = (newEmails: Email[]) => {
    // Merge new emails, avoiding duplicates by ID
    setEmails(prev => {
      const existingIds = new Set(prev.map(e => e.id));
      const uniqueNew = newEmails.filter(e => !existingIds.has(e.id));
      return [...uniqueNew, ...prev];
    });
    // Immediately select the first synced email to show progress
    if (newEmails.length > 0) {
      setSelectedEmail(newEmails[0]);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, email: Email) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, email });
  };

  const openComposer = () => setIsComposerOpen(true);

  return (
    <div className="flex h-screen w-screen bg-white dark:bg-zinc-950 transition-colors duration-500 overflow-hidden select-none">
      <Sidebar 
        accounts={accounts}
        folders={updatedFolders}
        selectedAccountId={selectedAccountId}
        activeFolderId={activeFolderId}
        onSelectAccount={setSelectedAccountId}
        onSelectFolder={(id) => { 
          setActiveFolderId(id); 
          setView('INBOX'); 
          setSelectedEmail(null); 
        }}
        onOpenCalendar={() => setView('CALENDAR')}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onCompose={openComposer}
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
                onSelectEmail={(email) => {
                  setSelectedEmail(email);
                  if (!email.isRead) handleAction(email.id, 'read');
                }}
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
          onAction={(action) => handleAction(contextMenu.email.id, action as any)}
        />
      )}
    </div>
  );
};

export default App;
