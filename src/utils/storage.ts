export interface StorageResult {
  memoryId: string;
}

export class ChronoLockStorage {
  /**
   * Store a voice memory using localStorage
   */
  async storeVoiceMemory(
    audioBlob: Blob,
    metadata: {
      title: string;
      note?: string;
      unlockDate: Date;
      emotion: { tone: string; intensity: number };
      userAddress: string;
    }
  ): Promise<StorageResult> {
    try {
      // Generate unique memory ID
      const memoryId = this.generateMemoryId();

      // Convert audio blob to base64 for localStorage
      const audioBase64 = await this.blobToBase64(audioBlob);

      // Store memory data
      const memoryData = {
        id: memoryId,
        title: metadata.title,
        note: metadata.note,
        unlockDate: metadata.unlockDate.toISOString(),
        createdDate: new Date().toISOString(),
        emotion: metadata.emotion,
        userAddress: metadata.userAddress,
        audioData: audioBase64,
        duration: await this.getAudioDuration(audioBlob),
        isLocked: new Date() < metadata.unlockDate
      };

      // Store in localStorage
      this.storeLocalReference(memoryData);

      return {
        memoryId
      };

    } catch (error) {
      console.error('Failed to store voice memory:', error);
      throw new Error(`Storage failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieve a voice memory from localStorage
   */
  async retrieveVoiceMemory(memoryId: string): Promise<{
    audioBlob: Blob;
    metadata: any;
    isUnlocked: boolean;
  }> {
    try {
      // Get memory from localStorage
      const memoryData = this.getLocalReference(memoryId);
      if (!memoryData) {
        throw new Error('Memory not found');
      }

      // Check if memory is unlocked
      const unlockDate = new Date(memoryData.unlockDate);
      const isUnlocked = new Date() >= unlockDate;
      
      if (!isUnlocked) {
        throw new Error('Memory is still time-locked');
      }

      // Convert base64 back to blob
      const audioBlob = await this.base64ToBlob(memoryData.audioData, 'audio/wav');

      return {
        audioBlob,
        metadata: {
          title: memoryData.title,
          note: memoryData.note,
          emotion: memoryData.emotion,
          createdDate: new Date(memoryData.createdDate),
          unlockDate: unlockDate
        },
        isUnlocked: true
      };

    } catch (error) {
      console.error('Failed to retrieve voice memory:', error);
      throw error;
    }
  }

  /**
   * Get user's memories (metadata only)
   */
  async getUserMemories(userAddress: string): Promise<any[]> {
    try {
      const allMemories = this.getAllLocalReferences()
        .filter(ref => ref.userAddress === userAddress);

      const currentTime = new Date();
      
      const memories = allMemories.map(memory => ({
        id: memory.id,
        title: memory.title,
        note: memory.note,
        unlockDate: new Date(memory.unlockDate),
        createdDate: new Date(memory.createdDate),
        emotion: memory.emotion,
        duration: memory.duration || 0,
        isLocked: currentTime < new Date(memory.unlockDate),
        // Create audio URL for unlocked memories
        audioUrl: currentTime >= new Date(memory.unlockDate) 
          ? this.createAudioUrl(memory.audioData) 
          : undefined
      }));

      return memories.sort((a, b) => 
        b.createdDate.getTime() - a.createdDate.getTime()
      );

    } catch (error) {
      console.error('Failed to get user memories:', error);
      return [];
    }
  }

  // Private helper methods
  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g., "data:audio/wav;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private async base64ToBlob(base64: string, mimeType: string): Promise<Blob> {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  private createAudioUrl(audioBase64: string): string {
    const byteCharacters = atob(audioBase64);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  }

  private async getAudioDuration(audioBlob: Blob): Promise<number> {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.onloadedmetadata = () => {
        resolve(audio.duration);
        URL.revokeObjectURL(audio.src);
      };
      audio.onerror = () => resolve(0);
      audio.src = URL.createObjectURL(audioBlob);
    });
  }

  private generateMemoryId(): string {
    return `memory_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  private storeLocalReference(memoryData: any): void {
    const memories = this.getAllLocalReferences();
    memories.push(memoryData);
    localStorage.setItem('chronolock_memories', JSON.stringify(memories));
  }

  private getLocalReference(memoryId: string): any {
    const memories = this.getAllLocalReferences();
    return memories.find(memory => memory.id === memoryId);
  }

  private getAllLocalReferences(): any[] {
    try {
      const stored = localStorage.getItem('chronolock_memories');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
}