import React from 'react';
import { useAudio } from '../contexts/AudioContext';

const WaveformVisualizer: React.FC = () => {
  const { isRecording, waveformData } = useAudio();

  // Generate static bars for when not recording
  const staticBars = Array.from({ length: 40 }, (_, i) => Math.random() * 0.1 + 0.05);
  const barsToShow = isRecording && waveformData.length > 0 ? waveformData : staticBars;

  return (
    <div className="glass-soft p-8 border border-white/[0.08]">
      <div className="flex items-center justify-center h-40">
        <div className="flex items-end space-x-1 h-full">
          {barsToShow.slice(0, 40).map((amplitude, index) => (
            <div
              key={index}
              className={`rounded-t-full transition-all duration-200 ${
                isRecording 
                  ? 'bg-gradient-to-t from-cosmos-600 via-nebula-500 to-aurora-400' 
                  : 'bg-gradient-to-t from-starlight-600/40 via-starlight-500/30 to-starlight-400/20'
              }`}
              style={{
                width: '4px',
                height: `${Math.max(8, amplitude * 120)}px`,
                opacity: isRecording ? 1 : 0.4,
                animationDelay: `${index * 0.05}s`
              }}
            />
          ))}
        </div>
      </div>
      
      <div className="text-center mt-6">
        <p className={`text-lg font-serif transition-colors duration-500 ${
          isRecording ? 'text-starlight-200' : 'text-starlight-400'
        }`}>
          {isRecording ? 'Your voice flows into eternity...' : 'Ready to capture your whisper'}
        </p>
        <p className="text-whisper mt-2">
          {isRecording ? 'Speak from your heart' : 'When you\'re ready, begin'}
        </p>
      </div>
    </div>
  );
};

export default WaveformVisualizer;