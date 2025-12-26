
import { GoogleGenAI, Type } from "@google/genai";
import { Email, Thread, Folder } from './types';

export const fetchSimulatedEmails = async (accountEmail: string, type: string): Promise<Email[]> => {
  // Initialize AI client inside function to ensure up-to-date API key is used
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate exactly 10 realistic email objects in JSON format for a ${type} account owned by ${accountEmail}. 
    Include diverse topics: professional collaborations, newsletters, security alerts, travel bookings, and personal notes.
    Ensure dates are spread across the last 72 hours.
    Return an array of objects matching this structure:
    {
      "id": "msg-random-id",
      "threadId": "th-random-id",
      "from": { "name": "Sender Name", "email": "sender@example.com", "avatar": "https://picsum.photos/seed/random/40/40" },
      "to": [{ "name": "Receiver Name", "email": "${accountEmail}" }],
      "subject": "Clear Subject Line",
      "snippet": "Short 1-sentence preview",
      "body": "Full HTML email body with paragraphs",
      "date": "ISO-8601-String",
      "isRead": false,
      "isStarred": false,
      "isPinned": false,
      "isImportant": true,
      "labels": ["Category"],
      "folderId": "inbox"
    }`,
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
          required: ["id", "threadId", "from", "subject", "snippet", "body", "date", "isRead", "labels", "folderId"]
        }
      }
    }
  });

  try {
    const data = JSON.parse(response.text || "[]");
    return data.map((e: any) => ({
      ...e,
      accountId: accountEmail,
      attachments: []
    }));
  } catch (err) {
    console.error("Failed to parse simulated emails", err);
    return [];
  }
};

/**
 * Bulk organizes emails by suggesting target folders for each message.
 */
export const classifyEmails = async (emails: Email[], folders: Folder[]): Promise<Record<string, string>> => {
  // Initialize AI client inside function to ensure up-to-date API key is used
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const emailContext = emails.map(e => ({ id: e.id, subject: e.subject, from: e.from.name, snippet: e.snippet }));
  const folderNames = folders.map(f => f.id);

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are an inbox assistant. Given a list of emails and a list of target folders, decide which folder each email belongs in.
    Available Folders: ${folderNames.join(', ')}
    Emails: ${JSON.stringify(emailContext)}
    Return JSON mapping: { "emailId": "folderId" }`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        description: "Mapping of email IDs to suggested folder IDs"
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch {
    return {};
  }
};

export const summarizeThread = async (thread: Thread): Promise<string> => {
  // Initialize AI client inside function to ensure up-to-date API key is used
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const content = thread.emails.map(e => `${e.from.name}: ${e.snippet}`).join('\n');
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Summarize the following email conversation in 3 concise bullet points:\n\n${content}`,
    config: { temperature: 0.7 }
  });
  return response.text || "Summary unavailable.";
};

export const generateDraft = async (prompt: string, context?: Email): Promise<string> => {
  // Initialize AI client inside function to ensure up-to-date API key is used
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const contextStr = context ? `Context Email Subject: ${context.subject}\nBody: ${context.body}` : '';
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are an executive assistant. Generate a professional email draft based on this prompt: "${prompt}".\n\n${contextStr}`,
    config: { temperature: 1 }
  });
  return response.text || "";
};

export const triageEmail = async (email: Email): Promise<{ importance: number; category: string }> => {
  // Initialize AI client inside function to ensure up-to-date API key is used
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this email and return JSON with priority (0-10) and category (Work, Personal, Promo, Social).\n\nSubject: ${email.subject}\nSnippet: ${email.snippet}`,
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
  try {
    return JSON.parse(response.text || '{"importance": 5, "category": "Work"}');
  } catch {
    return { importance: 5, category: "Work" };
  }
};
