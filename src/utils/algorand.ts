import algosdk from 'algosdk';

export interface VoiceMemoryContract {
  appId: number;
  creator: string;
  unlockTimestamp: number;
  ipfsCid: string;
  emotionData: {
    tone: string;
    intensity: number;
  };
}

export class AlgorandManager {
  private algodClient: algosdk.Algodv2;
  private indexerClient: algosdk.Indexer;

  constructor() {
    // Using Testnet for development
    const algodToken = '';
    const algodServer = 'https://testnet-api.algonode.cloud';
    const algodPort = '';

    const indexerToken = '';
    const indexerServer = 'https://testnet-idx.algonode.cloud';
    const indexerPort = '';

    this.algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);
    this.indexerClient = new algosdk.Indexer(indexerToken, indexerServer, indexerPort);
  }

  /**
   * Create a time-locked voice memory contract
   */
  async createVoiceMemoryContract(
    creatorAddress: string,
    unlockTimestamp: number,
    ipfsCid: string,
    emotionData: { tone: string; intensity: number }
  ): Promise<number> {
    try {
      const suggestedParams = await this.algodClient.getTransactionParams().do();

      // Simplified contract logic - in production, use PyTeal
      const approvalProgram = this.compileTimeLockedContract(unlockTimestamp);
      const clearProgram = new Uint8Array(Buffer.from('I0GCNA==', 'base64')); // Simple clear program

      const appCreateTxn = algosdk.makeApplicationCreateTxnFromObject({
        from: creatorAddress,
        suggestedParams,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        approvalProgram,
        clearProgram,
        numLocalInts: 0,
        numLocalByteSlices: 0,
        numGlobalInts: 2, // unlock_timestamp, emotion_intensity
        numGlobalByteSlices: 2, // ipfs_cid, emotion_tone
        appArgs: [
          algosdk.encodeUint64(unlockTimestamp),
          new Uint8Array(Buffer.from(ipfsCid, 'utf8')),
          new Uint8Array(Buffer.from(emotionData.tone, 'utf8')),
          algosdk.encodeUint64(Math.floor(emotionData.intensity * 1000)) // Store as integer
        ]
      });

      // This would need to be signed with the user's wallet
      return 0; // Mock app ID - replace with actual transaction submission
    } catch (error) {
      console.error('Failed to create voice memory contract:', error);
      throw error;
    }
  }

  /**
   * Check if a voice memory is unlocked
   */
  async isMemoryUnlocked(appId: number): Promise<boolean> {
    try {
      const appInfo = await this.algodClient.getApplicationByID(appId).do();
      const globalState = appInfo.params['global-state'];
      
      const unlockTimestampState = globalState.find((state: any) => 
        Buffer.from(state.key, 'base64').toString() === 'unlock_timestamp'
      );

      if (!unlockTimestampState) {
        throw new Error('Unlock timestamp not found in contract state');
      }

      const unlockTimestamp = unlockTimestampState.value.uint;
      const currentTimestamp = Math.floor(Date.now() / 1000);

      return currentTimestamp >= unlockTimestamp;
    } catch (error) {
      console.error('Failed to check memory unlock status:', error);
      throw error;
    }
  }

  /**
   * Get voice memory details from contract
   */
  async getVoiceMemoryDetails(appId: number): Promise<VoiceMemoryContract> {
    try {
      const appInfo = await this.algodClient.getApplicationByID(appId).do();
      const globalState = appInfo.params['global-state'];
      
      const parseGlobalState = (key: string, type: 'uint' | 'bytes') => {
        const state = globalState.find((s: any) => 
          Buffer.from(s.key, 'base64').toString() === key
        );
        if (!state) throw new Error(`State key ${key} not found`);
        
        return type === 'uint' 
          ? state.value.uint 
          : Buffer.from(state.value.bytes, 'base64').toString();
      };

      return {
        appId,
        creator: appInfo.params.creator,
        unlockTimestamp: parseGlobalState('unlock_timestamp', 'uint'),
        ipfsCid: parseGlobalState('ipfs_cid', 'bytes'),
        emotionData: {
          tone: parseGlobalState('emotion_tone', 'bytes'),
          intensity: parseGlobalState('emotion_intensity', 'uint') / 1000
        }
      };
    } catch (error) {
      console.error('Failed to get voice memory details:', error);
      throw error;
    }
  }

  /**
   * Compile a simple time-locked contract
   * In production, this would be generated using PyTeal
   */
  private compileTimeLockedContract(unlockTimestamp: number): Uint8Array {
    // This is a simplified mock - in production, use PyTeal to generate the proper bytecode
    // The contract should check current timestamp against unlock timestamp
    const mockBytecode = `#pragma version 6
    
    // Global state keys
    byte "unlock_timestamp"
    int ${unlockTimestamp}
    app_global_put
    
    // Simple approval logic
    int 1
    return`;

    // In production, compile this with algosdk.compileProgram
    return new Uint8Array(Buffer.from('I0GCNA==', 'base64')); // Mock bytecode
  }

  /**
   * Get user's voice memories
   */
  async getUserVoiceMemories(userAddress: string): Promise<VoiceMemoryContract[]> {
    try {
      const accountInfo = await this.indexerClient
        .lookupAccountCreatedApplications(userAddress)
        .do();

      const memories: VoiceMemoryContract[] = [];
      
      for (const app of accountInfo.applications || []) {
        try {
          const memoryDetails = await this.getVoiceMemoryDetails(app.id);
          memories.push(memoryDetails);
        } catch (error) {
          console.warn(`Failed to get details for app ${app.id}:`, error);
        }
      }

      return memories;
    } catch (error) {
      console.error('Failed to get user voice memories:', error);
      return [];
    }
  }
}