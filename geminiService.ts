
import { GoogleGenAI, Type } from "@google/genai";
import { Email, Thread, Folder, Contact, ChatMessage, AccountType, ProtocolType } from './types';

/**
 * Simulates checking server settings via AI to ensure validity.
 * Returns a detailed status report for the connection steps.
 */
export const validateAccountSettings = async (details: any): Promise<{ 
  success: boolean; 
  error?: string;
  steps?: { name: string; status: 'success' | 'error' | 'pending' }[]
}> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Validate these simulated email server settings: ${JSON.stringify(details)}. 
    Return a JSON object:
    { 
      "success": boolean, 
      "error": string | null,
      "steps": [
        {"name": "Credentials", "status": "success" | "error"},
        {"name": "Incoming Server", "status": "success" | "error"},
        {"name": "Outgoing SMTP", "status": "success" | "error"}
      ]
    }
    If email ends in '@error.com', make it fail at the 'Credentials' step.
    If host contains 'offline', make it fail at 'Incoming Server'.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          success: { type: Type.BOOLEAN },
          error: { type: Type.STRING },
          steps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                status: { type: Type.STRING }
              },
              required: ["name", "status"]
            }
          }
        },
        required: ["success", "steps"]
      }
    }
  });
  try {
    const data = JSON.parse(response.text || '{"success": false, "error": "Unknown error", "steps": []}');
    return data;
  } catch {
    return { 
      success: false, 
      error: "Validation server unreachable",
      steps: [
        { name: "Credentials", status: "error" },
        { name: "Incoming Server", status: "error" },
        { name: "Outgoing SMTP", status: "error" }
      ]
    };
  }
};

export const fetchSimulatedEmails = async (accountEmail: string, type: string): Promise<Email[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate 10 emails for a ${type} account (${accountEmail}). Return as JSON matching the Email interface. Dates within 48h.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            threadId: { type: Type.STRING },
            from: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                email: { type: Type.STRING },
                avatar: { type: Type.STRING }
              }
            },
            to: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  email: { type: Type.STRING }
                }
              }
            },
            subject: { type: Type.STRING },
            snippet: { type: Type.STRING },
            body: { type: Type.STRING },
            date: { type: Type.STRING },
            isRead: { type: Type.BOOLEAN },
            isStarred: { type: Type.BOOLEAN },
            isPinned: { type: Type.BOOLEAN },
            isImportant: { type: Type.BOOLEAN },
            labels: { type: Type.ARRAY, items: { type: Type.STRING } },
            folderId: { type: Type.STRING }
          },
          required: ["id", "threadId", "from", "subject", "snippet", "body", "date", "isRead", "folderId"]
        }
      }
    }
  });
  try {
    const data = JSON.parse(response.text || "[]");
    return data.map((e: any) => ({ ...e, accountId: accountEmail, attachments: [] }));
  } catch { return []; }
};

export const fetchSimulatedContacts = async (accountEmail: string): Promise<Contact[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate 15 professional contacts for the address book of ${accountEmail}. Return as JSON array.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            email: { type: Type.STRING },
            company: { type: Type.STRING },
            avatar: { type: Type.STRING }
          },
          required: ["name", "email"]
        }
      }
    }
  });
  try {
    const data = JSON.parse(response.text || "[]");
    return data.map((c: any) => ({ ...c, id: Math.random().toString(), accountId: accountEmail }));
  } catch { return []; }
};

export const fetchSimulatedChats = async (accountEmail: string): Promise<ChatMessage[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a conversation history (10 messages) for a team chat synced with ${accountEmail}. Return as JSON array.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            senderId: { type: Type.STRING },
            senderName: { type: Type.STRING },
            text: { type: Type.STRING },
            timestamp: { type: Type.STRING }
          },
          required: ["id", "senderName", "text", "timestamp"]
        }
      }
    }
  });
  try {
    const data = JSON.parse(response.text || "[]");
    return data.map((m: any) => ({ ...m, accountId: accountEmail }));
  } catch { return []; }
};

export const classifyEmails = async (emails: Email[], folders: Folder[]): Promise<Record<string, string>> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const folderNames = folders.map(f => f.id);
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Decide folders for these emails based on content. Folders available: ${folderNames.join(', ')}. Emails: ${JSON.stringify(emails.slice(0, 5).map(e => ({ id: e.id, subject: e.subject })))}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            emailId: { type: Type.STRING },
            folderId: { type: Type.STRING }
          },
          required: ["emailId", "folderId"]
        }
      }
    }
  });
  try {
    const items = JSON.parse(response.text || '[]');
    const map: Record<string, string> = {};
    items.forEach((item: any) => {
      map[item.emailId] = item.folderId;
    });
    return map;
  } catch { return {}; }
};

export const summarizeThread = async (thread: Thread): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Summarize: ${thread.subject}. Content: ${thread.emails.map(e => e.snippet).join(' ')}`,
  });
  return response.text || "No summary.";
};

export const generateDraft = async (prompt: string, context?: Email): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Draft email based on: "${prompt}". Context: ${context?.subject || 'none'}`,
  });
  return response.text || "";
};

export const triageEmail = async (email: Email): Promise<{ importance: number; category: string }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Priority (0-10) and Category for: ${email.subject}. Return JSON {importance, category}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          importance: { type: Type.NUMBER },
          category: { type: Type.STRING }
        },
        required: ["importance", "category"]
      }
    },
  });
  try { return JSON.parse(response.text || '{"importance": 5, "category": "General"}'); } catch { return { importance: 5, category: "General" }; }
};
