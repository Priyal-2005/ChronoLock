import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletContext';
import { AudioProvider } from './contexts/AudioContext';
import { MemoryProvider } from './contexts/MemoryContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import RecordPage from './pages/RecordPage';
import DashboardPage from './pages/DashboardPage';
import PlaybackPage from './pages/PlaybackPage';

function App() {
  return (
    <WalletProvider>
      <MemoryProvider>
        <AudioProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/record" element={<RecordPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/playback/:id" element={<PlaybackPage />} />
              </Routes>
            </Layout>
          </Router>
        </AudioProvider>
      </MemoryProvider>
    </WalletProvider>
  );
}

export default App;