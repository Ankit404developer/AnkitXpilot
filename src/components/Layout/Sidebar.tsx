
import React from 'react';
import { useChat } from '../../contexts/ChatContext';
import { MessageSquare, Trash2, Clock } from 'lucide-react';
import { getMessagePreview } from '../../utils/messageParser';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const { sessions, currentSession, switchSession, deleteSession } = useChat();
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  
  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-10 w-72 bg-background border-r transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}
    >
      <div className="flex flex-col h-full pt-16">
        <div className="px-4 py-4 border-b">
          <h2 className="text-sm font-medium">Chat History</h2>
        </div>
        
        {sessions.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <p className="text-muted-foreground text-sm">No chat history yet</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
            {sessions.map(session => {
              const isActive = currentSession?.id === session.id;
              const firstMessage = session.messages.find(m => m.sender === 'user');
              const title = session.title || 'New Chat';
              const isTemporary = session.isTemporary;
              
              return (
                <div 
                  key={session.id}
                  className={`group relative flex gap-2 items-center p-2 rounded-md cursor-pointer mb-1 transition-colors ${
                    isActive 
                      ? isTemporary 
                        ? 'bg-amber-500/10 text-foreground' 
                        : 'bg-primary/10 text-foreground' 
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => switchSession(session.id)}
                >
                  {isTemporary ? (
                    <Clock size={16} className="flex-shrink-0 text-amber-500" />
                  ) : (
                    <MessageSquare size={16} className="flex-shrink-0" />
                  )}
                  <div className="flex-1 truncate">
                    <div className="font-medium text-sm truncate flex items-center gap-1">
                      {title}
                      {isTemporary && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1 rounded">
                          Temp
                        </span>
                      )}
                    </div>
                    {firstMessage && (
                      <div className="text-xs truncate opacity-70">
                        {getMessagePreview(firstMessage.text)}
                      </div>
                    )}
                    <div className="text-xs mt-0.5 opacity-60">
                      {formatDate(session.updatedAt)}
                    </div>
                  </div>
                  
                  <button 
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded-md transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(session.id);
                    }}
                  >
                    <Trash2 size={14} className="text-muted-foreground" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
        
        <div className="p-4 border-t text-xs text-center text-muted-foreground">
          <p>Created by Ankit Pramanik</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
