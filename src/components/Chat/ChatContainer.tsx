
import React, { useEffect, useRef } from 'react';
import { useChat } from '../../contexts/ChatContext';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { ChevronDown } from 'lucide-react';

const ChatContainer: React.FC = () => {
  const { currentSession, isLoading, regenerateLastResponse } = useChat();
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
    <div className="flex flex-col h-full bg-black">
      {/* Temporary chat indicator */}
      {currentSession.isTemporary && (
        <div className="bg-amber-700/20 border-b border-amber-700/30 py-2 px-4 text-center">
          <p className="text-amber-200 text-xs font-medium">
            Temporary chat mode - This conversation will not be saved
          </p>
        </div>
      )}
      
      {/* Messages container with auto-scroll */}
      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">
        {currentSession.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="p-6 rounded-2xl max-w-md animate-fade-in bg-zinc-900">
              <div className="flex justify-center mb-4">
                <img src="/lovable-uploads/05f99f3c-fe9b-4793-9f67-9083446e0cb5.png" alt="AnkitXpilot Logo" className="h-20 w-auto" />
              </div>
              <h2 className="text-xl font-medium mb-2 text-white">Welcome to AnkitXpilot</h2>
              <p className="text-zinc-400 mb-4">
                Your personal AI assistant ready to help.
                How can I help you today?
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div className="p-3 bg-zinc-800 rounded-lg hover:bg-zinc-700 cursor-pointer transition-all hover:scale-105">
                  "Write a React component"
                </div>
                <div className="p-3 bg-zinc-800 rounded-lg hover:bg-zinc-700 cursor-pointer transition-all hover:scale-105">
                  "Explain promises in JavaScript"
                </div>
                <div className="p-3 bg-zinc-800 rounded-lg hover:bg-zinc-700 cursor-pointer transition-all hover:scale-105">
                  "Help debug my code"
                </div>
                <div className="p-3 bg-zinc-800 rounded-lg hover:bg-zinc-700 cursor-pointer transition-all hover:scale-105">
                  "Who made you?"
                </div>
              </div>
            </div>
          </div>
        ) : (
          currentSession.messages.map((message, index) => (
            <ChatMessage 
              key={message.id} 
              message={message} 
              onRegenerate={
                message.sender === 'assistant' && 
                index === currentSession.messages.length - 1 
                  ? regenerateLastResponse 
                  : undefined
              }
            />
          ))
        )}
        
        {/* Hide typing indicator when using our new typing effect */}
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
      
      {/* Scroll down button */}
      <button 
        onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
        className="absolute bottom-20 right-4 z-10 p-2 rounded-full bg-zinc-700/80 hover:bg-zinc-600 transition-all"
        aria-label="Scroll to bottom"
      >
        <ChevronDown size={20} className="text-white" />
      </button>
      
      {/* Chat input container */}
      <div className="p-3 bg-zinc-900 border-t border-zinc-800">
        <ChatInput placeholderText="Ask anything to AnkitXpilot..." />
      </div>
    </div>
  );
};

export default ChatContainer;
