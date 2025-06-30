import React, { useState, useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { Play, Pause, ArrowLeft, Heart, Calendar, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useWallet } from '../contexts/WalletContext';
import EmotionVisualizer from '../components/EmotionVisualizer';

interface VoiceMemory {
  id: string;
  title: string;
  note?: string;
  unlockDate: Date;
  createdDate: Date;
  emotion: {
    tone: string;
    intensity: number;
  };
  duration: number;
  audioUrl: string;
}

const PlaybackPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isConnected } = useWallet();
  
  const [memory, setMemory] = useState<VoiceMemory | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  if (!isConnected) {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockMemory: VoiceMemory = {
      id: id || '2',
      title: 'Wedding Day Wishes',
      note: 'For our 5th anniversary - recorded with so much love and hope for our future together.',
      unlockDate: new Date('2024-06-15'),
      createdDate: new Date('2023-06-15'),
      emotion: { tone: 'Joyful', intensity: 0.92 },
      duration: 180,
      audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' // Mock audio URL
    };

    setMemory(mockMemory);

    // Create audio element
    const audio = new Audio(mockMemory.audioUrl);
    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });
    setAudioElement(audio);

    return () => {
      if (audio) {
        audio.pause();
        audio.removeEventListener('timeupdate', () => {});
        audio.removeEventListener('ended', () => {});
      }
    };
  }, [id]);

  const togglePlayback = () => {
    if (!audioElement) return;

    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play();
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

  if (!memory) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
        <p className="text-stone-600">Loading your memory...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back Button */}
      <Link
        to="/dashboard"
        className="inline-flex items-center space-x-2 text-stone-600 hover:text-teal-600 mb-8 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Memories</span>
      </Link>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Memory Details */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-stone-200">
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${getEmotionColor(memory.emotion.tone)}`} />
              <span className="text-sm font-medium text-stone-600">
                Recorded with {memory.emotion.tone.toLowerCase()} emotion
              </span>
            </div>
            <h1 className="text-3xl font-bold text-stone-800 mb-3">
              {memory.title}
            </h1>
            {memory.note && (
              <p className="text-stone-600 leading-relaxed">
                {memory.note}
              </p>
            )}
          </div>

          {/* Memory Info */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center text-stone-600">
              <Calendar className="h-5 w-5 mr-3 text-teal-600" />
              <div>
                <p className="font-medium">Created</p>
                <p className="text-sm">
                  {memory.createdDate.toLocaleDateString()} 
                  ({formatDistanceToNow(memory.createdDate)} ago)
                </p>
              </div>
            </div>
            <div className="flex items-center text-stone-600">
              <Clock className="h-5 w-5 mr-3 text-teal-600" />
              <div>
                <p className="font-medium">Unlocked</p>
                <p className="text-sm">
                  {memory.unlockDate.toLocaleDateString()} 
                  ({formatDistanceToNow(memory.unlockDate)} ago)
                </p>
              </div>
            </div>
            <div className="flex items-center text-stone-600">
              <Heart className="h-5 w-5 mr-3 text-pink-500" />
              <div>
                <p className="font-medium">Emotional Tone</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm font-semibold">{memory.emotion.tone}</span>
                  <div className="w-20 h-2 bg-stone-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${getEmotionColor(memory.emotion.tone)} transition-all duration-500`}
                      style={{ width: `${memory.emotion.intensity * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-stone-500">
                    {Math.round(memory.emotion.intensity * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="bg-gradient-to-r from-teal-50 to-amber-50 rounded-xl p-6 border border-teal-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-stone-700">
                {formatTime(currentTime)} / {formatTime(memory.duration)}
              </span>
              <button
                onClick={togglePlayback}
                className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-full hover:from-teal-700 hover:to-teal-800 transition-all transform hover:scale-105"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
              </button>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-teal-600 to-amber-600 transition-all duration-100"
                style={{ width: `${(currentTime / memory.duration) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Emotion Visualizer */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-stone-200">
          <h2 className="text-2xl font-semibold text-stone-800 mb-6">
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