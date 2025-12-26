
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
import { BatchToolbar } from './components/BatchToolbar';
import { EMAILS, ACCOUNTS, FOLDERS } from './mockData';
import { Email, Account, Folder } from './types';
import { classifyEmails } from './geminiService';

const App: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem('flowyn_accounts');
    return saved ? JSON.parse(saved) : ACCOUNTS;
  });

  const [emails, setEmails] = useState<Email[]>(() => {
    const saved = localStorage.getItem('flowyn_emails');
    return saved ? JSON.parse(saved) : EMAILS;
  });

  const [folders, setFolders] = useState<Folder[]>(() => {
    const saved = localStorage.getItem('flowyn_folders');
    return saved ? JSON.parse(saved) : FOLDERS;
  });

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('flowyn_theme');
    return (saved as 'dark' | 'light') || 'dark';
  });

  const [view, setView] = useState<'INBOX' | 'CALENDAR'>('INBOX');
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [activeFolderId, setActiveFolderId] = useState<string>('inbox');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [selectedEmailIds, setSelectedEmailIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(false);
  const [isOrganizing, setIsOrganizing] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, email: Email } | null>(null);

  useEffect(() => {
    localStorage.setItem('flowyn_accounts', JSON.stringify(accounts));
    localStorage.setItem('flowyn_emails', JSON.stringify(emails));
    localStorage.setItem('flowyn_folders', JSON.stringify(folders));
    localStorage.setItem('flowyn_theme', theme);
    document.documentElement.className = theme;
  }, [accounts, emails, folders, theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    emails.forEach(email => {
      if (!email.isRead) {
        counts[email.folderId] = (counts[email.folderId] || 0) + 1;
      }
    });
    return counts;
  }, [emails]);

  const displayFolders = useMemo(() => {
    return folders.map(f => ({
      ...f,
      count: folderCounts[f.id] || 0
    }));
  }, [folders, folderCounts]);

  const filteredEmails = useMemo(() => {
    return emails.filter(e => {
      const matchesAccount = !selectedAccountId || e.accountId === selectedAccountId;
      const matchesFolder = e.folderId === activeFolderId;
      const matchesSearch = 
        e.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
        e.from.name.toLowerCase().includes(searchQuery.toLowerCase());
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
    if (action === 'archive' || action === 'delete') {
      if (selectedEmail?.id === emailId) setSelectedEmail(null);
    }
  };

  const moveEmails = (ids: string[], targetFolderId: string) => {
    setEmails(prev => prev.map(e => ids.includes(e.id) ? { ...e, folderId: targetFolderId } : e));
    setSelectedEmailIds(new Set());
    if (ids.includes(selectedEmail?.id || '')) setSelectedEmail(null);
  };

  const handleMagicOrganize = async () => {
    if (filteredEmails.length === 0) return;
    setIsOrganizing(true);
    try {
      const suggestions = await classifyEmails(filteredEmails.slice(0, 10), folders);
      setEmails(prev => prev.map(e => suggestions[e.id] ? { ...e, folderId: suggestions[e.id] } : e));
    } catch (err) {
      console.error("AI Organize failed", err);
    } finally {
      setIsOrganizing(false);
    }
  };

  const createFolder = (name: string) => {
    const newFolder: Folder = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name: name,
      type: 'CUSTOM'
    };
    setFolders(prev => [...prev, newFolder]);
  };

  const handleSend = (newEmail: Email) => {
    setEmails(prev => [newEmail, ...prev]);
    setIsComposerOpen(false);
  };

  const toggleSelectEmail = (id: string) => {
    setSelectedEmailIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex h-screen w-screen bg-white dark:bg-zinc-950 transition-colors duration-500 overflow-hidden select-none">
      <Sidebar 
        accounts={accounts}
        folders={displayFolders}
        selectedAccountId={selectedAccountId}
        activeFolderId={activeFolderId}
        onSelectAccount={setSelectedAccountId}
        onSelectFolder={(id) => { 
          setActiveFolderId(id); 
          setView('INBOX'); 
          setSelectedEmail(null);
          setSelectedEmailIds(new Set());
        }}
        onOpenCalendar={() => setView('CALENDAR')}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onCompose={() => setIsComposerOpen(true)}
        onMoveEmails={moveEmails}
        onCreateFolder={createFolder}
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
          {view === 'INBOX' ? (
            <>
              <MessageList 
                emails={filteredEmails}
                selectedEmail={selectedEmail}
                selectedEmailIds={selectedEmailIds}
                onSelectEmail={(email) => {
                  setSelectedEmail(email);
                  if (!email.isRead) handleAction(email.id, 'read');
                }}
                onToggleSelect={toggleSelectEmail}
                onContextMenu={(e, email) => {
                  e.preventDefault();
                  setContextMenu({ x: e.clientX, y: e.clientY, email });
                }}
                onMagicOrganize={handleMagicOrganize}
                isOrganizing={isOrganizing}
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

        {selectedEmailIds.size > 0 && (
          <BatchToolbar 
            count={selectedEmailIds.size}
            onAction={(action) => {
              // Fix for line 217/218: Cast the array to string[] to resolve 'unknown[]' type inference issue
              const ids = Array.from(selectedEmailIds) as string[];
              if (action === 'archive') moveEmails(ids, 'archive');
              if (action === 'delete') moveEmails(ids, 'trash');
              if (action === 'read') {
                setEmails(prev => prev.map(e => ids.includes(e.id) ? { ...e, isRead: true } : e));
                setSelectedEmailIds(new Set());
              }
            }}
            onClear={() => setSelectedEmailIds(new Set())}
          />
        )}
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
          onEmailsSync={(newMails) => setEmails(prev => [...newMails, ...prev])}
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
