
import { Account, Email, Folder, Thread } from './types';

export const ACCOUNTS: Account[] = [
  { id: 'acc-1', email: 'alex@flowyn.io', name: 'Alex Rivera', type: 'GMAIL', color: '#ef4444', avatar: 'https://picsum.photos/seed/alex/40/40', status: 'CONNECTED' },
];

export const FOLDERS: Folder[] = [
  { id: 'inbox', name: 'Inbox', type: 'INBOX', count: 2 },
  { id: 'sent', name: 'Sent', type: 'SENT' },
  { id: 'drafts', name: 'Drafts', type: 'DRAFTS', count: 0 },
  { id: 'archive', name: 'Archive', type: 'ARCHIVE' },
  { id: 'trash', name: 'Trash', type: 'TRASH' },
];

export const EMAILS: Email[] = [
  {
    id: 'msg-1',
    threadId: 'th-1',
    accountId: 'acc-1',
    from: { name: 'Flowyn Team', email: 'welcome@flowyn.io', avatar: 'https://picsum.photos/seed/flowyn/40/40' },
    to: [{ name: 'Alex Rivera', email: 'alex@flowyn.io' }],
    subject: 'Welcome to Flowyn!',
    snippet: 'Welcome to the future of communication. Your inbox is now supercharged with AI.',
    body: `Hey Alex,<br/><br/>Welcome to Flowyn! You've just taken the first step toward a more intelligent inbox.<br/><br/>Try using <b>Flowyn AI</b> to summarize your threads or draft replies. We're here to help you reach Inbox Zero faster than ever before.<br/><br/>Best,<br/>The Flowyn Team`,
    date: new Date().toISOString(),
    isRead: false,
    isStarred: true,
    isPinned: true,
    isImportant: true,
    labels: ['Official'],
    attachments: [],
    folderId: 'inbox'
  }
];
