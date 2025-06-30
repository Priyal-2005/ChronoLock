import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Clock, Home, Mic, Archive, Wallet, Star } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import StarField from './StarField';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { isConnected, accounts, connect, disconnect } = useWallet();

  const navigation = [
    { name: 'Home', href: '/', icon: Home, whisper: 'Return to the beginning' },
    { name: 'Record', href: '/record', icon: Mic, whisper: 'Speak to tomorrow' },
    { name: 'Memories', href: '/dashboard', icon: Archive, whisper: 'Echoes from yesterday' },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <StarField />
      
      {/* Subtle cosmic ambiance */}
      <div className="fixed inset-0 bg-gradient-to-br from-cosmos-950/20 via-transparent to-nebula-950/10 pointer-events-none animate-breathe" />
      
      {/* Header */}
      <header className="relative z-10 glass-ethereal border-b border-white/[0.06] mx-6 mt-6 rounded-3xl">
        <div className="max-w-7xl mx-auto px-8 lg:px-12">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-4 group">
              <div className="relative">
                <Clock className="h-9 w-9 text-starlight-300 group-hover:text-starlight-200 transition-all duration-500" />
                <Star className="h-3 w-3 text-gold-400 absolute -top-1 -right-1 animate-twinkle" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-display font-medium text-cosmic tracking-wide">
                  ChronoLock
                </span>
                <span className="text-whisper -mt-1">
                  Whispers across time
                </span>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <div key={item.name} className="group relative">
                    <Link
                      to={item.href}
                      className={`flex items-center space-x-3 px-6 py-3 rounded-2xl text-sm font-medium transition-all duration-500 ${
                        isActive
                          ? 'button-ethereal bg-white/[0.12] text-starlight-100 shadow-ethereal'
                          : 'text-starlight-300 hover:text-starlight-100 hover:bg-white/[0.06]'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="font-serif">{item.name}</span>
                    </Link>
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <span className="text-whisper text-xs whitespace-nowrap">
                        {item.whisper}
                      </span>
                    </div>
                  </div>
                );
              })}
            </nav>

            {/* Wallet Connection */}
            <div className="flex items-center space-x-4">
              {isConnected ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3 glass-soft px-5 py-3 rounded-2xl">
                    <div className="w-2 h-2 bg-aurora-400 rounded-full animate-pulse-gentle shadow-starlight"></div>
                    <span className="text-sm font-mono text-starlight-200 tracking-wider">
                      {accounts[0].slice(0, 6)}...{accounts[0].slice(-4)}
                    </span>
                  </div>
                  <button
                    onClick={disconnect}
                    className="text-sm text-starlight-400 hover:text-starlight-200 transition-colors duration-300 font-serif italic"
                  >
                    Release
                  </button>
                </div>
              ) : (
                <button
                  onClick={connect}
                  className="button-primary flex items-center space-x-3 px-8 py-4 font-serif font-medium transition-all duration-500"
                >
                  <Wallet className="h-4 w-4" />
                  <span>Connect Wallet</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 px-6">
        {children}
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 z-20">
        <div className="glass-ethereal rounded-3xl p-3">
          <div className="flex justify-around items-center">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex flex-col items-center space-y-2 px-6 py-4 rounded-2xl transition-all duration-500 ${
                    isActive 
                      ? 'bg-white/[0.12] text-starlight-100 shadow-ethereal' 
                      : 'text-starlight-300 hover:text-starlight-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-serif">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Layout;