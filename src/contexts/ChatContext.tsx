
import React, { createContext, useContext, useEffect, useState } from 'react';
import { sendMessage } from '../services/geminiService';
import { saveChats, loadChats, saveLearnedData, loadLearnedData } from '../utils/localStorage';

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

type LearnedDataType = Record<string, string[]>;

interface ChatContextType {
  currentSession: ChatSessionType | null;
  sessions: ChatSessionType[];
  isLoading: boolean;
  error: string | null;
  isTemporaryMode: boolean;
  learnedData: LearnedDataType;
  sendUserMessage: (message: string, generateCode?: boolean, thinkDeeply?: boolean) => Promise<void>;
  regenerateLastResponse: () => Promise<void>;
  createNewSession: (isTemporary?: boolean) => void;
  switchSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  clearSessions: () => void;
  shareSession: (sessionId: string) => Promise<string>;
  setIsTemporaryMode: (isTemporary: boolean) => void;
  clearLearnedData: () => void;
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
  const [isTemporaryMode, setIsTemporaryMode] = useState<boolean>(false);
  const [learnedData, setLearnedData] = useState<LearnedDataType>({});

  // Load sessions and learned data from localStorage
  useEffect(() => {
    const savedSessions = loadChats();
    const savedLearnedData = loadLearnedData();
    
    if (savedSessions.length > 0) {
      // Filter out temporary sessions when loading
      const permanentSessions = savedSessions.filter(session => !session.isTemporary);
      setSessions(permanentSessions);
      setCurrentSession(permanentSessions[0] || null);
    } else {
      createNewSession();
    }
    
    if (Object.keys(savedLearnedData).length > 0) {
      setLearnedData(savedLearnedData);
    }
  }, []);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    if (sessions.length > 0) {
      // Only save non-temporary sessions
      const permanentSessions = sessions.filter(session => !session.isTemporary);
      saveChats(permanentSessions);
    }
  }, [sessions]);

  // Save learned data to localStorage whenever it changes
  useEffect(() => {
    if (Object.keys(learnedData).length > 0) {
      saveLearnedData(learnedData);
    }
  }, [learnedData]);

  // Extract key entities from a message to learn from
  const extractEntities = (text: string): Record<string, string[]> => {
    // This is a simple implementation - in a production app, you'd use NLP for better entity extraction
    const newData: Record<string, string[]> = {};
    
    // Extract potential topics (simple approach)
    const words = text.toLowerCase().split(/\s+/);
    const stopWords = ['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'without', 'about', 'from'];
    
    // Look for programming languages or technologies
    const techKeywords = ['javascript', 'python', 'react', 'node', 'typescript', 'java', 'css', 'html', 'docker', 'aws', 'sql', 'database'];
    const foundTech = techKeywords.filter(tech => text.toLowerCase().includes(tech));
    
    if (foundTech.length > 0) {
      newData['technologies'] = foundTech;
    }
    
    // Look for potential interests based on question patterns
    if (text.toLowerCase().includes('how to') || text.toLowerCase().includes('explain')) {
      const interests = words
        .filter(word => word.length > 4 && !stopWords.includes(word))
        .filter(word => !techKeywords.includes(word))
        .slice(0, 3); // Limit to 3 potential interests
      
      if (interests.length > 0) {
        newData['interests'] = interests;
      }
    }
    
    // Look for potential name
    if (text.toLowerCase().includes('my name is') || text.toLowerCase().includes('i am called')) {
      const nameMatch = text.match(/my name is (\w+)|i am called (\w+)/i);
      if (nameMatch) {
        const name = nameMatch[1] || nameMatch[2];
        newData['name'] = [name];
      }
    }
    
    return newData;
  };

  // Update the learned data with new information
  const updateLearnedData = (message: string) => {
    if (isTemporaryMode) return; // Don't learn in temporary mode
    
    const extractedData = extractEntities(message);
    
    if (Object.keys(extractedData).length === 0) return;
    
    setLearnedData(prevData => {
      const newData = { ...prevData };
      
      // Merge the new data with existing data
      Object.entries(extractedData).forEach(([key, values]) => {
        if (!newData[key]) {
          newData[key] = [];
        }
        
        // Add unique values only
        values.forEach(value => {
          if (!newData[key].includes(value)) {
            newData[key].push(value);
          }
        });
      });
      
      return newData;
    });
  };

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
    
    // If creating a temporary chat, switch to temporary mode
    if (isTemporary) {
      setIsTemporaryMode(true);
    }
  };

  const switchSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSession(session);
      setIsTemporaryMode(!!session.isTemporary);
    }
  };

  const deleteSession = (sessionId: string) => {
    setSessions(prevSessions => {
      const filteredSessions = prevSessions.filter(s => s.id !== sessionId);
      
      // If we're deleting the current session, switch to another one
      if (currentSession?.id === sessionId) {
        if (filteredSessions.length > 0) {
          setCurrentSession(filteredSessions[0]);
          setIsTemporaryMode(!!filteredSessions[0].isTemporary);
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
  
  const clearLearnedDataHandler = () => {
    setLearnedData({});
    localStorage.removeItem('ankitxpilot-learned-data');
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
      // Learn from the user message if not in temporary mode
      if (!isTemporaryMode) {
        updateLearnedData(message);
      }
      
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
        // Send message to the AI API with the thinkDeeply flag and learned data
        responseText = await sendMessage(
          message, 
          generateCode, 
          thinkDeeply, 
          isTemporaryMode ? {} : learnedData,
          isTemporaryMode
        );
        
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
    isTemporaryMode,
    learnedData,
    sendUserMessage,
    regenerateLastResponse,
    createNewSession,
    switchSession,
    deleteSession,
    clearSessions,
    shareSession,
    setIsTemporaryMode,
    clearLearnedData: clearLearnedDataHandler
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
