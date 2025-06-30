import React, { useEffect, useState } from 'react';
import { Brain, Loader, Star } from 'lucide-react';

interface EmotionAnalysisProps {
  audioBlob: Blob;
  onAnalysisComplete: (emotion: { tone: string; intensity: number }) => void;
}

const EmotionAnalysis: React.FC<EmotionAnalysisProps> = ({ audioBlob, onAnalysisComplete }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const analyzeEmotion = async () => {
      setIsAnalyzing(true);
      setError(null);

      try {
        // Mock analysis - in production, this would call ElevenLabs API
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Mock emotion detection result
        const emotions = [
          { tone: 'Joyful', intensity: 0.92 },
          { tone: 'Hopeful', intensity: 0.85 },
          { tone: 'Nostalgic', intensity: 0.76 },
          { tone: 'Peaceful', intensity: 0.68 },
          { tone: 'Excited', intensity: 0.89 },
          { tone: 'Grateful', intensity: 0.73 }
        ];
        
        const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
        onAnalysisComplete(randomEmotion);
        
      } catch (err) {
        setError('The cosmos could not divine your emotion. Please try again.');
        console.error('Emotion analysis error:', err);
      } finally {
        setIsAnalyzing(false);
      }
    };

    if (audioBlob) {
      analyzeEmotion();
    }
  }, [audioBlob, onAnalysisComplete]);

  if (error) {
    return (
      <div className="glass-soft p-6 border border-nebula-500/30">
        <div className="flex items-center space-x-3 text-nebula-300 mb-2">
          <Brain className="h-5 w-5" />
          <span className="font-serif font-medium">Emotion Analysis Failed</span>
        </div>
        <p className="text-starlight-400 font-serif">{error}</p>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="glass-soft p-8 border border-cosmos-500/30">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Loader className="h-6 w-6 animate-spin text-cosmos-400" />
            <Star className="h-4 w-4 text-gold-400 animate-twinkle" />
          </div>
          <p className="text-lg font-serif text-starlight-200 mb-2">
            Divining your emotional essence...
          </p>
          <p className="text-whisper">
            The cosmos listens to your heart's frequency
          </p>
          <div className="mt-6 flex justify-center space-x-2">
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                className="w-2 h-2 bg-cosmos-400 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.3}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default EmotionAnalysis;