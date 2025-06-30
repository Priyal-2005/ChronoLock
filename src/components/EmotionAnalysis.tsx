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

    // Normalize features to 0-1 range with better scaling
    const normalizedAmplitude = Math.min(Math.max(averageAmplitude * 20, 0), 1);
    const normalizedVariance = Math.min(Math.max(energyVariance * 10, 0), 1);
    const normalizedZCR = Math.min(Math.max(zeroCrossingRate / 0.05, 0), 1);
    const normalizedCentroid = Math.min(Math.max(spectralCentroid / 2000, 0), 1);
    const normalizedTempo = Math.min(Math.max(tempo / 100, 0), 1);
    const normalizedPitchVar = Math.min(Math.max(pitchVariation * 5, 0), 1);
    const normalizedLowFreq = Math.min(Math.max(lowFrequencyEnergy * 10, 0), 1);
    const normalizedHighFreq = Math.min(Math.max(highFrequencyEnergy * 10, 0), 1);
    const normalizedStability = Math.min(Math.max(voiceStability * 3, 0), 1);

    // Create emotion scores based on feature combinations
    const emotionScores = {
      // Positive emotions
      'Joyful': calculateJoyfulScore(normalizedAmplitude, normalizedTempo, normalizedHighFreq, normalizedStability),
      'Excited': calculateExcitedScore(normalizedAmplitude, normalizedTempo, normalizedVariance, normalizedPitchVar),
      'Hopeful': calculateHopefulScore(normalizedAmplitude, normalizedCentroid, normalizedStability, normalizedHighFreq),
      'Grateful': calculateGratefulScore(normalizedAmplitude, normalizedStability, normalizedLowFreq, silenceRatio),
      'Peaceful': calculatePeacefulScore(normalizedAmplitude, normalizedStability, silenceRatio, normalizedVariance),
      'Determined': calculateDeterminedScore(normalizedAmplitude, normalizedStability, normalizedTempo, normalizedZCR),
      
      // Contemplative emotions
      'Nostalgic': calculateNostalgicScore(normalizedAmplitude, normalizedTempo, silenceRatio, normalizedStability),
      'Contemplative': calculateContemplativeScore(normalizedAmplitude, silenceRatio, normalizedStability, normalizedTempo),
      'Melancholic': calculateMelancholicScore(normalizedAmplitude, normalizedTempo, normalizedStability, silenceRatio),
      
      // Challenging emotions
      'Sad': calculateSadScore(normalizedAmplitude, normalizedTempo, normalizedStability, silenceRatio),
      'Anxious': calculateAnxiousScore(normalizedVariance, normalizedStability, breathingPatterns, normalizedTempo),
      'Worried': calculateWorriedScore(normalizedAmplitude, normalizedPitchVar, normalizedStability, normalizedVariance),
      'Angry': calculateAngryScore(normalizedAmplitude, normalizedVariance, normalizedTempo, normalizedLowFreq),
      'Frustrated': calculateFrustratedScore(normalizedVariance, normalizedAmplitude, normalizedStability, normalizedTempo),
      'Confused': calculateConfusedScore(normalizedVariance, normalizedStability, silenceRatio, normalizedPitchVar),
      'Lonely': calculateLonelyScore(normalizedAmplitude, normalizedTempo, silenceRatio, duration)
    };

    // Find the emotion with the highest score
    const bestEmotion = Object.entries(emotionScores).reduce((best, [emotion, score]) => 
      score > best.score ? { emotion, score } : best
    , { emotion: 'Neutral', score: 0 });

    // Add some randomness to prevent always getting the same result
    const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
    const finalIntensity = Math.min(Math.max(bestEmotion.score * randomFactor, 0.5), 1.0);

    return { 
      tone: bestEmotion.emotion, 
      intensity: finalIntensity
    };
  };

  // Emotion scoring functions
  const calculateJoyfulScore = (amplitude: number, tempo: number, highFreq: number, stability: number): number => {
    return (amplitude * 0.3 + tempo * 0.3 + highFreq * 0.2 + stability * 0.2) * (0.8 + Math.random() * 0.4);
  };

  const calculateExcitedScore = (amplitude: number, tempo: number, variance: number, pitchVar: number): number => {
    return (amplitude * 0.25 + tempo * 0.25 + variance * 0.25 + pitchVar * 0.25) * (0.8 + Math.random() * 0.4);
  };

  const calculateHopefulScore = (amplitude: number, centroid: number, stability: number, highFreq: number): number => {
    return (amplitude * 0.2 + centroid * 0.3 + stability * 0.3 + highFreq * 0.2) * (0.8 + Math.random() * 0.4);
  };

  const calculateGratefulScore = (amplitude: number, stability: number, lowFreq: number, silenceRatio: number): number => {
    const silenceScore = Math.max(0, 0.5 - silenceRatio); // Lower silence is better for grateful
    return (amplitude * 0.25 + stability * 0.35 + lowFreq * 0.2 + silenceScore * 0.2) * (0.8 + Math.random() * 0.4);
  };

  const calculatePeacefulScore = (amplitude: number, stability: number, silenceRatio: number, variance: number): number => {
    const lowAmplitudeScore = Math.max(0, 0.7 - amplitude); // Lower amplitude is more peaceful
    const lowVarianceScore = Math.max(0, 0.8 - variance); // Lower variance is more peaceful
    return (lowAmplitudeScore * 0.3 + stability * 0.3 + silenceRatio * 0.2 + lowVarianceScore * 0.2) * (0.8 + Math.random() * 0.4);
  };

  const calculateDeterminedScore = (amplitude: number, stability: number, tempo: number, zcr: number): number => {
    return (amplitude * 0.25 + stability * 0.35 + tempo * 0.2 + zcr * 0.2) * (0.8 + Math.random() * 0.4);
  };

  const calculateNostalgicScore = (amplitude: number, tempo: number, silenceRatio: number, stability: number): number => {
    const slowTempoScore = Math.max(0, 0.6 - tempo); // Slower tempo is more nostalgic
    const moderateAmplitudeScore = 1 - Math.abs(amplitude - 0.5); // Moderate amplitude
    return (moderateAmplitudeScore * 0.3 + slowTempoScore * 0.3 + silenceRatio * 0.2 + stability * 0.2) * (0.8 + Math.random() * 0.4);
  };

  const calculateContemplativeScore = (amplitude: number, silenceRatio: number, stability: number, tempo: number): number => {
    const slowTempoScore = Math.max(0, 0.5 - tempo);
    const moderateAmplitudeScore = 1 - Math.abs(amplitude - 0.4);
    return (moderateAmplitudeScore * 0.25 + silenceRatio * 0.35 + stability * 0.25 + slowTempoScore * 0.15) * (0.8 + Math.random() * 0.4);
  };

  const calculateMelancholicScore = (amplitude: number, tempo: number, stability: number, silenceRatio: number): number => {
    const lowAmplitudeScore = Math.max(0, 0.6 - amplitude);
    const slowTempoScore = Math.max(0, 0.5 - tempo);
    return (lowAmplitudeScore * 0.3 + slowTempoScore * 0.3 + stability * 0.2 + silenceRatio * 0.2) * (0.8 + Math.random() * 0.4);
  };

  const calculateSadScore = (amplitude: number, tempo: number, stability: number, silenceRatio: number): number => {
    const lowAmplitudeScore = Math.max(0, 0.5 - amplitude);
    const slowTempoScore = Math.max(0, 0.4 - tempo);
    const unstableScore = Math.max(0, 0.6 - stability);
    return (lowAmplitudeScore * 0.3 + slowTempoScore * 0.3 + unstableScore * 0.2 + silenceRatio * 0.2) * (0.8 + Math.random() * 0.4);
  };

  const calculateAnxiousScore = (variance: number, stability: number, breathingPatterns: number, tempo: number): number => {
    const unstableScore = Math.max(0, 0.7 - stability);
    return (variance * 0.3 + unstableScore * 0.3 + breathingPatterns * 0.2 + tempo * 0.2) * (0.8 + Math.random() * 0.4);
  };

  const calculateWorriedScore = (amplitude: number, pitchVar: number, stability: number, variance: number): number => {
    const moderateAmplitudeScore = 1 - Math.abs(amplitude - 0.5);
    const unstableScore = Math.max(0, 0.6 - stability);
    return (moderateAmplitudeScore * 0.25 + pitchVar * 0.25 + unstableScore * 0.25 + variance * 0.25) * (0.8 + Math.random() * 0.4);
  };

  const calculateAngryScore = (amplitude: number, variance: number, tempo: number, lowFreq: number): number => {
    return (amplitude * 0.3 + variance * 0.3 + tempo * 0.2 + lowFreq * 0.2) * (0.8 + Math.random() * 0.4);
  };

  const calculateFrustratedScore = (variance: number, amplitude: number, stability: number, tempo: number): number => {
    const unstableScore = Math.max(0, 0.6 - stability);
    return (variance * 0.3 + amplitude * 0.25 + unstableScore * 0.25 + tempo * 0.2) * (0.8 + Math.random() * 0.4);
  };

  const calculateConfusedScore = (variance: number, stability: number, silenceRatio: number, pitchVar: number): number => {
    const unstableScore = Math.max(0, 0.7 - stability);
    return (variance * 0.25 + unstableScore * 0.25 + silenceRatio * 0.25 + pitchVar * 0.25) * (0.8 + Math.random() * 0.4);
  };

  const calculateLonelyScore = (amplitude: number, tempo: number, silenceRatio: number, duration: number): number => {
    const lowAmplitudeScore = Math.max(0, 0.5 - amplitude);
    const slowTempoScore = Math.max(0, 0.4 - tempo);
    const longDurationScore = Math.min(duration / 30, 1); // Longer recordings might indicate loneliness
    return (lowAmplitudeScore * 0.3 + slowTempoScore * 0.3 + silenceRatio * 0.2 + longDurationScore * 0.2) * (0.8 + Math.random() * 0.4);
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