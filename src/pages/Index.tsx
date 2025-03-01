
import React from 'react';
import Main from '../components/Layout/Main';
import { ChatProvider } from '../contexts/ChatContext';
import { toast } from 'sonner';

const Index = () => {
  // Show welcome toast on first visit
  React.useEffect(() => {
    const hasVisited = localStorage.getItem('ankitxpilot-visited');
    if (!hasVisited) {
      toast.success(
        'Welcome to AnkitXpilot!', 
        {
          description: 'Your personal AI assistant is ready to help.',
        }
      );
      localStorage.setItem('ankitxpilot-visited', 'true');
    }
  }, []);

  return (
    <ChatProvider>
      <Main />
    </ChatProvider>
  );
};

export default Index;
