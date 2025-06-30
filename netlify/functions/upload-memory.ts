import { Handler } from '@netlify/functions';

interface UploadMemoryRequest {
  title: string;
  note?: string;
  unlockDate: string;
  encryptedAudio: string; // Base64 encoded encrypted audio
  encryptionIv: string; // Base64 encoded IV
  emotion: {
    tone: string;
    intensity: number;
  };
  userAddress: string;
}

interface UploadMemoryResponse {
  success: boolean;
  memoryId: string;
  ipfsCid: string;
  contractId?: number;
}

export const handler: Handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const requestData = JSON.parse(event.body || '{}') as UploadMemoryRequest;

    const { title, note, unlockDate, encryptedAudio, encryptionIv, emotion, userAddress } = requestData;

    if (!title || !unlockDate || !encryptedAudio || !userAddress) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Upload to Filebase (IPFS)
    const ipfsCid = await uploadToFilebase(encryptedAudio, encryptionIv, {
      title,
      note,
      emotion,
      createdAt: new Date().toISOString()
    });

    // Create Algorand smart contract
    const contractId = await createAlgorandContract(
      userAddress,
      Math.floor(new Date(unlockDate).getTime() / 1000),
      ipfsCid,
      emotion
    );

    // Generate unique memory ID
    const memoryId = generateMemoryId();

    // Store metadata in database (if using one)
    await storeMemoryMetadata({
      id: memoryId,
      title,
      note,
      unlockDate,
      createdDate: new Date().toISOString(),
      emotion,
      userAddress,
      ipfsCid,
      contractId
    });

    const response: UploadMemoryResponse = {
      success: true,
      memoryId,
      ipfsCid,
      contractId
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify(response)
    };

  } catch (error) {
    console.error('Upload memory error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: 'Failed to upload memory',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

async function uploadToFilebase(
  encryptedAudio: string, 
  encryptionIv: string, 
  metadata: any
): Promise<string> {
  const filebaseApiKey = process.env.FILEBASE_API_KEY;
  const filebaseSecret = process.env.FILEBASE_SECRET;

  if (!filebaseApiKey || !filebaseSecret) {
    throw new Error('Filebase credentials not configured');
  }

  // Create FormData for file upload
  const audioBuffer = Buffer.from(encryptedAudio, 'base64');
  const fileName = `voice-memory-${Date.now()}.encrypted`;

  // In production, use Filebase S3-compatible API
  // For now, return a mock CID
  return `Qm${Math.random().toString(36).substring(2)}`;
}

async function createAlgorandContract(
  userAddress: string,
  unlockTimestamp: number,
  ipfsCid: string,
  emotion: { tone: string; intensity: number }
): Promise<number> {
  // In production, integrate with Algorand SDK
  // For now, return a mock contract ID
  return Math.floor(Math.random() * 1000000);
}

async function storeMemoryMetadata(metadata: any): Promise<void> {
  // In production, store in a database like Supabase
  console.log('Storing memory metadata:', metadata);
}

function generateMemoryId(): string {
  return `memory_${Date.now()}_${Math.random().toString(36).substring(2)}`;
}