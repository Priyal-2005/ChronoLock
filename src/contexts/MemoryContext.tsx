import React, { createContext, useContext, useState, useEffect } from 'react';
import { ChronoLockStorage } from '../utils/storage';
import { useWallet } from './WalletContext';

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
  ipfsCid?: string;
  contractId?: number;
}

interface MemoryContextType {
  memories: VoiceMemory[];
  addMemory: (memory: Omit<VoiceMemory, 'id' | 'createdDate' | 'isLocked'>) => Promise<string>;
  getMemory: (id: string) => VoiceMemory | undefined;
  updateMemory: (id: string, updates: Partial<VoiceMemory>) => void;
  deleteMemory: (id: string) => void;
  refreshMemories: () => Promise<void>;
  isLoading: boolean;
}

const MemoryContext = createContext<MemoryContextType | undefined>(undefined);

export const useMemory = () => {
  const context = useContext(MemoryContext);
  if (!context) {
    throw new Error('useMemory must be used within a MemoryProvider');
  }
  return context;
};

export const MemoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [memories, setMemories] = useState<VoiceMemory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { accounts, isConnected } = useWallet();
  const storage = new ChronoLockStorage();

  // Load memories when wallet connects
  useEffect(() => {
    if (isConnected && accounts.length > 0) {
      refreshMemories();
    } else {
      setMemories([]);
    }
  }, [isConnected, accounts]);

  const refreshMemories = async () => {
    if (!isConnected || accounts.length === 0) return;

    setIsLoading(true);
    try {
      const userMemories = await storage.getUserMemories(accounts[0]);
      
      const memoriesWithDuration = userMemories.map(memory => ({
        ...memory,
        unlockDate: new Date(memory.unlockDate),
        createdDate: new Date(memory.createdDate),
        duration: memory.duration || 0
      }));

      setMemories(memoriesWithDuration);
    } catch (error) {
      console.error('Failed to load memories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addMemory = async (memoryData: Omit<VoiceMemory, 'id' | 'createdDate' | 'isLocked'>): Promise<string> => {
    if (!isConnected || accounts.length === 0) {
      throw new Error('Wallet not connected');
    }

    if (!memoryData.audioBlob) {
      throw new Error('Audio blob is required');
    }

    setIsLoading(true);
    try {
      // Store using AlgoNode IPFS + Algorand
      const result = await storage.storeVoiceMemory(memoryData.audioBlob, {
        title: memoryData.title,
        note: memoryData.note,
        unlockDate: memoryData.unlockDate,
        emotion: memoryData.emotion,
        userAddress: accounts[0]
      });

      // Create local memory object
      const newMemory: VoiceMemory = {
        ...memoryData,
        id: result.memoryId,
        createdDate: new Date(),
        isLocked: new Date() < memoryData.unlockDate,
        ipfsCid: result.ipfsCid,
        contractId: result.contractId
      };

      setMemories(prev => [newMemory, ...prev]);
      return result.memoryId;

    } catch (error) {
      console.error('Failed to add memory:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
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
        deleteMemory,
        refreshMemories,
        isLoading
      }}
    >
      {children}
    </MemoryContext.Provider>
  );
};