import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletContext';
import { AudioProvider } from './contexts/AudioContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import RecordPage from './pages/RecordPage';
import DashboardPage from './pages/DashboardPage';
import PlaybackPage from './pages/PlaybackPage';

function App() {
  return (
    <WalletProvider>
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
    </WalletProvider>
  );
}

export default App;