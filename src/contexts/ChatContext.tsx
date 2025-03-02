
import React, { createContext, useContext, useEffect, useState } from 'react';
import { sendMessage } from '../services/geminiService';
import { saveChats, loadChats } from '../utils/localStorage';

export type MessageType = {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  isCode?: boolean;
};

export type ChatSessionType = {
  id: string;
  title: string;
  messages: MessageType[];
  createdAt: Date;
  updatedAt: Date;
};

interface ChatContextType {
  currentSession: ChatSessionType | null;
  sessions: ChatSessionType[];
  isLoading: boolean;
  error: string | null;
  sendUserMessage: (message: string, generateCode?: boolean) => Promise<void>;
  createNewSession: () => void;
  switchSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  clearSessions: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessions, setSessions] = useState<ChatSessionType[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSessionType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedSessions = loadChats();
    if (savedSessions.length > 0) {
      setSessions(savedSessions);
      setCurrentSession(savedSessions[0]);
    } else {
      createNewSession();
    }
  }, []);

  useEffect(() => {
    if (sessions.length > 0) {
      saveChats(sessions);
    }
  }, [sessions]);

  const createNewSession = () => {
    const newSession: ChatSessionType = {
      id: crypto.randomUUID(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setSessions(prevSessions => [newSession, ...prevSessions]);
    setCurrentSession(newSession);
  };

  const switchSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSession(session);
    }
  };

  const deleteSession = (sessionId: string) => {
    setSessions(prevSessions => {
      const filteredSessions = prevSessions.filter(s => s.id !== sessionId);
      
      // If we're deleting the current session, switch to another one
      if (currentSession?.id === sessionId) {
        if (filteredSessions.length > 0) {
          setCurrentSession(filteredSessions[0]);
        } else {
          createNewSession();
        }
      }
      
      return filteredSessions;
    });
  };

  const clearSessions = () => {
    setSessions([]);
    createNewSession();
  };

  const sendUserMessage = async (message: string, generateCode = false) => {
    if (!currentSession) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Add user message to the current session
      const userMessage: MessageType = {
        id: crypto.randomUUID(),
        text: message,
        sender: 'user',
        timestamp: new Date()
      };
      
      const updatedMessages = [...currentSession.messages, userMessage];
      
      // Check for special queries
      let responseText = '';
      
      if (message.toLowerCase().includes("who made you") || 
          message.toLowerCase().includes("who created you")) {
        responseText = "Ankit Pramanik, A Web Developer and AI Trainer made me.";
      } else if (
        message.toLowerCase().includes("who is ankit") ||
        message.toLowerCase().includes("who's ankit") ||
        message.toLowerCase().includes("tell me about ankit") ||
        message.toLowerCase().includes("about ankit")
      ) {
        responseText = "Ankit is a web developer and AI Trainer who knows various coding languages. To know more about him reach https://ankit404developer.github.io/About/";
      } else {
        // Send message to the AI API
        responseText = await sendMessage(message, generateCode);
      }

      // Add assistant response
      const assistantMessage: MessageType = {
        id: crypto.randomUUID(),
        text: responseText,
        sender: 'assistant',
        timestamp: new Date(),
        isCode: generateCode
      };
      
      const finalMessages = [...updatedMessages, assistantMessage];
      
      // Update the current session with new messages
      const updatedSession = {
        ...currentSession,
        messages: finalMessages,
        title: currentSession.messages.length === 0 ? message.substring(0, 30) : currentSession.title,
        updatedAt: new Date()
      };
      
      // Update state
      setCurrentSession(updatedSession);
      setSessions(prevSessions => 
        prevSessions.map(s => s.id === currentSession.id ? updatedSession : s)
      );
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error sending message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    currentSession,
    sessions,
    isLoading,
    error,
    sendUserMessage,
    createNewSession,
    switchSession,
    deleteSession,
    clearSessions
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
