
import React, { useState } from 'react';
import { Bot, Menu, X, Plus, Moon, Sun, Laptop, Share2, Clock, Brain, Trash } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface HeaderProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ sidebarOpen, toggleSidebar }) => {
  const { 
    createNewSession, 
    currentSession, 
    shareSession, 
    isTemporaryMode, 
    setIsTemporaryMode,
    clearLearnedData 
  } = useChat();
  const { theme, setTheme } = useTheme();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isTempChatOpen, setIsTempChatOpen] = useState(false);
  const [isClearMemoryOpen, setIsClearMemoryOpen] = useState(false);
  
  const handleNewChat = () => {
    createNewSession();
    if (isTemporaryMode) {
      setIsTemporaryMode(false);
    }
  };
  
  const handleTemporaryChat = () => {
    createNewSession(true);
    setIsTempChatOpen(false);
    toast.success("Temporary chat started", {
      description: "This conversation won't be saved and I won't remember the context after you leave"
    });
  };
  
  const handleToggleTemporaryMode = () => {
    const newMode = !isTemporaryMode;
    setIsTemporaryMode(newMode);
    
    if (newMode) {
      toast.success("Temporary mode enabled", {
        description: "I won't learn from this conversation"
      });
    } else {
      toast.success("Learning mode enabled", {
        description: "I'll remember useful information from our conversation"
      });
    }
  };
  
  const handleClearMemory = () => {
    clearLearnedData();
    setIsClearMemoryOpen(false);
    toast.success("Memory cleared", {
      description: "I've forgotten all learned information"
    });
  };
  
  const handleShare = async () => {
    if (!currentSession) return;
    
    const result = await shareSession(currentSession.id);
    setIsShareOpen(false);
    
    toast.success("Chat copied to clipboard", {
      description: "You can now paste and share it"
    });
  };
  
  return (
    <>
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
          {/* Temporary Mode Indicator */}
          {isTemporaryMode && (
            <span className="hidden sm:flex text-xs bg-amber-500/20 text-amber-400 py-1 px-2 rounded-full items-center gap-1">
              <Clock size={12} />
              Temporary Mode
            </span>
          )}
          
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
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={() => setIsShareOpen(true)}>
                <Share2 className="mr-2 h-4 w-4" />
                <span>Share Chat</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={handleToggleTemporaryMode}>
                <Clock className="mr-2 h-4 w-4" />
                <span>{isTemporaryMode ? "Disable Temporary Mode" : "Enable Temporary Mode"}</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => setIsTempChatOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                <span>New Temporary Chat</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={() => setIsClearMemoryOpen(true)}>
                <Trash className="mr-2 h-4 w-4" />
                <span>Clear Memory</span>
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
      
      {/* Share Dialog */}
      <AlertDialog open={isShareOpen} onOpenChange={setIsShareOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Share Chat</AlertDialogTitle>
            <AlertDialogDescription>
              This will copy the current conversation to your clipboard so you can share it with others.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleShare}>Copy to Clipboard</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Temporary Chat Dialog */}
      <AlertDialog open={isTempChatOpen} onOpenChange={setIsTempChatOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start Temporary Chat</AlertDialogTitle>
            <AlertDialogDescription>
              Temporary chats are not saved to your chat history and I won't learn from our conversation. This helps maintain privacy for sensitive discussions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleTemporaryChat}>Start Temporary Chat</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Clear Memory Dialog */}
      <AlertDialog open={isClearMemoryOpen} onOpenChange={setIsClearMemoryOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Memory</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all information I've learned about you across all conversations. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearMemory}>Clear Memory</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Header;
