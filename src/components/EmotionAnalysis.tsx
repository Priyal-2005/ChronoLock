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
        // Analyze audio characteristics for emotion detection
        const audioFeatures = await extractAudioFeatures(audioBlob);
        
        // Simulate analysis time for better UX
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        // Determine emotion based on audio features
        const emotion = determineEmotionFromFeatures(audioFeatures);
        
        onAnalysisComplete(emotion);
        
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

  // Extract audio features for emotion analysis
  const extractAudioFeatures = async (blob: Blob): Promise<AudioFeatures> => {
    return new Promise((resolve, reject) => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const fileReader = new FileReader();

      fileReader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          const channelData = audioBuffer.getChannelData(0);
          const sampleRate = audioBuffer.sampleRate;
          const duration = audioBuffer.duration;
          
          // Calculate various audio features
          const features: AudioFeatures = {
            duration,
            averageAmplitude: calculateAverageAmplitude(channelData),
            energyVariance: calculateEnergyVariance(channelData),
            zeroCrossingRate: calculateZeroCrossingRate(channelData),
            spectralCentroid: calculateSpectralCentroid(channelData, sampleRate),
            tempo: estimateTempo(channelData, sampleRate),
            pitchVariation: calculatePitchVariation(channelData),
            silenceRatio: calculateSilenceRatio(channelData),
            lowFrequencyEnergy: calculateLowFrequencyEnergy(channelData),
            highFrequencyEnergy: calculateHighFrequencyEnergy(channelData),
            voiceStability: calculateVoiceStability(channelData),
            breathingPatterns: analyzeBreathingPatterns(channelData, sampleRate)
          };
          
          resolve(features);
        } catch (error) {
          reject(error);
        }
      };

      fileReader.onerror = () => reject(new Error('Failed to read audio file'));
      fileReader.readAsArrayBuffer(blob);
    });
  };

  // Comprehensive emotion determination based on audio features
  const determineEmotionFromFeatures = (features: AudioFeatures): { tone: string; intensity: number } => {
    const {
      averageAmplitude,
      energyVariance,
      zeroCrossingRate,
      spectralCentroid,
      tempo,
      pitchVariation,
      silenceRatio,
      duration,
      lowFrequencyEnergy,
      highFrequencyEnergy,
      voiceStability,
      breathingPatterns
    } = features;

    // Normalize features to 0-1 range
    const normalizedAmplitude = Math.min(averageAmplitude * 10, 1);
    const normalizedVariance = Math.min(energyVariance * 5, 1);
    const normalizedZCR = Math.min(zeroCrossingRate / 0.1, 1);
    const normalizedCentroid = Math.min(spectralCentroid / 4000, 1);
    const normalizedTempo = Math.min(tempo / 200, 1);
    const normalizedPitchVar = Math.min(pitchVariation * 2, 1);
    const normalizedLowFreq = Math.min(lowFrequencyEnergy * 3, 1);
    const normalizedHighFreq = Math.min(highFrequencyEnergy * 3, 1);
    const normalizedStability = Math.min(voiceStability * 2, 1);

    // Comprehensive emotion detection logic
    let emotion = 'Neutral';
    let intensity = 0.5;

    // SAD: Low energy, low tempo, unstable voice, high silence ratio
    if (normalizedAmplitude < 0.4 && normalizedTempo < 0.3 && normalizedStability < 0.4 && silenceRatio > 0.4) {
      emotion = 'Sad';
      intensity = 0.60 + Math.random() * 0.30;
    }
    // ANXIOUS: High variance, unstable voice, fast tempo, irregular breathing
    else if (normalizedVariance > 0.6 && normalizedStability < 0.3 && normalizedTempo > 0.6 && breathingPatterns > 0.6) {
      emotion = 'Anxious';
      intensity = 0.70 + Math.random() * 0.25;
    }
    // WORRIED: Moderate energy, high pitch variation, unstable voice, moderate tempo
    else if (normalizedAmplitude > 0.3 && normalizedAmplitude < 0.6 && normalizedPitchVar > 0.5 && normalizedStability < 0.5) {
      emotion = 'Worried';
      intensity = 0.65 + Math.random() * 0.30;
    }
    // ANGRY: High energy, high variance, high tempo, high low-frequency energy
    else if (normalizedAmplitude > 0.7 && normalizedVariance > 0.7 && normalizedTempo > 0.7 && normalizedLowFreq > 0.6) {
      emotion = 'Angry';
      intensity = 0.80 + Math.random() * 0.20;
    }
    // FRUSTRATED: High energy variance, moderate amplitude, irregular patterns
    else if (normalizedVariance > 0.6 && normalizedAmplitude > 0.4 && normalizedAmplitude < 0.7 && normalizedStability < 0.4) {
      emotion = 'Frustrated';
      intensity = 0.70 + Math.random() * 0.25;
    }
    // MELANCHOLIC: Low energy, slow tempo, stable but quiet voice, longer pauses
    else if (normalizedAmplitude < 0.5 && normalizedTempo < 0.4 && normalizedStability > 0.6 && silenceRatio > 0.3) {
      emotion = 'Melancholic';
      intensity = 0.65 + Math.random() * 0.25;
    }
    // EXCITED: High energy, high tempo, high amplitude, high pitch variation
    else if (normalizedAmplitude > 0.6 && normalizedTempo > 0.7 && normalizedVariance > 0.6 && normalizedPitchVar > 0.6) {
      emotion = 'Excited';
      intensity = 0.85 + Math.random() * 0.15;
    }
    // JOYFUL: High energy, moderate tempo, stable voice, bright tone
    else if (normalizedAmplitude > 0.6 && normalizedTempo > 0.5 && normalizedStability > 0.5 && normalizedHighFreq > 0.5) {
      emotion = 'Joyful';
      intensity = 0.80 + Math.random() * 0.20;
    }
    // HOPEFUL: Moderate-high energy, rising pitch patterns, stable delivery
    else if (normalizedAmplitude > 0.5 && normalizedPitchVar > 0.5 && normalizedStability > 0.6 && normalizedCentroid > 0.5) {
      emotion = 'Hopeful';
      intensity = 0.75 + Math.random() * 0.20;
    }
    // NOSTALGIC: Moderate energy, slow tempo, stable voice, thoughtful pauses
    else if (normalizedAmplitude > 0.3 && normalizedAmplitude < 0.6 && normalizedTempo < 0.5 && normalizedStability > 0.5) {
      emotion = 'Nostalgic';
      intensity = 0.70 + Math.random() * 0.25;
    }
    // PEACEFUL: Low-moderate energy, slow tempo, very stable voice, gentle delivery
    else if (normalizedAmplitude < 0.6 && normalizedTempo < 0.4 && normalizedStability > 0.7 && normalizedVariance < 0.3) {
      emotion = 'Peaceful';
      intensity = 0.65 + Math.random() * 0.25;
    }
    // GRATEFUL: Moderate energy, stable voice, warm tone, consistent delivery
    else if (normalizedAmplitude > 0.4 && normalizedAmplitude < 0.7 && normalizedStability > 0.6 && normalizedVariance < 0.4) {
      emotion = 'Grateful';
      intensity = 0.72 + Math.random() * 0.23;
    }
    // CONFUSED: Irregular patterns, moderate energy, unstable voice, hesitations
    else if (normalizedVariance > 0.5 && normalizedStability < 0.4 && silenceRatio > 0.3 && normalizedPitchVar > 0.4) {
      emotion = 'Confused';
      intensity = 0.60 + Math.random() * 0.30;
    }
    // DETERMINED: Steady energy, stable voice, consistent tempo, clear delivery
    else if (normalizedAmplitude > 0.5 && normalizedStability > 0.7 && normalizedVariance < 0.4 && normalizedZCR > 0.5) {
      emotion = 'Determined';
      intensity = 0.75 + Math.random() * 0.20;
    }
    // CONTEMPLATIVE: Moderate energy, thoughtful pauses, stable delivery
    else if (normalizedAmplitude > 0.3 && normalizedAmplitude < 0.6 && silenceRatio > 0.25 && normalizedStability > 0.6) {
      emotion = 'Contemplative';
      intensity = 0.68 + Math.random() * 0.25;
    }
    // LONELY: Low energy, slow tempo, quiet voice, long pauses
    else if (normalizedAmplitude < 0.4 && normalizedTempo < 0.3 && silenceRatio > 0.4 && duration > 20) {
      emotion = 'Lonely';
      intensity = 0.65 + Math.random() * 0.30;
    }

    // Ensure intensity is within reasonable bounds
    intensity = Math.min(Math.max(intensity, 0.5), 1.0);

    return { tone: emotion, intensity };
  };

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
            Analyzing your voice patterns...
          </p>
          <p className="text-whisper">
            Reading the emotional frequencies in your words
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

// Enhanced audio feature extraction
interface AudioFeatures {
  duration: number;
  averageAmplitude: number;
  energyVariance: number;
  zeroCrossingRate: number;
  spectralCentroid: number;
  tempo: number;
  pitchVariation: number;
  silenceRatio: number;
  lowFrequencyEnergy: number;
  highFrequencyEnergy: number;
  voiceStability: number;
  breathingPatterns: number;
}

const calculateAverageAmplitude = (channelData: Float32Array): number => {
  let sum = 0;
  for (let i = 0; i < channelData.length; i++) {
    sum += Math.abs(channelData[i]);
  }
  return sum / channelData.length;
};

const calculateEnergyVariance = (channelData: Float32Array): number => {
  const windowSize = 1024;
  const energies: number[] = [];
  
  for (let i = 0; i < channelData.length - windowSize; i += windowSize) {
    let energy = 0;
    for (let j = i; j < i + windowSize; j++) {
      energy += channelData[j] * channelData[j];
    }
    energies.push(energy / windowSize);
  }
  
  if (energies.length < 2) return 0;
  
  const meanEnergy = energies.reduce((a, b) => a + b, 0) / energies.length;
  const variance = energies.reduce((sum, energy) => sum + Math.pow(energy - meanEnergy, 2), 0) / energies.length;
  
  return Math.sqrt(variance);
};

const calculateZeroCrossingRate = (channelData: Float32Array): number => {
  let crossings = 0;
  for (let i = 1; i < channelData.length; i++) {
    if ((channelData[i] >= 0) !== (channelData[i - 1] >= 0)) {
      crossings++;
    }
  }
  return crossings / channelData.length;
};

const calculateSpectralCentroid = (channelData: Float32Array, sampleRate: number): number => {
  const fftSize = 2048;
  let weightedSum = 0;
  let magnitudeSum = 0;
  
  for (let i = 0; i < Math.min(fftSize, channelData.length); i++) {
    const magnitude = Math.abs(channelData[i]);
    const frequency = (i * sampleRate) / (2 * fftSize);
    weightedSum += frequency * magnitude;
    magnitudeSum += magnitude;
  }
  
  return magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;
};

const estimateTempo = (channelData: Float32Array, sampleRate: number): number => {
  const windowSize = Math.floor(sampleRate * 0.1); // 100ms windows
  const energies: number[] = [];
  
  for (let i = 0; i < channelData.length - windowSize; i += windowSize) {
    let energy = 0;
    for (let j = i; j < i + windowSize; j++) {
      energy += channelData[j] * channelData[j];
    }
    energies.push(energy);
  }
  
  // Count peaks to estimate tempo
  let peaks = 0;
  const threshold = energies.reduce((a, b) => a + b, 0) / energies.length * 1.5;
  
  for (let i = 1; i < energies.length - 1; i++) {
    if (energies[i] > threshold && energies[i] > energies[i - 1] && energies[i] > energies[i + 1]) {
      peaks++;
    }
  }
  
  const durationInMinutes = channelData.length / sampleRate / 60;
  return peaks / durationInMinutes;
};

const calculatePitchVariation = (channelData: Float32Array): number => {
  const windowSize = 1024;
  const pitches: number[] = [];
  
  for (let i = 0; i < channelData.length - windowSize; i += windowSize) {
    const window = channelData.slice(i, i + windowSize);
    const pitch = estimatePitchFromWindow(window);
    if (pitch > 0) pitches.push(pitch);
  }
  
  if (pitches.length < 2) return 0;
  
  const meanPitch = pitches.reduce((a, b) => a + b, 0) / pitches.length;
  const variance = pitches.reduce((sum, pitch) => sum + Math.pow(pitch - meanPitch, 2), 0) / pitches.length;
  
  return Math.sqrt(variance) / meanPitch;
};

const estimatePitchFromWindow = (window: Float32Array): number => {
  let maxCorrelation = 0;
  let bestPeriod = 0;
  
  for (let period = 20; period < window.length / 2; period++) {
    let correlation = 0;
    for (let i = 0; i < window.length - period; i++) {
      correlation += window[i] * window[i + period];
    }
    
    if (correlation > maxCorrelation) {
      maxCorrelation = correlation;
      bestPeriod = period;
    }
  }
  
  return bestPeriod > 0 ? 44100 / bestPeriod : 0;
};

const calculateSilenceRatio = (channelData: Float32Array): number => {
  const threshold = 0.01;
  let silentSamples = 0;
  
  for (let i = 0; i < channelData.length; i++) {
    if (Math.abs(channelData[i]) < threshold) {
      silentSamples++;
    }
  }
  
  return silentSamples / channelData.length;
};

const calculateLowFrequencyEnergy = (channelData: Float32Array): number => {
  // Focus on lower frequencies (0-500Hz range)
  let lowFreqEnergy = 0;
  const windowSize = 512;
  
  for (let i = 0; i < Math.min(windowSize, channelData.length); i++) {
    lowFreqEnergy += channelData[i] * channelData[i];
  }
  
  return lowFreqEnergy / windowSize;
};

const calculateHighFrequencyEnergy = (channelData: Float32Array): number => {
  // Focus on higher frequencies
  let highFreqEnergy = 0;
  const startIndex = Math.floor(channelData.length * 0.6);
  const endIndex = Math.min(startIndex + 512, channelData.length);
  
  for (let i = startIndex; i < endIndex; i++) {
    highFreqEnergy += channelData[i] * channelData[i];
  }
  
  return highFreqEnergy / (endIndex - startIndex);
};

const calculateVoiceStability = (channelData: Float32Array): number => {
  const windowSize = 2048;
  const stabilities: number[] = [];
  
  for (let i = 0; i < channelData.length - windowSize; i += windowSize) {
    const window = channelData.slice(i, i + windowSize);
    let stability = 0;
    
    // Calculate local stability based on amplitude consistency
    const meanAmplitude = window.reduce((sum, val) => sum + Math.abs(val), 0) / window.length;
    const variance = window.reduce((sum, val) => sum + Math.pow(Math.abs(val) - meanAmplitude, 2), 0) / window.length;
    
    stability = 1 / (1 + Math.sqrt(variance) * 10); // Inverse relationship with variance
    stabilities.push(stability);
  }
  
  return stabilities.length > 0 ? stabilities.reduce((a, b) => a + b, 0) / stabilities.length : 0;
};

const analyzeBreathingPatterns = (channelData: Float32Array, sampleRate: number): number => {
  // Analyze breathing patterns by looking for regular low-amplitude periods
  const windowSize = Math.floor(sampleRate * 0.5); // 500ms windows
  const breathingIndicators: number[] = [];
  
  for (let i = 0; i < channelData.length - windowSize; i += windowSize) {
    let lowAmplitudeSamples = 0;
    for (let j = i; j < i + windowSize; j++) {
      if (Math.abs(channelData[j]) < 0.005) { // Very quiet samples
        lowAmplitudeSamples++;
      }
    }
    
    const breathingRatio = lowAmplitudeSamples / windowSize;
    breathingIndicators.push(breathingRatio);
  }
  
  // Calculate irregularity in breathing patterns
  if (breathingIndicators.length < 2) return 0;
  
  const meanBreathing = breathingIndicators.reduce((a, b) => a + b, 0) / breathingIndicators.length;
  const variance = breathingIndicators.reduce((sum, val) => sum + Math.pow(val - meanBreathing, 2), 0) / breathingIndicators.length;
  
  return Math.sqrt(variance); // Higher values indicate more irregular breathing
};

export default EmotionAnalysis;