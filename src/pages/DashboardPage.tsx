import React, { useState, useEffect } from 'react';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { Clock, Lock, Unlock, Play, Calendar, Heart, Star, Moon } from 'lucide-react';
import { formatDistanceToNow, isAfter } from 'date-fns';
import { useWallet } from '../contexts/WalletContext';
import { useMemory } from '../contexts/MemoryContext';

const DashboardPage: React.FC = () => {
  const { isConnected } = useWallet();
  const { memories } = useMemory();
  const location = useLocation();
  const [filter, setFilter] = useState<'all' | 'locked' | 'unlocked'>('all');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isConnected) {
    return <Navigate to="/" replace />;
  }

  // Show success message if navigated from record page
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message after 5 seconds
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const filteredMemories = memories.filter(memory => {
    if (filter === 'locked') return memory.isLocked;
    if (filter === 'unlocked') return !memory.isLocked;
    return true;
  });

  const getEmotionColor = (tone: string) => {
    const colors: Record<string, string> = {
      // Positive emotions
      'Hopeful': 'from-aurora-500/60 to-aurora-600/60',
      'Joyful': 'from-gold-400/60 to-gold-500/60',
      'Excited': 'from-cosmos-500/60 to-cosmos-600/60',
      'Grateful': 'from-gold-500/60 to-gold-600/60',
      'Peaceful': 'from-aurora-400/60 to-aurora-500/60',
      'Determined': 'from-nebula-500/60 to-nebula-600/60',
      
      // Contemplative emotions
      'Nostalgic': 'from-nebula-500/60 to-nebula-600/60',
      'Contemplative': 'from-starlight-500/60 to-starlight-600/60',
      'Melancholic': 'from-void-500/60 to-void-600/60',
      
      // Challenging emotions
      'Sad': 'from-midnight-500/60 to-midnight-600/60',
      'Anxious': 'from-cosmos-600/60 to-cosmos-700/60',
      'Worried': 'from-nebula-600/60 to-nebula-700/60',
      'Angry': 'from-red-500/60 to-red-600/60',
      'Frustrated': 'from-orange-500/60 to-orange-600/60',
      'Confused': 'from-purple-500/60 to-purple-600/60',
      'Lonely': 'from-blue-500/60 to-blue-600/60',
      
      // Neutral
      'Neutral': 'from-starlight-400/60 to-starlight-500/60'
    };
    return colors[tone] || 'from-starlight-400/60 to-starlight-500/60';
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getEmotionWhisper = (tone: string) => {
    const whispers: Record<string, string> = {
      // Positive emotions
      'Hopeful': 'Dreams painted in tomorrow\'s light',
      'Joyful': 'Laughter echoing through time',
      'Excited': 'Energy dancing with the cosmos',
      'Grateful': 'Thankfulness blooming like dawn',
      'Peaceful': 'Serenity flowing like starlight',
      'Determined': 'Will forged in stellar fire',
      
      // Contemplative emotions
      'Nostalgic': 'Memories wrapped in golden mist',
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
    return whispers[tone] || 'Emotions flowing like stardust';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 animate-slide-up">
          <div className="glass-soft p-6 border border-aurora-500/30 rounded-2xl">
            <div className="flex items-center space-x-3">
              <Star className="h-6 w-6 text-aurora-400" />
              <p className="text-starlight-200 font-serif">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-20">
        <h1 className="text-5xl md:text-6xl font-display font-light text-starlight-100 mb-6 text-glow-soft">
          Your Celestial Archive
        </h1>
        <p className="text-xl text-starlight-400 max-w-3xl mx-auto font-serif italic poetry-spacing">
          Messages from your past self, waiting patiently in time's embrace to be discovered anew.
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="glass-soft p-8 text-center group hover:shadow-ethereal transition-all duration-500">
          <div className="flex items-center justify-center mb-4">
            <Heart className="h-12 w-12 text-nebula-400 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <p className="text-4xl font-display font-light text-starlight-100 mb-2">{memories.length}</p>
          <p className="text-starlight-300 font-serif">Sacred Memories</p>
          <p className="text-whisper mt-2">Whispers across time</p>
        </div>
        <div className="glass-soft p-8 text-center group hover:shadow-ethereal transition-all duration-500">
          <div className="flex items-center justify-center mb-4">
            <Lock className="h-12 w-12 text-cosmos-400 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <p className="text-4xl font-display font-light text-starlight-100 mb-2">
            {memories.filter(m => m.isLocked).length}
          </p>
          <p className="text-starlight-300 font-serif">Time-Locked</p>
          <p className="text-whisper mt-2">Awaiting their moment</p>
        </div>
        <div className="glass-soft p-8 text-center group hover:shadow-ethereal transition-all duration-500">
          <div className="flex items-center justify-center mb-4">
            <Star className="h-12 w-12 text-aurora-400 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <p className="text-4xl font-display font-light text-starlight-100 mb-2">
            {memories.filter(m => !m.isLocked).length}
          </p>
          <p className="text-starlight-300 font-serif">Ready to Listen</p>
          <p className="text-whisper mt-2">Calling to your heart</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex justify-center mb-16">
        <div className="glass-soft rounded-2xl p-2 max-w-md">
          {[
            { key: 'all', label: 'All Memories', whisper: 'Every whisper preserved' },
            { key: 'locked', label: 'Time-Locked', whisper: 'Sleeping until their time' },
            { key: 'unlocked', label: 'Ready to Listen', whisper: 'Calling to be heard' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`relative group px-6 py-3 text-sm font-serif rounded-xl transition-all duration-300 ${
                filter === tab.key
                  ? 'bg-white/[0.12] text-starlight-100 shadow-ethereal'
                  : 'text-starlight-300 hover:text-starlight-100 hover:bg-white/[0.06]'
              }`}
            >
              {tab.label}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <span className="text-whisper text-xs whitespace-nowrap">
                  {tab.whisper}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Memories Grid */}
      {filteredMemories.length === 0 ? (
        <div className="text-center py-20">
          <div className="glass-soft p-16 max-w-2xl mx-auto">
            <Moon className="h-20 w-20 text-starlight-400 mx-auto mb-8 animate-pulse-gentle" />
            <h3 className="text-3xl font-display font-light text-starlight-100 mb-6">
              {filter === 'all' ? 'The Archive Awaits' : `No ${filter} memories yet`}
            </h3>
            <p className="text-starlight-300 mb-8 font-serif poetry-spacing">
              {filter === 'all' 
                ? 'Your first whisper to tomorrow awaits. Begin the sacred ritual of preserving your voice across time.'
                : `The cosmos holds no ${filter} memories for you at this moment. Perhaps it\'s time to create new ones.`
              }
            </p>
            <Link
              to="/record"
              className="button-primary inline-flex items-center space-x-3 px-8 py-4 font-serif font-medium transition-all duration-500"
            >
              <span>Begin Your First Whisper</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMemories.map((memory) => (
            <div
              key={memory.id}
              className="glass-soft p-8 hover:shadow-ethereal transition-all duration-500 hover:scale-[1.02] group"
            >
              {/* Status Badge */}
              <div className="flex items-center justify-between mb-6">
                <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-serif ${
                  memory.isLocked 
                    ? 'bg-cosmos-500/20 text-cosmos-300 border border-cosmos-500/30' 
                    : 'bg-aurora-500/20 text-aurora-300 border border-aurora-500/30'
                }`}>
                  {memory.isLocked ? <Lock className="h-3 w-3" /> : <Star className="h-3 w-3" />}
                  <span>{memory.isLocked ? 'Locked in time' : 'Ready to hear'}</span>
                </div>
                <span className="text-xs text-starlight-400 font-mono">
                  {formatDuration(memory.duration)}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-xl font-display font-medium text-starlight-100 mb-4 line-clamp-2 group-hover:text-glow-soft transition-all duration-300">
                {memory.title}
              </h3>

              {/* Note */}
              {memory.note && (
                <p className="text-starlight-300 mb-6 line-clamp-3 font-serif poetry-spacing">
                  {memory.note}
                </p>
              )}

              {/* Emotion */}
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${getEmotionColor(memory.emotion.tone)}`} />
                  <span className="text-sm font-serif text-starlight-200">
                    {memory.emotion.tone}
                  </span>
                </div>
                <div className="w-full h-1 bg-white/[0.1] rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${getEmotionColor(memory.emotion.tone)} transition-all duration-500`}
                    style={{ width: `${memory.emotion.intensity * 100}%` }}
                  />
                </div>
                <p className="text-whisper mt-2 text-xs">
                  {getEmotionWhisper(memory.emotion.tone)}
                </p>
              </div>

              {/* Dates */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center text-xs text-starlight-400">
                  <Calendar className="h-3 w-3 mr-2" />
                  <span className="font-serif">Created {formatDistanceToNow(memory.createdDate)} ago</span>
                </div>
                <div className="flex items-center text-xs text-starlight-400">
                  <Clock className="h-3 w-3 mr-2" />
                  <span className="font-serif">
                    {memory.isLocked 
                      ? `Unlocks in ${formatDistanceToNow(memory.unlockDate)}`
                      : `Unlocked ${formatDistanceToNow(memory.unlockDate)} ago`
                    }
                  </span>
                </div>
              </div>

              {/* Action Button */}
              {memory.isLocked ? (
                <div className="w-full py-4 text-center text-sm text-starlight-400 bg-white/[0.02] rounded-xl border border-white/[0.06] font-serif">
                  Locked until {memory.unlockDate.toLocaleDateString()}
                  <p className="text-whisper text-xs mt-1">Patience, dear soul</p>
                </div>
              ) : (
                <Link
                  to={`/playback/${memory.id}`}
                  className="w-full button-primary flex items-center justify-center space-x-3 py-4 font-serif font-medium transition-all duration-500 group"
                >
                  <Play className="h-4 w-4" />
                  <span>Listen to Your Past</span>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart className="h-4 w-4" />
                  </div>
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;