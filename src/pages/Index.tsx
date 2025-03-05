
import React from 'react';
import Main from '../components/Layout/Main';
import { ChatProvider } from '../contexts/ChatContext';
import { toast } from 'sonner';

const Index = () => {
  // Show welcome toast on first visit
  React.useEffect(() => {
    const hasVisited = localStorage.getItem('ankitxpilot-visited');
    if (!hasVisited) {
      setTimeout(() => {
        toast.success(
          'Welcome to AnkitXpilot!', 
          {
            description: 'Your AI coding assistant is ready to help. Use the menu to manage memories and chats.',
            style: {
              backgroundColor: 'rgba(18, 18, 18, 0.95)',
              color: 'white',
              border: '1px solid #333'
            },
            duration: 5000
          }
        );
        localStorage.setItem('ankitxpilot-visited', 'true');
      }, 800);
    }
  }, []);

  return (
    <ChatProvider>
      <Main />
    </ChatProvider>
  );
};

export default Index;
