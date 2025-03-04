
import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { Send, Code } from 'lucide-react';

interface ChatInputProps {
  placeholderText?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({ placeholderText = "Ask anything to AnkitXpilot..." }) => {
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
      <div className={`relative flex items-end rounded-3xl bg-zinc-800 shadow-sm transition-all duration-300 ${isLoading ? 'opacity-80' : ''} ${generateCode ? 'ring-1 ring-primary ring-opacity-50' : ''}`}>
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={generateCode ? "Give a html code" : placeholderText}
          disabled={isLoading}
          rows={1}
          className="w-full resize-none bg-transparent py-3 pl-4 pr-14 text-white placeholder:text-zinc-500 focus:outline-none disabled:opacity-50 scrollbar-thin rounded-3xl"
        />
        <div className="absolute right-2 bottom-2.5 flex gap-1">
          <button
            type="button"
            onClick={toggleCodeMode}
            className={`p-1.5 rounded-full transition-all hover:bg-zinc-700 ${generateCode 
              ? 'text-primary' 
              : 'text-zinc-400 hover:text-zinc-200'}`}
            title={generateCode ? "Code mode active" : "Toggle code mode"}
          >
            <Code size={18} />
          </button>
          <button
            type="submit"
            disabled={!message.trim() || isLoading}
            className="p-1.5 rounded-full bg-primary text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50 disabled:hover:bg-primary"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
      
      {generateCode && (
        <div className="mt-1 text-xs text-zinc-500 animate-fade-in">
          Code mode active: Optimized for generating code snippets
        </div>
      )}
    </form>
  );
};

export default ChatInput;
