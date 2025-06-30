export interface IPFSUploadResult {
  cid: string;
  url: string;
  size: number;
}

export class AlgoNodeIPFS {
  private static readonly UPLOAD_URL = 'https://ipfs.algonode.xyz/api/v0/add';
  private static readonly GATEWAY_URL = 'https://ipfs.algonode.xyz/ipfs/';

  /**
   * Upload encrypted audio to IPFS via AlgoNode
   */
  static async uploadAudio(
    encryptedBlob: Blob,
    metadata: {
      title: string;
      emotion: { tone: string; intensity: number };
      createdAt: string;
      encryptionIv: string;
    }
  ): Promise<IPFSUploadResult> {
    try {
      // Create form data for IPFS upload
      const formData = new FormData();
      
      // Add the encrypted audio file
      formData.append('file', encryptedBlob, 'encrypted-voice-memory.dat');
      
      // Add metadata as a separate file
      const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
      formData.append('file', metadataBlob, 'metadata.json');

      // Upload to AlgoNode IPFS
      const response = await fetch(this.UPLOAD_URL, {
        method: 'POST',
        body: formData,
        headers: {
          // AlgoNode doesn't require API keys for basic uploads
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`IPFS upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      // AlgoNode returns the CID in the response
      const cid = result.Hash || result.cid;
      
      if (!cid) {
        throw new Error('No CID returned from IPFS upload');
      }

      return {
        cid,
        url: `${this.GATEWAY_URL}${cid}`,
        size: encryptedBlob.size
      };

    } catch (error) {
      console.error('AlgoNode IPFS upload failed:', error);
      throw new Error(`Failed to upload to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieve encrypted audio from IPFS
   */
  static async retrieveAudio(cid: string): Promise<Blob> {
    try {
      const response = await fetch(`${this.GATEWAY_URL}${cid}`);
      
      if (!response.ok) {
        throw new Error(`Failed to retrieve from IPFS: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('IPFS retrieval failed:', error);
      throw new Error(`Failed to retrieve from IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if content exists on IPFS
   */
  static async checkAvailability(cid: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.GATEWAY_URL}${cid}`, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get IPFS content info
   */
  static async getContentInfo(cid: string): Promise<{ size: number; type: string } | null> {
    try {
      const response = await fetch(`${this.GATEWAY_URL}${cid}`, { method: 'HEAD' });
      
      if (!response.ok) return null;

      return {
        size: parseInt(response.headers.get('content-length') || '0'),
        type: response.headers.get('content-type') || 'application/octet-stream'
      };
    } catch {
      return null;
    }
  }

  /**
   * Upload multiple files as a directory
   */
  static async uploadDirectory(files: { name: string; content: Blob }[]): Promise<IPFSUploadResult> {
    try {
      const formData = new FormData();
      
      files.forEach(file => {
        formData.append('file', file.content, file.name);
      });

      // Add wrap-with-directory option
      formData.append('wrap-with-directory', 'true');

      const response = await fetch(this.UPLOAD_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Directory upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      const cid = result.Hash || result.cid;

      return {
        cid,
        url: `${this.GATEWAY_URL}${cid}`,
        size: files.reduce((total, file) => total + file.content.size, 0)
      };

    } catch (error) {
      console.error('Directory upload failed:', error);
      throw error;
    }
  }
}