import React, { useState, useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { Play, Pause, ArrowLeft, Heart, Calendar, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useWallet } from '../contexts/WalletContext';
import { useMemory } from '../contexts/MemoryContext';
import EmotionVisualizer from '../components/EmotionVisualizer';

const PlaybackPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isConnected } = useWallet();
  const { getMemory } = useMemory();
  
  const [memory, setMemory] = useState(getMemory(id || ''));
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  if (!isConnected) {
    return <Navigate to="/" replace />;
  }

  if (!memory) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="glass-soft p-16">
          <h2 className="text-2xl font-display text-starlight-100 mb-4">Memory Not Found</h2>
          <p className="text-starlight-400 font-serif mb-8">
            This whisper has been lost to the cosmic winds.
          </p>
          <Link
            to="/dashboard"
            className="button-primary inline-flex items-center space-x-2 px-6 py-3"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Archive</span>
          </Link>
        </div>
      </div>
    );
  }

  if (memory.isLocked) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="glass-soft p-16">
          <Clock className="h-16 w-16 text-cosmos-400 mx-auto mb-6" />
          <h2 className="text-3xl font-display text-starlight-100 mb-4">Still Locked in Time</h2>
          <p className="text-starlight-400 font-serif mb-8 poetry-spacing">
            This memory awaits its destined moment. Return when the stars align on{' '}
            <em>{memory.unlockDate.toLocaleDateString()}</em>.
          </p>
          <Link
            to="/dashboard"
            className="button-primary inline-flex items-center space-x-2 px-6 py-3"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Archive</span>
          </Link>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (!memory.audioUrl) return;

    // Create audio element
    const audio = new Audio(memory.audioUrl);
    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });
    audio.addEventListener('loadedmetadata', () => {
      // Audio is ready to play
    });
    setAudioElement(audio);

    return () => {
      if (audio) {
        audio.pause();
        audio.removeEventListener('timeupdate', () => {});
        audio.removeEventListener('ended', () => {});
        audio.removeEventListener('loadedmetadata', () => {});
      }
    };
  }, [memory.audioUrl]);

  const togglePlayback = () => {
    if (!audioElement) return;

    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play().catch(error => {
        console.error('Playback failed:', error);
        alert('Unable to play audio. The memory may be corrupted.');
      });
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getEmotionColor = (tone: string) => {
    const colors: Record<string, string> = {
      'Hopeful': 'from-blue-500 to-teal-500',
      'Joyful': 'from-yellow-400 to-orange-500',
      'Nostalgic': 'from-purple-500 to-pink-500',
      'Peaceful': 'from-green-400 to-teal-500',
      'Excited': 'from-red-500 to-pink-500',
      'Grateful': 'from-amber-500 to-orange-500'
    };
    return colors[tone] || 'from-gray-400 to-gray-500';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Back Button */}
      <Link
        to="/dashboard"
        className="inline-flex items-center space-x-2 text-starlight-400 hover:text-starlight-200 mb-12 transition-colors font-serif"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Return to Your Archive</span>
      </Link>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Memory Details */}
        <div className="glass-soft p-12">
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${getEmotionColor(memory.emotion.tone)}`} />
              <span className="text-sm font-serif text-starlight-300">
                Recorded with {memory.emotion.tone.toLowerCase()} emotion
              </span>
            </div>
            <h1 className="text-4xl font-display font-light text-starlight-100 mb-6 text-glow-soft">
              {memory.title}
            </h1>
            {memory.note && (
              <p className="text-starlight-300 leading-relaxed font-serif poetry-spacing">
                {memory.note}
              </p>
            )}
          </div>

          {/* Memory Info */}
          <div className="space-y-6 mb-12">
            <div className="flex items-center text-starlight-300">
              <Calendar className="h-5 w-5 mr-4 text-aurora-400" />
              <div>
                <p className="font-serif font-medium">Created</p>
                <p className="text-sm text-starlight-400">
                  {memory.createdDate.toLocaleDateString()} 
                  ({formatDistanceToNow(memory.createdDate)} ago)
                </p>
              </div>
            </div>
            <div className="flex items-center text-starlight-300">
              <Clock className="h-5 w-5 mr-4 text-aurora-400" />
              <div>
                <p className="font-serif font-medium">Unlocked</p>
                <p className="text-sm text-starlight-400">
                  {memory.unlockDate.toLocaleDateString()} 
                  ({formatDistanceToNow(memory.unlockDate)} ago)
                </p>
              </div>
            </div>
            <div className="flex items-center text-starlight-300">
              <Heart className="h-5 w-5 mr-4 text-nebula-400" />
              <div>
                <p className="font-serif font-medium">Emotional Tone</p>
                <div className="flex items-center space-x-3 mt-2">
                  <span className="text-sm font-serif font-semibold">{memory.emotion.tone}</span>
                  <div className="w-24 h-2 bg-white/[0.1] rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${getEmotionColor(memory.emotion.tone)} transition-all duration-500`}
                      style={{ width: `${memory.emotion.intensity * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-starlight-400">
                    {Math.round(memory.emotion.intensity * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="glass-soft p-8 border border-cosmos-500/30">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-serif text-starlight-200">
                {formatTime(currentTime)} / {formatTime(memory.duration)}
              </span>
              <button
                onClick={togglePlayback}
                className="flex items-center justify-center w-16 h-16 button-primary rounded-full transition-all transform hover:scale-105"
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
              </button>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-2 bg-white/[0.1] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cosmos-500 to-aurora-500 transition-all duration-100"
                style={{ width: `${(currentTime / memory.duration) * 100}%` }}
              />
            </div>
            
            <p className="text-whisper text-center mt-4">
              {isPlaying ? 'Your past self speaks...' : 'Ready to listen to your whisper'}
            </p>
          </div>
        </div>

        {/* Emotion Visualizer */}
        <div className="glass-soft p-12">
          <h2 className="text-3xl font-display font-light text-starlight-100 mb-8">
            Emotional Journey
          </h2>
          <EmotionVisualizer 
            emotion={memory.emotion}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={memory.duration}
          />
        </div>
      </div>
    </div>
  );
};

export default PlaybackPage;