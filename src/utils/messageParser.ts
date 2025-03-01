
// Function to detect code blocks in messages
export const parseCodeBlocks = (message: string): { text: string, isCode: boolean }[] => {
  // Simple code block detection (text between ``` marks)
  const codeBlockRegex = /```([\s\S]*?)```/g;
  const parts: { text: string, isCode: boolean }[] = [];
  
  let lastIndex = 0;
  let match;
  
  while ((match = codeBlockRegex.exec(message)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      parts.push({
        text: message.substring(lastIndex, match.index),
        isCode: false
      });
    }
    
    // Add code block
    parts.push({
      text: match[1],
      isCode: true
    });
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text after the last code block
  if (lastIndex < message.length) {
    parts.push({
      text: message.substring(lastIndex),
      isCode: false
    });
  }
  
  return parts.length > 0 ? parts : [{ text: message, isCode: false }];
};

// Format the timestamp to a readable string
export const formatTimestamp = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(date);
};

// Get a short preview of a message for history items
export const getMessagePreview = (text: string, maxLength = 30): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
