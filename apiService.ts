
import { Account, AccountType, ProtocolType } from './types';

/**
 * MOCK API SERVICE
 * To fix "Failed to fetch", we simulate the FastAPI backend using localStorage.
 * This ensures the app is fully interactive even without a running python server.
 */

const STORAGE_KEY = 'flowyn_accounts_db';

const getStoredAccounts = (): Account[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveStoredAccounts = (accounts: Account[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
};

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  async getAccounts(): Promise<Account[]> {
    console.log("[Mock API] GET /accounts");
    await delay(300);
    return getStoredAccounts();
  },

  async createAccount(details: any): Promise<Account> {
    console.log("[Mock API] POST /accounts", details);
    await delay(800);
    
    const accounts = getStoredAccounts();
    if (accounts.some(a => a.email === details.email)) {
      throw new Error("Account already exists");
    }

    const newAccount: Account = {
      id: `acc-${Math.random().toString(36).substr(2, 9)}`,
      email: details.email,
      name: details.name || details.email.split('@')[0],
      type: details.type as AccountType,
      protocol: (details.protocol || 'IMAP') as ProtocolType,
      color: details.color || '#4f46e5',
      avatar: `https://ui-avatars.com/api/?name=${details.name || details.email}&background=random`,
      status: 'CONNECTED',
      linkedServices: details.linkedServices || { calendar: true, contacts: true, chat: false }
    };

    accounts.push(newAccount);
    saveStoredAccounts(accounts);
    return newAccount;
  },

  async deleteAccount(id: string): Promise<void> {
    console.log(`[Mock API] DELETE /accounts/${id}`);
    await delay(400);
    const accounts = getStoredAccounts().filter(a => a.id !== id);
    saveStoredAccounts(accounts);
  },

  async updateAccount(id: string, updates: any): Promise<Account> {
    console.log(`[Mock API] PATCH /accounts/${id}`, updates);
    await delay(300);
    const accounts = getStoredAccounts();
    const index = accounts.findIndex(a => a.id === id);
    if (index === -1) throw new Error("Account not found");

    accounts[index] = { ...accounts[index], ...updates };
    saveStoredAccounts(accounts);
    return accounts[index];
  }
};
