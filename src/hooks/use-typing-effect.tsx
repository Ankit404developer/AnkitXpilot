
import { useState, useEffect } from 'react';

export function useTypingEffect(text: string, typingSpeed = 30) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  
  useEffect(() => {
    setIsTyping(true);
    setDisplayedText('');
    
    if (!text) {
      setIsTyping(false);
      return;
    }
    
    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText((prev) => prev + text.charAt(index));
        index++;
      } else {
        clearInterval(timer);
        setIsTyping(false);
      }
    }, typingSpeed);
    
    return () => clearInterval(timer);
  }, [text, typingSpeed]);
  
  return { displayedText, isTyping };
}
