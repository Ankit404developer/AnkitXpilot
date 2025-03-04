
import React from 'react';
import { MessageType } from '../../contexts/ChatContext';
import { parseCodeBlocks, formatTimestamp } from '../../utils/messageParser';
import CodeBlock from './CodeBlock';
import { User, Bot } from 'lucide-react';

interface ChatMessageProps {
  message: MessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  
  // Parse message content for code blocks
  const contentParts = parseCodeBlocks(message.text);
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`flex gap-2 max-w-[90%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar - hidden for cleaner UI like the reference */}
        {false && (
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
            ${isUser ? 'bg-primary text-primary-foreground' : 'bg-zinc-800 text-zinc-300'}`}>
            {isUser ? <User size={16} /> : <Bot size={16} />}
          </div>
        )}
        
        {/* Message content */}
        <div className={`${isUser ? 'user-message' : 'assistant-message'}`}>
          {contentParts.map((part, index) => (
            <React.Fragment key={index}>
              {part.isCode ? (
                <CodeBlock code={part.text} />
              ) : (
                <p className="text-balance whitespace-pre-wrap text-sm">{part.text}</p>
              )}
            </React.Fragment>
          ))}
          <span className="block mt-1 text-right text-xs text-zinc-500">
            {formatTimestamp(message.timestamp)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
