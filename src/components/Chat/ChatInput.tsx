
import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { Send, Code } from 'lucide-react';

const ChatInput: React.FC = () => {
  const [message, setMessage] = useState('');
  const [generateCode, setGenerateCode] = useState(false);
  const { sendUserMessage, isLoading } = useChat();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;
    
    const trimmedMessage = message.trim();
    setMessage('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    
    await sendUserMessage(trimmedMessage, generateCode);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  const toggleCodeMode = () => {
    setGenerateCode(prev => !prev);
  };

  return (
    <form onSubmit={handleSubmit} className="relative animate-fade-in-up">
      <div className={`relative flex items-end rounded-2xl border bg-background shadow-sm transition-all duration-300 ${isLoading ? 'opacity-80' : ''} ${generateCode ? 'ring-2 ring-primary ring-opacity-50' : ''}`}>
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={generateCode ? "Describe the code you need..." : "Type a message..."}
          disabled={isLoading}
          rows={1}
          className="w-full resize-none bg-transparent py-3 pl-4 pr-14 text-foreground focus:outline-none disabled:opacity-50 scrollbar-thin"
        />
        <div className="absolute right-2 bottom-3 flex gap-1">
          <button
            type="button"
            onClick={toggleCodeMode}
            className={`p-1.5 rounded-full transition-all hover:scale-105 ${generateCode 
              ? 'bg-primary text-primary-foreground' 
              : 'text-muted-foreground hover:bg-muted'}`}
            title={generateCode ? "Code mode active" : "Toggle code mode"}
          >
            <Code size={18} />
          </button>
          <button
            type="submit"
            disabled={!message.trim() || isLoading}
            className="p-1.5 rounded-full bg-primary text-primary-foreground transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
      
      {generateCode && (
        <div className="mt-1 text-xs text-muted-foreground animate-fade-in">
          Code mode active: Optimized for generating code snippets
        </div>
      )}
    </form>
  );
};

export default ChatInput;
