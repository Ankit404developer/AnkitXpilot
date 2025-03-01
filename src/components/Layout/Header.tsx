
import React from 'react';
import { Bot, Menu, X, Plus } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';

interface HeaderProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ sidebarOpen, toggleSidebar }) => {
  const { createNewSession } = useChat();
  
  const handleNewChat = () => {
    createNewSession();
  };
  
  return (
    <header className="h-16 border-b glass flex items-center justify-between px-4 sticky top-0 z-10 backdrop-blur-md">
      <div className="flex items-center">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors md:hidden"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        
        <div className="flex items-center ml-2 md:ml-0">
          <div className="bg-primary/10 p-1.5 rounded-md mr-2">
            <Bot size={22} className="text-primary" />
          </div>
          <h1 className="text-lg font-medium">AnkitXpilot</h1>
        </div>
      </div>
      
      <button
        onClick={handleNewChat}
        className="flex items-center gap-1 text-sm py-1.5 px-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <Plus size={16} />
        <span className="hidden sm:inline">New Chat</span>
      </button>
    </header>
  );
};

export default Header;
