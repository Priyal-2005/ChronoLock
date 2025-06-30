import React from 'react';

interface EmotionVisualizerProps {
  emotion: {
    tone: string;
    intensity: number;
  };
  isPlaying: boolean;
  currentTime: number;
  duration: number;
}

const EmotionVisualizer: React.FC<EmotionVisualizerProps> = ({ 
  emotion, 
  isPlaying, 
  currentTime, 
  duration 
}) => {
  const getEmotionColor = (tone: string) => {
    const colors: Record<string, { from: string; to: string; rgb: string }> = {
      // Positive emotions
      'Hopeful': { from: 'from-blue-400', to: 'to-teal-400', rgb: '59, 130, 246' },
      'Joyful': { from: 'from-yellow-400', to: 'to-orange-400', rgb: '251, 191, 36' },
      'Excited': { from: 'from-purple-400', to: 'to-pink-400', rgb: '168, 85, 247' },
      'Grateful': { from: 'from-amber-400', to: 'to-orange-400', rgb: '245, 158, 11' },
      'Peaceful': { from: 'from-green-400', to: 'to-teal-400', rgb: '34, 197, 94' },
      'Determined': { from: 'from-indigo-400', to: 'to-purple-400', rgb: '99, 102, 241' },
      
      // Contemplative emotions
      'Nostalgic': { from: 'from-purple-400', to: 'to-pink-400', rgb: '147, 51, 234' },
      'Contemplative': { from: 'from-gray-400', to: 'to-slate-400', rgb: '156, 163, 175' },
      'Melancholic': { from: 'from-blue-500', to: 'to-indigo-500', rgb: '59, 130, 246' },
      
      // Challenging emotions
      'Sad': { from: 'from-blue-600', to: 'to-blue-700', rgb: '37, 99, 235' },
      'Anxious': { from: 'from-red-400', to: 'to-orange-400', rgb: '248, 113, 113' },
      'Worried': { from: 'from-yellow-500', to: 'to-orange-500', rgb: '234, 179, 8' },
      'Angry': { from: 'from-red-500', to: 'to-red-600', rgb: '239, 68, 68' },
      'Frustrated': { from: 'from-orange-500', to: 'to-red-500', rgb: '249, 115, 22' },
      'Confused': { from: 'from-purple-500', to: 'to-indigo-500', rgb: '168, 85, 247' },
      'Lonely': { from: 'from-blue-500', to: 'to-slate-500', rgb: '59, 130, 246' },
      
      // Neutral
      'Neutral': { from: 'from-gray-400', to: 'to-gray-500', rgb: '156, 163, 175' }
    };
    return colors[tone] || { from: 'from-gray-400', to: 'to-gray-500', rgb: '156, 163, 175' };
  };

  const colorData = getEmotionColor(emotion.tone);
  const progress = duration > 0 ? currentTime / duration : 0;

  // Generate floating particles based on emotion intensity and type
  const getParticleCount = (tone: string, intensity: number) => {
    const baseCount = Math.floor(intensity * 15);
    const emotionMultipliers: Record<string, number> = {
      'Excited': 1.5,
      'Joyful': 1.3,
      'Anxious': 1.4,
      'Angry': 1.2,
      'Sad': 0.6,
      'Peaceful': 0.7,
      'Melancholic': 0.5
    };
    return Math.floor(baseCount * (emotionMultipliers[tone] || 1));
  };

  const particles = Array.from({ length: getParticleCount(emotion.tone, emotion.intensity) }, (_, i) => ({
    id: i,
    delay: Math.random() * 3,
    duration: 2 + Math.random() * 2,
    size: 4 + Math.random() * 8,
    x: Math.random() * 100,
    y: Math.random() * 100
  }));

  const getEmotionDescription = (tone: string) => {
    const descriptions: Record<string, string> = {
      // Positive emotions
      'Hopeful': 'Radiating optimism and possibility',
      'Joyful': 'Bursting with happiness and light',
      'Excited': 'Vibrating with anticipation and energy',
      'Grateful': 'Glowing with appreciation and warmth',
      'Peaceful': 'Flowing with calm and serenity',
      'Determined': 'Pulsing with resolve and strength',
      
      // Contemplative emotions
      'Nostalgic': 'Drifting through memories and time',
      'Contemplative': 'Reflecting in thoughtful silence',
      'Melancholic': 'Touched by gentle, bittersweet beauty',
      
      // Challenging emotions
      'Sad': 'Carrying the weight of sorrow',
      'Anxious': 'Trembling with nervous energy',
      'Worried': 'Clouded with concern and care',
      'Angry': 'Burning with fierce intensity',
      'Frustrated': 'Struggling against constraints',
      'Confused': 'Searching through uncertainty',
      'Lonely': 'Yearning for connection',
      
      // Neutral
      'Neutral': 'Resting in balanced calm'
    };
    return descriptions[tone] || 'Expressing human emotion';
  };

  return (
    <div className="relative h-80 bg-gradient-to-br from-stone-50 to-stone-100 rounded-xl overflow-hidden">
      {/* Background Emotion Glow */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br ${colorData.from} ${colorData.to} opacity-20 transition-opacity duration-1000`}
        style={{ opacity: isPlaying ? emotion.intensity * 0.4 : 0.1 }}
      />

      {/* Floating Particles */}
      {isPlaying && particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full animate-bounce"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: `rgba(${colorData.rgb}, 0.6)`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`
          }}
        />
      ))}

      {/* Central Emotion Circle */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className={`relative w-32 h-32 rounded-full bg-gradient-to-br ${colorData.from} ${colorData.to} flex items-center justify-center transition-all duration-500`}
          style={{ 
            transform: `scale(${0.8 + (isPlaying ? emotion.intensity * 0.4 : 0)})`,
            boxShadow: isPlaying ? `0 0 40px rgba(${colorData.rgb}, 0.5)` : 'none'
          }}
        >
          <div className="text-center text-white">
            <div className="text-2xl font-bold mb-1">{emotion.tone}</div>
            <div className="text-sm opacity-90">
              {Math.round(emotion.intensity * 100)}%
            </div>
          </div>

          {/* Pulsing Ring */}
          {isPlaying && (
            <div 
              className={`absolute inset-0 rounded-full bg-gradient-to-br ${colorData.from} ${colorData.to} animate-ping`}
              style={{ opacity: 0.3 }}
            />
          )}
        </div>
      </div>

      {/* Progress Wave */}
      <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden">
        <div 
          className={`absolute inset-0 bg-gradient-to-r ${colorData.from} ${colorData.to} opacity-60 transition-all duration-100`}
          style={{ 
            transform: `translateX(${-100 + progress * 100}%)`,
            clipPath: 'polygon(0 50%, 100% 30%, 100% 100%, 0% 100%)'
          }}
        />
      </div>

      {/* Emotion Stats */}
      <div className="absolute top-4 left-4 right-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium text-stone-700">Emotional Intensity</span>
            <span className="text-stone-600">{Math.round(emotion.intensity * 100)}%</span>
          </div>
          <div className="w-full h-2 bg-stone-200 rounded-full mt-2 overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${colorData.from} ${colorData.to} transition-all duration-500`}
              style={{ 
                width: `${emotion.intensity * 100}%`,
                transform: isPlaying ? 'scaleY(1.2)' : 'scaleY(1)'
              }}
            />
          </div>
          <p className="text-xs text-stone-500 mt-2 italic">
            {getEmotionDescription(emotion.tone)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmotionVisualizer;