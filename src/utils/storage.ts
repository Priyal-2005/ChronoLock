import { EncryptionManager } from './encryption';
import { AlgorandManager } from './algorand';

export interface StorageResult {
  memoryId: string;
  ipfsCid: string;
  contractId: number;
  encryptionKey: string; // Base64 encoded key
}

export class ChronoLockStorage {
  private algorand: AlgorandManager;

  constructor() {
    this.algorand = new AlgorandManager();
  }

  /**
   * Store a voice memory with full encryption and blockchain integration
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
      // 1. Generate encryption key
      const encryptionKey = await EncryptionManager.generateKey();
      const keyBytes = await EncryptionManager.exportKey(encryptionKey);

      // 2. Encrypt the audio
      const { encryptedData, iv } = await EncryptionManager.encryptAudio(audioBlob, encryptionKey);

      // 3. Convert encrypted data and IV to base64 for transmission
      const encryptedAudioBase64 = btoa(String.fromCharCode(...encryptedData));
      const encryptionIvBase64 = btoa(String.fromCharCode(...iv));

      // 4. Send to Netlify function for IPFS upload and contract creation
      const response = await fetch('/.netlify/functions/upload-memory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: metadata.title,
          note: metadata.note,
          unlockDate: metadata.unlockDate.toISOString(),
          encryptedAudio: encryptedAudioBase64,
          encryptionIv: encryptionIvBase64,
          emotion: metadata.emotion,
          userAddress: metadata.userAddress
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      // 5. Store local reference (for quick access)
      this.storeLocalReference({
        id: result.memoryId,
        title: metadata.title,
        note: metadata.note,
        unlockDate: metadata.unlockDate,
        createdDate: new Date(),
        emotion: metadata.emotion,
        ipfsCid: result.ipfsCid,
        contractId: result.contractId,
        encryptionKey: btoa(String.fromCharCode(...keyBytes)), // Store as base64
        encryptionIv: encryptionIvBase64,
        userAddress: metadata.userAddress
      });

      return {
        memoryId: result.memoryId,
        ipfsCid: result.ipfsCid,
        contractId: result.contractId,
        encryptionKey: btoa(String.fromCharCode(...keyBytes))
      };

    } catch (error) {
      console.error('Failed to store voice memory:', error);
      throw new Error(`Storage failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieve and decrypt a voice memory
   */
  async retrieveVoiceMemory(memoryId: string): Promise<{
    audioBlob: Blob;
    metadata: any;
    isUnlocked: boolean;
  }> {
    try {
      // 1. Get local reference
      const localRef = this.getLocalReference(memoryId);
      if (!localRef) {
        throw new Error('Memory not found');
      }

      // 2. Check if memory is unlocked via smart contract
      const isUnlocked = await this.algorand.isMemoryUnlocked(localRef.contractId);
      
      if (!isUnlocked) {
        throw new Error('Memory is still time-locked');
      }

      // 3. Retrieve encrypted data from IPFS
      const encryptedBlob = await this.retrieveFromIPFS(localRef.ipfsCid);

      // 4. Decrypt the audio
      const keyBytes = new Uint8Array(
        atob(localRef.encryptionKey).split('').map(char => char.charCodeAt(0))
      );
      const encryptionKey = await EncryptionManager.importKey(keyBytes);
      
      // Parse IV from base64
      const iv = new Uint8Array(
        atob(localRef.encryptionIv).split('').map(char => char.charCodeAt(0))
      );

      const encryptedData = new Uint8Array(await encryptedBlob.arrayBuffer());
      const audioBlob = await EncryptionManager.decryptAudio(encryptedData, encryptionKey, iv);

      return {
        audioBlob,
        metadata: {
          title: localRef.title,
          note: localRef.note,
          emotion: localRef.emotion,
          createdDate: localRef.createdDate,
          unlockDate: localRef.unlockDate
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
      const localRefs = this.getAllLocalReferences()
        .filter(ref => ref.userAddress === userAddress);

      const memories = await Promise.all(
        localRefs.map(async (ref) => {
          const isUnlocked = await this.algorand.isMemoryUnlocked(ref.contractId);
          
          return {
            id: ref.id,
            title: ref.title,
            note: ref.note,
            unlockDate: ref.unlockDate,
            createdDate: ref.createdDate,
            emotion: ref.emotion,
            isLocked: !isUnlocked,
            ipfsCid: ref.ipfsCid,
            contractId: ref.contractId
          };
        })
      );

      return memories.sort((a, b) => 
        new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
      );

    } catch (error) {
      console.error('Failed to get user memories:', error);
      return [];
    }
  }

  // Private helper methods
  private async retrieveFromIPFS(cid: string): Promise<Blob> {
    try {
      const response = await fetch(`https://ipfs.algonode.xyz/ipfs/${cid}`);
      if (!response.ok) {
        throw new Error(`Failed to retrieve from IPFS: ${response.status}`);
      }
      return await response.blob();
    } catch (error) {
      console.error('IPFS retrieval error:', error);
      throw error;
    }
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

  private storeLocalReference(ref: any): void {
    const refs = this.getAllLocalReferences();
    refs.push(ref);
    localStorage.setItem('chronolock_memory_refs', JSON.stringify(refs));
  }

  private getLocalReference(memoryId: string): any {
    const refs = this.getAllLocalReferences();
    return refs.find(ref => ref.id === memoryId);
  }

  private getAllLocalReferences(): any[] {
    try {
      const stored = localStorage.getItem('chronolock_memory_refs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
}