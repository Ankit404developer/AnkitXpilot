
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
  isTemporary?: boolean;
};

interface ChatContextType {
  currentSession: ChatSessionType | null;
  sessions: ChatSessionType[];
  isLoading: boolean;
  error: string | null;
  sendUserMessage: (message: string, generateCode?: boolean, thinkDeeply?: boolean) => Promise<void>;
  regenerateLastResponse: () => Promise<void>;
  createNewSession: (isTemporary?: boolean) => void;
  switchSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  clearSessions: () => void;
  shareSession: (sessionId: string) => Promise<string>;
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
      // Filter out temporary sessions when loading
      const permanentSessions = savedSessions.filter(session => !session.isTemporary);
      setSessions(permanentSessions);
      setCurrentSession(permanentSessions[0] || null);
    } else {
      createNewSession();
    }
  }, []);

  useEffect(() => {
    if (sessions.length > 0) {
      // Only save non-temporary sessions
      const permanentSessions = sessions.filter(session => !session.isTemporary);
      saveChats(permanentSessions);
    }
  }, [sessions]);

  const createNewSession = (isTemporary = false) => {
    const newSession: ChatSessionType = {
      id: crypto.randomUUID(),
      title: isTemporary ? 'Temporary Chat' : 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isTemporary: isTemporary
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
  
  const shareSession = async (sessionId: string): Promise<string> => {
    const session = sessions.find(s => s.id === sessionId) || currentSession;
    if (!session) return "No session to share";
    
    // Generate a simple text representation of the chat
    const chatText = session.messages.map(msg => {
      const sender = msg.sender === 'user' ? 'You' : 'AnkitXpilot';
      return `${sender}: ${msg.text}`;
    }).join('\n\n');
    
    // In a real app, you might create a shareable link or use the Web Share API
    try {
      await navigator.clipboard.writeText(chatText);
      return "Chat copied to clipboard";
    } catch (error) {
      console.error("Failed to copy:", error);
      return "Failed to copy chat";
    }
  };

  const sendUserMessage = async (message: string, generateCode = false, thinkDeeply = false) => {
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
        // Send message to the AI API with the thinkDeeply flag
        responseText = await sendMessage(message, generateCode, thinkDeeply);
        
        // Add emojis to response if appropriate (non-code responses)
        if (!generateCode && !responseText.includes("```")) {
          responseText = addEmojisToResponse(responseText);
        }
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
      
      // Generate a title for new chats based on the first message
      let title = currentSession.title;
      if (currentSession.messages.length === 0 && !currentSession.isTemporary) {
        // Generate title from first message (max 30 chars)
        title = message.length > 30 ? message.substring(0, 27) + '...' : message;
      }
      
      // Update the current session with new messages
      const updatedSession = {
        ...currentSession,
        messages: finalMessages,
        title: title,
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
  
  const regenerateLastResponse = async () => {
    if (!currentSession || currentSession.messages.length < 2) return;
    
    // Find the last user message
    const messagesReversed = [...currentSession.messages].reverse();
    const lastUserMessageIndex = messagesReversed.findIndex(m => m.sender === 'user');
    
    if (lastUserMessageIndex === -1) return;
    
    const lastUserMessage = messagesReversed[lastUserMessageIndex];
    
    // Remove the last assistant message
    const newMessages = currentSession.messages.slice(0, -1);
    
    // Update the session temporarily
    setCurrentSession({
      ...currentSession,
      messages: newMessages
    });
    
    // Get isCode status from the last assistant message
    const lastAssistantMessage = currentSession.messages[currentSession.messages.length - 1];
    const isCode = lastAssistantMessage.isCode || false;
    
    // Regenerate the response
    await sendUserMessage(lastUserMessage.text, isCode);
  };
  
  // Helper function to add emojis to responses
  const addEmojisToResponse = (text: string): string => {
    // Simple emoji insertion for different types of content
    if (text.toLowerCase().includes("hello") || text.toLowerCase().includes("hi ")) {
      return text.replace(/Hello|Hi /i, match => `${match} 👋 `);
    }
    
    if (text.toLowerCase().includes("thank")) {
      return text + " 😊";
    }
    
    if (text.toLowerCase().includes("sorry") || text.toLowerCase().includes("apologize")) {
      return text.replace(/sorry|apologize/i, match => `${match} 🙏 `);
    }
    
    if (text.toLowerCase().includes("congratulations") || text.toLowerCase().includes("congrats")) {
      return text.replace(/congratulations|congrats/i, match => `${match} 🎉 `);
    }
    
    if (text.toLowerCase().includes("important")) {
      return text.replace(/important/i, match => `${match} ❗ `);
    }
    
    // For code-related questions
    if (text.toLowerCase().includes("javascript") || text.toLowerCase().includes("code")) {
      return text.replace(/javascript|code/i, match => `${match} 💻 `);
    }
    
    // For idea or suggestion
    if (text.toLowerCase().includes("idea") || text.toLowerCase().includes("suggest")) {
      return text.replace(/idea|suggest/i, match => `${match} 💡 `);
    }
    
    return text;
  };

  const value = {
    currentSession,
    sessions,
    isLoading,
    error,
    sendUserMessage,
    regenerateLastResponse,
    createNewSession,
    switchSession,
    deleteSession,
    clearSessions,
    shareSession
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
