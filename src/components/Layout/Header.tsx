
import React from 'react';
import { Bot, Menu, X, Plus, Moon, Sun, Laptop } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ sidebarOpen, toggleSidebar }) => {
  const { createNewSession } = useChat();
  const { theme, setTheme } = useTheme();
  
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
          <img 
            src="/lovable-uploads/05f99f3c-fe9b-4793-9f67-9083446e0cb5.png" 
            alt="AnkitXpilot Logo" 
            className="h-8 w-auto mr-2" 
          />
          <h1 className="text-lg font-medium animate-fade-in">AnkitXpilot</h1>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              {theme === "light" ? (
                <Sun size={20} />
              ) : theme === "dark" ? (
                <Moon size={20} />
              ) : (
                <Laptop size={20} />
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <Sun className="mr-2 h-4 w-4" />
              <span>Light</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <Moon className="mr-2 h-4 w-4" />
              <span>Dark</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              <Laptop className="mr-2 h-4 w-4" />
              <span>System</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <button
          onClick={handleNewChat}
          className="flex items-center gap-1 text-sm py-1.5 px-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors animate-fade-in"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">New Chat</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
