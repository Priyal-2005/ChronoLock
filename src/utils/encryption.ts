// Encryption utilities for voice memories
export class EncryptionManager {
  private static readonly ALGORITHM = 'AES-GCM';
  private static readonly KEY_LENGTH = 256;
  private static readonly IV_LENGTH = 12;

  /**
   * Generate a cryptographic key for encryption
   */
  static async generateKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH
      },
      true, // extractable
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Export a key to raw bytes
   */
  static async exportKey(key: CryptoKey): Promise<Uint8Array> {
    const exported = await crypto.subtle.exportKey('raw', key);
    return new Uint8Array(exported);
  }

  /**
   * Import a key from raw bytes
   */
  static async importKey(keyData: Uint8Array): Promise<CryptoKey> {
    return await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: this.ALGORITHM },
      true,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt audio data
   */
  static async encryptAudio(
    audioBlob: Blob,
    key: CryptoKey
  ): Promise<{ encryptedData: Uint8Array; iv: Uint8Array }> {
    const audioBuffer = await audioBlob.arrayBuffer();
    const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));

    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: this.ALGORITHM,
        iv: iv
      },
      key,
      audioBuffer
    );

    return {
      encryptedData: new Uint8Array(encryptedBuffer),
      iv: iv
    };
  }

  /**
   * Decrypt audio data
   */
  static async decryptAudio(
    encryptedData: Uint8Array,
    key: CryptoKey,
    iv: Uint8Array
  ): Promise<Blob> {
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: this.ALGORITHM,
        iv: iv
      },
      key,
      encryptedData
    );

    return new Blob([decryptedBuffer], { type: 'audio/wav' });
  }

  /**
   * Generate a secure random salt
   */
  static generateSalt(length: number = 32): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(length));
  }

  /**
   * Derive a key from a password using PBKDF2
   */
  static async deriveKeyFromPassword(
    password: string,
    salt: Uint8Array,
    iterations: number = 100000
  ): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    const baseKey = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: iterations,
        hash: 'SHA-256'
      },
      baseKey,
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH
      },
      true,
      ['encrypt', 'decrypt']
    );
  }
}