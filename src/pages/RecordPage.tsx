import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Mic, Square, Play, Trash2, Calendar, Lock, Upload, Star, Moon, Loader } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { useAudio } from '../contexts/AudioContext';
import { useMemory } from '../contexts/MemoryContext';
import WaveformVisualizer from '../components/WaveformVisualizer';
import DatePicker from '../components/DatePicker';
import EmotionAnalysis from '../components/EmotionAnalysis';

const RecordPage: React.FC = () => {
  const { isConnected } = useWallet();
  const { isRecording, audioBlob, audioUrl, duration, startRecording, stopRecording, clearRecording } = useAudio();
  const { addMemory, isLoading: isStorageLoading } = useMemory();
  const navigate = useNavigate();
  
  const [unlockDate, setUnlockDate] = useState<Date>(new Date(Date.now() + 24 * 60 * 60 * 1000)); // Tomorrow
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [emotion, setEmotion] = useState<{ tone: string; intensity: number } | null>(null);

  if (!isConnected) {
    return <Navigate to="/" replace />;
  }

  const handleUpload = async () => {
    if (!audioBlob || !title.trim() || !emotion) return;
    
    setIsUploading(true);
    try {
      // Store using AlgoNode IPFS + Algorand smart contracts
      const memoryId = await addMemory({
        title: title.trim(),
        note: message.trim() || undefined,
        unlockDate,
        emotion,
        duration,
        audioBlob
      });

      // Reset form
      setTitle('');
      setMessage('');
      clearRecording();
      setEmotion(null);
      
      // Navigate to dashboard with success message
      navigate('/dashboard', { 
        state: { 
          message: 'Your whisper has been locked in time\'s embrace and stored on IPFS!',
          newMemoryId: memoryId
        }
      });
      
    } catch (error) {
      console.error('Upload failed:', error);
      alert(`Failed to store your memory: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getEmotionWhisper = (tone: string) => {
    const whispers: Record<string, string> = {
      // Positive emotions
      'Hopeful': 'Your voice carries tomorrow\'s light',
      'Joyful': 'Laughter echoes through the stars',
      'Excited': 'Energy dancing with cosmos',
      'Grateful': 'Thankfulness blooming like dawn',
      'Peaceful': 'Serenity flows like starlight',
      'Determined': 'Will forged in stellar fire',
      
      // Contemplative emotions
      'Nostalgic': 'Memory wrapped in golden mist',
      'Contemplative': 'Thoughts drifting through cosmic silence',
      'Melancholic': 'Gentle sorrow like autumn rain',
      
      // Challenging emotions
      'Sad': 'Tears that water tomorrow\'s growth',
      'Anxious': 'Restless energy seeking peace',
      'Worried': 'Care wrapped in cosmic concern',
      'Angry': 'Fire that burns for justice',
      'Frustrated': 'Passion seeking its true path',
      'Confused': 'Questions dancing in starlight',
      'Lonely': 'Solitude seeking connection',
      
      // Neutral
      'Neutral': 'Calm presence in the cosmic flow'
    };
    return whispers[tone] || 'Your emotion flows like stardust';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-display font-light text-starlight-100 mb-6 text-glow-soft">
          Whisper to Tomorrow
        </h1>
        <p className="text-xl text-starlight-400 max-w-3xl mx-auto font-serif italic poetry-spacing">
          Record a message for your future self or beloved souls. 
          Your voice will be encrypted and stored on IPFS, locked by Algorand smart contracts until the perfect moment.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Recording Section */}
        <div className="glass-soft p-12">
          <h2 className="text-3xl font-display font-light text-starlight-100 mb-8 flex items-center">
            <Mic className="h-8 w-8 mr-4 text-cosmos-400" />
            Your Voice, Preserved
          </h2>

          {/* Waveform Visualizer */}
          <div className="mb-12">
            <WaveformVisualizer />
          </div>

          {/* Recording Controls */}
          <div className="flex justify-center space-x-6 mb-8">
            {!isRecording && !audioBlob && (
              <button
                onClick={startRecording}
                className="group button-primary px-10 py-6 font-serif font-medium text-lg transition-all duration-500"
              >
                <div className="flex items-center space-x-3">
                  <Mic className="h-6 w-6" />
                  <span>Begin Recording</span>
                </div>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-whisper text-sm">Speak from your heart</span>
                </div>
              </button>
            )}

            {isRecording && (
              <button
                onClick={stopRecording}
                className="button-ethereal px-10 py-6 font-serif font-medium text-lg transition-all duration-500 animate-pulse-gentle"
              >
                <div className="flex items-center space-x-3">
                  <Square className="h-6 w-6" />
                  <span>Complete Recording</span>
                </div>
              </button>
            )}

            {audioBlob && (
              <div className="flex flex-col items-center space-y-4">
                <div className="glass-soft p-4 rounded-2xl">
                  <audio controls src={audioUrl || undefined} className="rounded-xl" />
                  <p className="text-center text-starlight-300 mt-2 font-serif text-sm">
                    Duration: {formatDuration(duration)}
                  </p>
                </div>
                <button
                  onClick={clearRecording}
                  className="flex items-center space-x-2 text-starlight-400 hover:text-starlight-200 transition-colors font-serif"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Clear & Start Over</span>
                </button>
              </div>
            )}
          </div>

          {/* Emotion Analysis */}
          {audioBlob && !emotion && (
            <EmotionAnalysis audioBlob={audioBlob} onAnalysisComplete={setEmotion} />
          )}
        </div>

        {/* Configuration Section */}
        <div className="glass-soft p-12">
          <h2 className="text-3xl font-display font-light text-starlight-100 mb-8 flex items-center">
            <Lock className="h-8 w-8 mr-4 text-cosmos-400" />
            Sacred Details
          </h2>

          <div className="space-y-8">
            {/* Title */}
            <div>
              <label className="block text-lg font-serif text-starlight-200 mb-3">
                Memory Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Birthday wishes for my future self..."
                className="w-full px-6 py-4 rounded-2xl bg-white/[0.04] border border-white/[0.12] text-starlight-100 placeholder-starlight-500 focus:ring-2 focus:ring-cosmos-500/50 focus:border-transparent transition-all font-serif"
                required
              />
              <p className="text-whisper mt-2">Give your whisper a name to remember</p>
            </div>

            {/* Message */}
            <div>
              <label className="block text-lg font-serif text-starlight-200 mb-3">
                Accompanying Note
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add context, feelings, or hopes for when this message is unlocked..."
                rows={4}
                className="w-full px-6 py-4 rounded-2xl bg-white/[0.04] border border-white/[0.12] text-starlight-100 placeholder-starlight-500 focus:ring-2 focus:ring-cosmos-500/50 focus:border-transparent transition-all font-serif poetry-spacing"
              />
              <p className="text-whisper mt-2">Optional words to accompany your voice</p>
            </div>

            {/* Date Picker */}
            <div>
              <label className="block text-lg font-serif text-starlight-200 mb-3 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Unlock Date
              </label>
              <DatePicker value={unlockDate} onChange={setUnlockDate} />
            </div>

            {/* Emotion Display */}
            {emotion && (
              <div className="glass-soft p-6 border border-cosmos-500/30">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-serif text-starlight-200">Detected Emotion:</span>
                  <div className="flex items-center space-x-3">
                    <Star className="h-5 w-5 text-gold-400" />
                    <span className="text-cosmos-300 font-serif font-medium text-lg">{emotion.tone}</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-white/[0.1] rounded-full overflow-hidden mb-3">
                  <div 
                    className="h-full bg-gradient-to-r from-cosmos-500 to-nebula-500 transition-all duration-500"
                    style={{ width: `${emotion.intensity * 100}%` }}
                  />
                </div>
                <p className="text-whisper">
                  {getEmotionWhisper(emotion.tone)}
                </p>
              </div>
            )}

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={!audioBlob || !title.trim() || !emotion || isUploading || isStorageLoading}
              className="w-full button-primary px-8 py-6 font-serif font-medium text-lg transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group"
            >
              {isUploading || isStorageLoading ? (
                <div className="flex items-center justify-center space-x-3">
                  <Loader className="animate-spin h-6 w-6" />
                  <span>Storing on IPFS & Algorand...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-3">
                  <Upload className="h-6 w-6" />
                  <span>Lock in Time's Embrace</span>
                  <Moon className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              )}
              {!isUploading && !isStorageLoading && (
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-whisper text-sm">Store on IPFS via AlgoNode</span>
                </div>
              )}
            </button>

            {/* Requirements */}
            <div className="text-sm text-starlight-400 space-y-1">
              <p className="flex items-center">
                <span className={`w-2 h-2 rounded-full mr-2 ${audioBlob ? 'bg-aurora-400' : 'bg-starlight-600'}`} />
                Voice recording
              </p>
              <p className="flex items-center">
                <span className={`w-2 h-2 rounded-full mr-2 ${title.trim() ? 'bg-aurora-400' : 'bg-starlight-600'}`} />
                Memory title
              </p>
              <p className="flex items-center">
                <span className={`w-2 h-2 rounded-full mr-2 ${emotion ? 'bg-aurora-400' : 'bg-starlight-600'}`} />
                Emotion analysis
              </p>
            </div>

            {/* Storage Info */}
            <div className="glass-soft p-4 border border-aurora-500/20">
              <h4 className="text-sm font-serif text-starlight-200 mb-2">Storage Details</h4>
              <div className="text-xs text-starlight-400 space-y-1">
                <p>• Audio encrypted with AES-256-GCM</p>
                <p>• Stored on IPFS via AlgoNode</p>
                <p>• Time-locked by Algorand smart contract</p>
                <p>• Decentralized and permanent</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordPage;