import { Handler } from '@netlify/functions';

interface GetMemoriesRequest {
  userAddress: string;
}

interface VoiceMemory {
  id: string;
  title: string;
  note?: string;
  unlockDate: string;
  createdDate: string;
  emotion: {
    tone: string;
    intensity: number;
  };
  duration: number;
  isLocked: boolean;
  ipfsCid: string;
  contractId: number;
}

export const handler: Handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const userAddress = event.queryStringParameters?.userAddress;

    if (!userAddress) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'User address is required' })
      };
    }

    // In production, fetch from database and Algorand
    const memories = await getUserMemories(userAddress);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: JSON.stringify({ memories })
    };

  } catch (error) {
    console.error('Get memories error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: 'Failed to get memories',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

async function getUserMemories(userAddress: string): Promise<VoiceMemory[]> {
  // Mock data for development
  const mockMemories: VoiceMemory[] = [
    {
      id: '1',
      title: 'Birthday Message to Future Me',
      note: 'Recording this on my 25th birthday, to open on my 30th',
      unlockDate: '2025-12-25T00:00:00Z',
      createdDate: '2024-12-25T00:00:00Z',
      emotion: { tone: 'Hopeful', intensity: 0.85 },
      duration: 120,
      isLocked: true,
      ipfsCid: 'QmMockCid1',
      contractId: 123456
    },
    {
      id: '2',
      title: 'Wedding Day Wishes',
      note: 'For our 5th anniversary',
      unlockDate: '2024-06-15T00:00:00Z',
      createdDate: '2023-06-15T00:00:00Z',
      emotion: { tone: 'Joyful', intensity: 0.92 },
      duration: 180,
      isLocked: false,
      ipfsCid: 'QmMockCid2',
      contractId: 123457
    },
    {
      id: '3',
      title: 'New Year Reflections',
      unlockDate: '2025-01-01T00:00:00Z',
      createdDate: '2024-01-01T00:00:00Z',
      emotion: { tone: 'Nostalgic', intensity: 0.76 },
      duration: 95,
      isLocked: true,
      ipfsCid: 'QmMockCid3',
      contractId: 123458
    }
  ];

  // Update lock status based on current date
  const currentTime = new Date();
  return mockMemories.map(memory => ({
    ...memory,
    isLocked: new Date(memory.unlockDate) > currentTime
  }));
}