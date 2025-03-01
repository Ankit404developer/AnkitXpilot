
import React, { useEffect, useRef } from 'react';
import { useChat } from '../../contexts/ChatContext';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

const ChatContainer: React.FC = () => {
  const { currentSession, isLoading } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages]);
  
  if (!currentSession) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-muted-foreground">No active chat session</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* Messages container with auto-scroll */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        {currentSession.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="glass p-6 rounded-2xl max-w-md animate-fade-in">
              <h2 className="text-xl font-medium mb-2">Welcome to AnkitXpilot</h2>
              <p className="text-muted-foreground mb-4">
                Your personal AI assistant powered by Google Gemini.
                How can I help you today?
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-3 bg-muted rounded-lg hover:bg-muted/80 cursor-pointer">
                  "Write a React component"
                </div>
                <div className="p-3 bg-muted rounded-lg hover:bg-muted/80 cursor-pointer">
                  "Explain promises in JavaScript"
                </div>
                <div className="p-3 bg-muted rounded-lg hover:bg-muted/80 cursor-pointer">
                  "Help debug my code"
                </div>
                <div className="p-3 bg-muted rounded-lg hover:bg-muted/80 cursor-pointer">
                  "Who made you?"
                </div>
              </div>
            </div>
          </div>
        ) : (
          currentSession.messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))
        )}
        
        {/* Show typing indicator when loading */}
        {isLoading && (
          <div className="flex mb-4">
            <div className="assistant-message">
              <div className="typing-indicator">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          </div>
        )}
        
        {/* This div is used to scroll to the latest message */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat input container */}
      <div className="p-4 border-t">
        <ChatInput />
      </div>
    </div>
  );
};

export default ChatContainer;
