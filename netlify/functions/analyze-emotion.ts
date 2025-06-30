import { Handler } from '@netlify/functions';

interface EmotionAnalysisRequest {
  audioData: string; // Base64 encoded audio
}

interface EmotionAnalysisResponse {
  tone: string;
  intensity: number;
  confidence: number;
}

export const handler: Handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { audioData } = JSON.parse(event.body || '{}') as EmotionAnalysisRequest;

    if (!audioData) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Audio data is required' })
      };
    }

    // In production, integrate with ElevenLabs API
    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
    
    if (!elevenLabsApiKey) {
      console.warn('ElevenLabs API key not configured, using mock analysis');
      
      // Mock emotion analysis for development
      const mockEmotions = [
        { tone: 'Joyful', intensity: 0.92, confidence: 0.89 },
        { tone: 'Hopeful', intensity: 0.85, confidence: 0.94 },
        { tone: 'Nostalgic', intensity: 0.76, confidence: 0.82 },
        { tone: 'Peaceful', intensity: 0.68, confidence: 0.87 },
        { tone: 'Excited', intensity: 0.89, confidence: 0.91 },
        { tone: 'Grateful', intensity: 0.73, confidence: 0.85 }
      ];
      
      const randomEmotion = mockEmotions[Math.floor(Math.random() * mockEmotions.length)];
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify(randomEmotion)
      };
    }

    // Real ElevenLabs integration
    const response = await fetch('https://api.elevenlabs.io/v1/speech-to-speech', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'xi-api-key': elevenLabsApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        audio: audioData,
        model_id: 'eleven_english_sts_v2'
      })
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`);
    }

    const result = await response.json();
    
    // Extract emotion data from ElevenLabs response
    // This is simplified - actual implementation depends on ElevenLabs API structure
    const emotionResult: EmotionAnalysisResponse = {
      tone: result.emotion?.primary || 'Neutral',
      intensity: result.emotion?.intensity || 0.5,
      confidence: result.confidence || 0.8
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify(emotionResult)
    };

  } catch (error) {
    console.error('Emotion analysis error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: 'Failed to analyze emotion',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};