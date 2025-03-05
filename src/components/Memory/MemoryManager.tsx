
import React, { useState } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { Trash2, X, Save, MemoryStick, Brain } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface MemoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const MemoryManager: React.FC<MemoryManagerProps> = ({ isOpen, onClose }) => {
  const { learnedData, clearLearnedData, updateLearnedData } = useChat();
  const [editableData, setEditableData] = useState<Record<string, string[]>>({...learnedData});

  // Reset editable data when the dialog opens
  React.useEffect(() => {
    if (isOpen) {
      setEditableData({...learnedData});
    }
  }, [isOpen, learnedData]);

  const handleDeleteCategory = (category: string) => {
    const newData = {...editableData};
    delete newData[category];
    setEditableData(newData);
  };

  const handleDeleteValue = (category: string, index: number) => {
    const newData = {...editableData};
    newData[category] = newData[category].filter((_, i) => i !== index);
    
    // If no values left in category, remove the category
    if (newData[category].length === 0) {
      delete newData[category];
    }
    
    setEditableData(newData);
  };

  const handleSaveChanges = () => {
    updateLearnedData(editableData);
    toast.success("Memory updated successfully", {
      description: "I've updated what I remember about you"
    });
    onClose();
  };

  const handleClearAll = () => {
    clearLearnedData();
    setEditableData({});
    toast.success("Memory cleared successfully", {
      description: "I've forgotten all learned information"
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Brain size={18} className="text-cyan-400" />
            Manage AI Memory
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Here you can view and delete information I've learned from our conversations.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {Object.keys(editableData).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>I haven't learned anything yet.</p>
              <p className="text-sm mt-2">As we chat, I'll remember important information here.</p>
            </div>
          ) : (
            <ScrollArea className="h-[300px] pr-4">
              {Object.entries(editableData).map(([category, values]) => (
                <div key={category} className="mb-4 border border-zinc-800 rounded-md p-3 bg-zinc-950/50">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-sm capitalize text-cyan-400">{category}</h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteCategory(category)}
                      className="h-7 w-7 p-0 text-zinc-400 hover:text-white hover:bg-zinc-800"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {values.map((value, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary"
                        className="flex items-center gap-1 bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                      >
                        {value}
                        <button
                          onClick={() => handleDeleteValue(category, index)}
                          className="ml-1 rounded-full h-4 w-4 inline-flex items-center justify-center hover:bg-zinc-600"
                        >
                          <X size={10} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </ScrollArea>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <Button 
            variant="destructive" 
            onClick={handleClearAll}
            className="mr-auto flex gap-1 items-center"
          >
            <Trash2 size={14} />
            Clear All Memories
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSaveChanges} className="flex gap-1 items-center bg-cyan-600 hover:bg-cyan-700">
              <Save size={14} />
              Save Changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MemoryManager;
