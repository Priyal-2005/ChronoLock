import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Heart, Shield, Sparkles, Star, Moon, Zap, Archive, Mic } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';

const HomePage: React.FC = () => {
  const { isConnected } = useWallet();

  const features = [
    {
      icon: Heart,
      title: 'Emotional Resonance',
      description: 'Each whisper carries the weight of feeling, analyzed and preserved with tender care',
      whisper: 'Your heart speaks in frequencies only time can decode'
    },
    {
      icon: Shield,
      title: 'Sacred Privacy',
      description: 'Encrypted in starlight, your secrets rest in cosmic silence until their moment arrives',
      whisper: 'What is meant for tomorrow sleeps safely in today'
    },
    {
      icon: Clock,
      title: 'Temporal Guardians',
      description: 'Smart contracts become sentinels of time, holding your words until the stars align',
      whisper: 'Time itself becomes your trusted keeper'
    },
    {
      icon: Sparkles,
      title: 'Ethereal Playback',
      description: 'When unlocked, your memories bloom with visual poetry and emotional landscapes',
      whisper: 'Memory becomes art, feeling becomes light'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
      {/* Floating cosmic elements */}
      <div className="absolute top-32 left-16 w-40 h-40 bg-cosmos-500/[0.08] rounded-full blur-3xl animate-float" />
      <div className="absolute top-64 right-24 w-32 h-32 bg-nebula-500/[0.06] rounded-full blur-2xl animate-float" style={{ animationDelay: '3s' }} />
      <div className="absolute bottom-48 left-1/3 w-24 h-24 bg-aurora-500/[0.05] rounded-full blur-xl animate-float" style={{ animationDelay: '6s' }} />

      {/* Hero Section */}
      <div className="text-center max-w-6xl mx-auto mb-32 relative">
        <div className="mb-16 animate-fade-in">
          <div className="inline-flex items-center justify-center w-28 h-28 glass-soft rounded-full mb-12 animate-shimmer">
            <Clock className="h-14 w-14 text-starlight-200" />
            <Star className="h-5 w-5 text-gold-400 absolute top-3 right-3 animate-twinkle" />
          </div>
          
          <h1 className="text-6xl md:text-8xl font-display font-light mb-12 leading-tight poetry-spacing">
            <span className="block text-starlight-100 text-glow-soft">Preserve Your Voice</span>
            <span className="block text-cosmic mt-4">
              Across the Cosmos
            </span>
          </h1>
          
          <div className="max-w-4xl mx-auto mb-16">
            <p className="text-2xl md:text-3xl text-starlight-300 mb-8 font-serif font-light poetry-spacing">
              Record encrypted voice messages for your future self or beloved souls.
            </p>
            <p className="text-xl text-starlight-400 font-serif italic poetry-spacing">
              Unlock them when the moment is perfect, when time itself whispers: <em>"Now."</em>
            </p>
          </div>
        </div>

        {isConnected ? (
          <div className="flex flex-col sm:flex-row gap-8 justify-center animate-slide-up">
            <Link
              to="/record"
              className="group relative overflow-hidden button-primary px-12 py-6 font-display font-medium text-xl transition-all duration-500"
            >
              <div className="relative flex items-center justify-center space-x-3">
                <Mic className="h-6 w-6" />
                <span>Begin Your Whisper</span>
                <Zap className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-whisper text-sm">Speak to tomorrow's heart</span>
              </div>
            </Link>
            <Link
              to="/dashboard"
              className="button-ethereal px-12 py-6 font-display font-medium text-xl text-starlight-200 hover:text-starlight-100 transition-all duration-500 group"
            >
              <div className="flex items-center justify-center space-x-3">
                <Archive className="h-6 w-6" />
                <span>Visit Your Memories</span>
              </div>
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-whisper text-sm">Echoes from yesterday</span>
              </div>
            </Link>
          </div>
        ) : (
          <div className="glass-soft p-12 max-w-lg mx-auto animate-slide-up">
            <div className="flex items-center justify-center mb-6">
              <Moon className="h-12 w-12 text-gold-400 animate-pulse-gentle" />
            </div>
            <h3 className="text-2xl font-display font-medium text-starlight-200 mb-4">
              Connect Your Constellation
            </h3>
            <p className="text-starlight-400 font-serif poetry-spacing">
              Your Pera Wallet becomes the key to unlock memories scattered across time's vast expanse.
            </p>
          </div>
        )}
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 gap-12 mb-32">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={index}
              className="glass-soft p-12 hover:shadow-ethereal transition-all duration-700 hover:scale-[1.02] group animate-fade-in"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="flex items-start space-x-6">
                <div className="w-16 h-16 glass-soft rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 flex-shrink-0">
                  <Icon className="h-8 w-8 text-starlight-200" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-display font-medium text-starlight-100 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-starlight-300 leading-relaxed mb-4 font-serif poetry-spacing">
                    {feature.description}
                  </p>
                  <p className="text-whisper">
                    {feature.whisper}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* How It Works */}
      <div className="glass-ethereal p-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cosmos-950/10 via-transparent to-nebula-950/10 animate-breathe" />
        <div className="relative">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-display font-light text-starlight-100 mb-6 text-glow-soft">
              The Sacred Ritual
            </h2>
            <p className="text-xl text-starlight-400 font-serif italic max-w-3xl mx-auto poetry-spacing">
              Three movements in time's eternal dance, each step a prayer to tomorrow's listening ear
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-16">
            {[
              {
                step: 'I',
                title: 'Whisper & Weave',
                description: 'Your voice becomes encrypted starlight, while AI divines the emotional essence hidden within each syllable.',
                whisper: 'Every word a constellation, every pause a prayer',
                gradient: 'from-cosmos-600/20 to-cosmos-800/20',
                icon: Mic
              },
              {
                step: 'II',
                title: 'Lock in Time',
                description: 'Choose your sacred moment, and let Algorand\'s eternal contracts guard your secret until the stars decree its release.',
                whisper: 'Time becomes your faithful guardian',
                gradient: 'from-aurora-600/20 to-aurora-800/20',
                icon: Clock
              },
              {
                step: 'III',
                title: 'Unlock & Remember',
                description: 'When destiny arrives, your memory blooms into being—voice, emotion, and visual poetry united in perfect harmony.',
                whisper: 'Memory transforms into living art',
                gradient: 'from-nebula-600/20 to-nebula-800/20',
                icon: Heart
              }
            ].map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="text-center group">
                  <div className={`w-24 h-24 bg-gradient-to-br ${step.gradient} glass-soft rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-500 shadow-ethereal`}>
                    <span className="text-4xl font-display font-light text-starlight-100">{step.step}</span>
                  </div>
                  <div className="mb-6">
                    <Icon className="h-10 w-10 text-starlight-300 mx-auto mb-4" />
                  </div>
                  <h3 className="text-2xl font-display font-medium text-starlight-100 mb-6">
                    {step.title}
                  </h3>
                  <p className="text-starlight-300 leading-relaxed mb-4 font-serif poetry-spacing">
                    {step.description}
                  </p>
                  <p className="text-whisper">
                    {step.whisper}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;