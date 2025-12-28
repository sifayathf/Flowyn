
export type AccountType = 'GMAIL' | 'OUTLOOK' | 'IMAP' | 'YAHOO' | 'PROTON';
export type ProtocolType = 'IMAP' | 'POP3' | 'EXCHANGE';

export interface Account {
  id: string;
  email: string;
  name: string;
  type: AccountType;
  protocol: ProtocolType;
  color: string;
  avatar?: string;
  status: 'CONNECTED' | 'SYNCING' | 'ERROR';
  linkedServices: {
    calendar: boolean;
    contacts: boolean;
    chat: boolean;
  };
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

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  company?: string;
  accountId: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
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

export interface Thread {
  id: string;
  emails: Email[];
  subject: string;
  lastMessageDate: string;
  participants: { name: string; email: string; avatar?: string }[];
}

export interface AppState {
  theme: 'dark' | 'light';
  view: 'INBOX' | 'CALENDAR' | 'CONTACTS' | 'CHAT' | 'SETTINGS';
}
