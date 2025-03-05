
import { ChatSessionType } from '../contexts/ChatContext';

const STORAGE_KEY = 'ankitxpilot-chats';
const LEARNED_DATA_KEY = 'ankitxpilot-learned-data';

export const saveChats = (chats: ChatSessionType[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  } catch (error) {
    console.error('Error saving chats to localStorage:', error);
  }
};

export const loadChats = (): ChatSessionType[] => {
  try {
    const savedChats = localStorage.getItem(STORAGE_KEY);
    if (savedChats) {
      const parsedChats = JSON.parse(savedChats) as ChatSessionType[];
      
      // Convert string dates back to Date objects
      return parsedChats.map(chat => ({
        ...chat,
        createdAt: new Date(chat.createdAt),
        updatedAt: new Date(chat.updatedAt),
        messages: chat.messages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
    }
  } catch (error) {
    console.error('Error loading chats from localStorage:', error);
  }
  
  return [];
};

export const saveLearnedData = (data: Record<string, string[]>): void => {
  try {
    localStorage.setItem(LEARNED_DATA_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving learned data to localStorage:', error);
  }
};

export const loadLearnedData = (): Record<string, string[]> => {
  try {
    const savedData = localStorage.getItem(LEARNED_DATA_KEY);
    if (savedData) {
      return JSON.parse(savedData) as Record<string, string[]>;
    }
  } catch (error) {
    console.error('Error loading learned data from localStorage:', error);
  }
  
  return {};
};

export const clearChats = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing chats from localStorage:', error);
  }
};

export const clearLearnedData = (): void => {
  try {
    localStorage.removeItem(LEARNED_DATA_KEY);
  } catch (error) {
    console.error('Error clearing learned data from localStorage:', error);
  }
};
