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
      'Hopeful': { from: 'from-blue-400', to: 'to-teal-400', rgb: '59, 130, 246' },
      'Joyful': { from: 'from-yellow-400', to: 'to-orange-400', rgb: '251, 191, 36' },
      'Nostalgic': { from: 'from-purple-400', to: 'to-pink-400', rgb: '147, 51, 234' },
      'Peaceful': { from: 'from-green-400', to: 'to-teal-400', rgb: '34, 197, 94' },
      'Excited': { from: 'from-red-400', to: 'to-pink-400', rgb: '239, 68, 68' },
      'Grateful': { from: 'from-amber-400', to: 'to-orange-400', rgb: '245, 158, 11' }
    };
    return colors[tone] || { from: 'from-gray-400', to: 'to-gray-500', rgb: '156, 163, 175' };
  };

  const colorData = getEmotionColor(emotion.tone);
  const progress = duration > 0 ? currentTime / duration : 0;

  // Generate floating particles based on emotion intensity
  const particles = Array.from({ length: Math.floor(emotion.intensity * 20) }, (_, i) => ({
    id: i,
    delay: Math.random() * 3,
    duration: 2 + Math.random() * 2,
    size: 4 + Math.random() * 8,
    x: Math.random() * 100,
    y: Math.random() * 100
  }));

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
          <div className="flex items-center justify-between text-sm">
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
        </div>
      </div>
    </div>
  );
};

export default EmotionVisualizer;