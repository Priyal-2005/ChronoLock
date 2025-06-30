import React, { createContext, useContext, useState, useEffect } from 'react';

export interface VoiceMemory {
  id: string;
  title: string;
  note?: string;
  unlockDate: Date;
  createdDate: Date;
  emotion: {
    tone: string;
    intensity: number;
  };
  duration: number;
  isLocked: boolean;
  audioUrl?: string;
  audioBlob?: Blob;
}

interface MemoryContextType {
  memories: VoiceMemory[];
  addMemory: (memory: Omit<VoiceMemory, 'id' | 'createdDate' | 'isLocked'>) => void;
  getMemory: (id: string) => VoiceMemory | undefined;
  updateMemory: (id: string, updates: Partial<VoiceMemory>) => void;
  deleteMemory: (id: string) => void;
}

const MemoryContext = createContext<MemoryContextType | undefined>(undefined);

export const useMemory = () => {
  const context = useContext(MemoryContext);
  if (!context) {
    throw new Error('useMemory must be used within a MemoryProvider');
  }
  return context;
};

const STORAGE_KEY = 'chronolock_memories';

export const MemoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [memories, setMemories] = useState<VoiceMemory[]>([]);

  // Load memories from localStorage on mount
  useEffect(() => {
    const loadMemories = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsedMemories = JSON.parse(stored);
          // Convert date strings back to Date objects and update lock status
          const memoriesWithDates = parsedMemories.map((memory: any) => ({
            ...memory,
            unlockDate: new Date(memory.unlockDate),
            createdDate: new Date(memory.createdDate),
            isLocked: new Date() < new Date(memory.unlockDate)
          }));
          setMemories(memoriesWithDates);
        }
      } catch (error) {
        console.error('Failed to load memories from storage:', error);
      }
    };

    loadMemories();
  }, []);

  // Save memories to localStorage whenever memories change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
    } catch (error) {
      console.error('Failed to save memories to storage:', error);
    }
  }, [memories]);

  const addMemory = (memoryData: Omit<VoiceMemory, 'id' | 'createdDate' | 'isLocked'>) => {
    const newMemory: VoiceMemory = {
      ...memoryData,
      id: `memory_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      createdDate: new Date(),
      isLocked: new Date() < memoryData.unlockDate
    };

    setMemories(prev => [newMemory, ...prev]);
    return newMemory.id;
  };

  const getMemory = (id: string): VoiceMemory | undefined => {
    return memories.find(memory => memory.id === id);
  };

  const updateMemory = (id: string, updates: Partial<VoiceMemory>) => {
    setMemories(prev => prev.map(memory => 
      memory.id === id 
        ? { 
            ...memory, 
            ...updates,
            isLocked: updates.unlockDate ? new Date() < updates.unlockDate : memory.isLocked
          }
        : memory
    ));
  };

  const deleteMemory = (id: string) => {
    setMemories(prev => {
      const memoryToDelete = prev.find(m => m.id === id);
      if (memoryToDelete?.audioUrl) {
        URL.revokeObjectURL(memoryToDelete.audioUrl);
      }
      return prev.filter(memory => memory.id !== id);
    });
  };

  return (
    <MemoryContext.Provider 
      value={{
        memories,
        addMemory,
        getMemory,
        updateMemory,
        deleteMemory
      }}
    >
      {children}
    </MemoryContext.Provider>
  );
};