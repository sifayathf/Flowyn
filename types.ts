
export type AccountType = 'GMAIL' | 'OUTLOOK' | 'IMAP' | 'YAHOO' | 'PROTON';

export interface Account {
  id: string;
  email: string;
  name: string;
  type: AccountType;
  color: string;
  avatar?: string;
  status: 'CONNECTED' | 'SYNCING' | 'ERROR';
}

export interface Folder {
  id: string;
  name: string;
  type: 'INBOX' | 'SENT' | 'DRAFTS' | 'ARCHIVE' | 'TRASH' | 'JUNK' | 'CUSTOM';
  icon?: string;
  count?: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  description?: string;
  accountId: string;
}

export interface Email {
  id: string;
  threadId: string;
  accountId: string;
  from: { name: string; email: string; avatar?: string };
  to: { name: string; email: string }[];
  subject: string;
  snippet: string;
  body: string;
  date: string;
  isRead: boolean;
  isStarred: boolean;
  isPinned: boolean;
  isImportant: boolean;
  labels: string[];
  attachments: any[];
  folderId: string;
}

/**
 * Added Thread interface to resolve import errors in mockData.ts, geminiService.ts, and AISidebar.tsx.
 * Represents a collection of emails belonging to the same conversation.
 */
export interface Thread {
  id: string;
  emails: Email[];
  subject: string;
  lastMessageDate: string;
  participants: { name: string; email: string; avatar?: string }[];
}

export interface AppState {
  theme: 'dark' | 'light';
  view: 'INBOX' | 'CALENDAR' | 'SETTINGS';
}
