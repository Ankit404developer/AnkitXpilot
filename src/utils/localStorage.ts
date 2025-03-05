
import { ChatSessionType } from '../contexts/ChatContext';

const STORAGE_KEY = 'ankitxpilot-chats';

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

export const clearChats = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing chats from localStorage:', error);
  }
};
