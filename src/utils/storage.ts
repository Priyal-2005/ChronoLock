import { AlgoNodeIPFS } from './ipfs';
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

      // 3. Create encrypted blob
      const encryptedBlob = new Blob([encryptedData], { type: 'application/octet-stream' });

      // 4. Prepare metadata for IPFS
      const ipfsMetadata = {
        title: metadata.title,
        note: metadata.note,
        emotion: metadata.emotion,
        createdAt: new Date().toISOString(),
        encryptionIv: Array.from(iv).toString(), // Store IV as comma-separated string
        duration: await this.getAudioDuration(audioBlob),
        originalSize: audioBlob.size,
        encryptedSize: encryptedData.length
      };

      // 5. Upload to IPFS via AlgoNode
      const ipfsResult = await AlgoNodeIPFS.uploadAudio(encryptedBlob, ipfsMetadata);

      // 6. Create Algorand smart contract
      const unlockTimestamp = Math.floor(metadata.unlockDate.getTime() / 1000);
      const contractId = await this.algorand.createVoiceMemoryContract(
        metadata.userAddress,
        unlockTimestamp,
        ipfsResult.cid,
        metadata.emotion
      );

      // 7. Generate memory ID
      const memoryId = this.generateMemoryId();

      // 8. Store local reference (for quick access)
      this.storeLocalReference({
        id: memoryId,
        title: metadata.title,
        note: metadata.note,
        unlockDate: metadata.unlockDate,
        createdDate: new Date(),
        emotion: metadata.emotion,
        ipfsCid: ipfsResult.cid,
        contractId,
        encryptionKey: btoa(String.fromCharCode(...keyBytes)), // Store as base64
        userAddress: metadata.userAddress
      });

      return {
        memoryId,
        ipfsCid: ipfsResult.cid,
        contractId,
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
      const encryptedBlob = await AlgoNodeIPFS.retrieveAudio(localRef.ipfsCid);

      // 4. Decrypt the audio
      const keyBytes = new Uint8Array(
        atob(localRef.encryptionKey).split('').map(char => char.charCodeAt(0))
      );
      const encryptionKey = await EncryptionManager.importKey(keyBytes);
      
      // Parse IV from stored string
      const iv = new Uint8Array(
        localRef.encryptionIv.split(',').map(num => parseInt(num))
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