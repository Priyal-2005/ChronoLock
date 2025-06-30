import React, { createContext, useContext, useState, useEffect } from 'react';
import { PeraWalletConnect } from '@perawallet/connect';

interface WalletContextType {
  accounts: string[];
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  peraWallet: PeraWalletConnect | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<string[]>([]);
  const [peraWallet, setPeraWallet] = useState<PeraWalletConnect | null>(null);

  useEffect(() => {
    const wallet = new PeraWalletConnect();
    setPeraWallet(wallet);

    // Reconnect session if exists
    wallet.reconnectSession().then((accounts) => {
      if (accounts.length) {
        setAccounts(accounts);
      }
    }).catch(console.error);

    return () => {
      wallet.disconnect();
    };
  }, []);

  const connect = async () => {
    if (!peraWallet) return;
    
    try {
      const newAccounts = await peraWallet.connect();
      setAccounts(newAccounts);
    } catch (error) {
      // Check if the error is due to user closing the modal
      if (error instanceof Error && error.message === 'Connect is cancelled by user') {
        // This is a user-initiated cancellation, not an actual error
        console.log('Wallet connection cancelled by user');
        return;
      }
      
      // Check if the error is due to Pera Wallet not being available
      if (error instanceof Error && error.message.includes("Couldn't open Pera Wallet")) {
        console.error('Pera Wallet is not available. Please ensure the Pera Wallet application is installed on your device or use the Pera Wallet browser extension.');
        return;
      }
      
      // Log actual connection errors
      console.error('Failed to connect wallet:', error);
    }
  };

  const disconnect = async () => {
    if (!peraWallet) return;
    
    try {
      await peraWallet.disconnect();
      setAccounts([]);
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  return (
    <WalletContext.Provider 
      value={{
        accounts,
        isConnected: accounts.length > 0,
        connect,
        disconnect,
        peraWallet
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};