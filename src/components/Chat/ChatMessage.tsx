
import React, { useState, useEffect } from 'react';
import { MessageType } from '../../contexts/ChatContext';
import { parseCodeBlocks, formatTimestamp } from '../../utils/messageParser';
import CodeBlock from './CodeBlock';
import { User, Bot, ThumbsUp, ThumbsDown, RefreshCw, Copy, TextSelect } from 'lucide-react';
import { useTypingEffect } from '../../hooks/use-typing-effect';

interface ChatMessageProps {
  message: MessageType;
  onRegenerate?: () => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onRegenerate }) => {
  const isUser = message.sender === 'user';
  const [isGoodResponse, setIsGoodResponse] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);
  const [showTypingEffect, setShowTypingEffect] = useState(!isUser);
  
  // Parse message content for code blocks
  const contentParts = parseCodeBlocks(message.text);
  
  // Use typing effect only for assistant messages that aren't code blocks
  const { displayedText, isTyping } = useTypingEffect(
    isUser ? '' : contentParts.find(part => !part.isCode)?.text || '',
    showTypingEffect ? 15 : 0
  );
  
  // Disable typing effect after initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTypingEffect(false);
    }, 10000); // Fallback timeout to ensure animation completes
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleSelectText = () => {
    const selection = window.getSelection();
    const range = document.createRange();
    const messageElement = document.getElementById(`message-${message.id}`);
    if (messageElement) {
      range.selectNodeContents(messageElement);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  };
  
  // Function to make URLs clickable
  const makeLinksClickable = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a 
            key={index} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`flex gap-2 max-w-[90%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Message content */}
        <div className={`${isUser ? 'user-message' : 'assistant-message'}`}>
          <div id={`message-${message.id}`}>
            {contentParts.map((part, index) => {
              if (part.isCode) {
                // Always render code blocks normally
                return <CodeBlock key={index} code={part.text} />;
              } else if (!isUser && index === 0 && showTypingEffect) {
                // Apply typing effect to the first text part of assistant messages
                return (
                  <p key={index} className="text-balance whitespace-pre-wrap text-sm">
                    {makeLinksClickable(isTyping ? displayedText : part.text)}
                    {isTyping && <span className="cursor animate-pulse">|</span>}
                  </p>
                );
              } else {
                // Render other content normally
                return (
                  <p key={index} className="text-balance whitespace-pre-wrap text-sm">
                    {makeLinksClickable(part.text)}
                  </p>
                );
              }
            })}
          </div>
          
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-zinc-500">
              {formatTimestamp(message.timestamp)}
            </span>
            
            {/* Action buttons for assistant messages */}
            {!isUser && !isTyping && (
              <div className="flex gap-1.5">
                <button 
                  onClick={handleSelectText}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors"
                  title="Select Text"
                >
                  <TextSelect size={14} />
                </button>
                <button 
                  onClick={handleCopy}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors"
                  title={copied ? "Copied!" : "Copy"}
                >
                  <Copy size={14} className={copied ? "text-green-500" : ""} />
                </button>
                <button 
                  onClick={() => setIsGoodResponse(true)}
                  className={`text-zinc-500 hover:text-zinc-300 transition-colors ${isGoodResponse === true ? "text-green-500" : ""}`}
                  title="Good Response"
                >
                  <ThumbsUp size={14} />
                </button>
                <button 
                  onClick={() => setIsGoodResponse(false)}
                  className={`text-zinc-500 hover:text-zinc-300 transition-colors ${isGoodResponse === false ? "text-red-500" : ""}`}
                  title="Bad Response"
                >
                  <ThumbsDown size={14} />
                </button>
                {onRegenerate && (
                  <button 
                    onClick={onRegenerate}
                    className="text-zinc-500 hover:text-zinc-300 transition-colors"
                    title="Regenerate Response"
                  >
                    <RefreshCw size={14} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
