import { Navigation } from './components/navigation';
import { MobileNavigation } from './components/mobile-navigation';
import { Hero } from './components/hero';
import { BountyShowcase } from './components/bounty-showcase';
import { MyBountiesDashboard } from './components/my-bounties-dashboard';
import { CreateBountyForm } from './components/create-bounty-form';
import { ToastContainer } from './components/toast-container';
import { ToastProvider, useToast } from './hooks/use-toast';
import { Leaderboard } from './components/leaderboard';
import { useState } from 'react';
import { ThemeProvider } from './components/theme-provider';
import { WalletModal } from './components/wallet-modal';

import { useWallet } from './components/wallet-provider';

function AppContent() {
  const { toasts } = useToast();
  const { isConnected, address, connect, disconnect } = useWallet();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  return (
    <div className="min-h-screen pb-16 md:pb-0">
      {/* Mobile Navigation */}
      <div className="md:hidden">
        <MobileNavigation
          isConnected={isConnected}
          onConnectWallet={() => setIsWalletModalOpen(true)}
          walletAddress={address || ''}
          onDisconnect={disconnect}
        />
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <Navigation />
      </div>

      <Hero />


      {/* My Bounties Dashboard Section */}
      <div id="my-bounties" className="relative z-10 w-full bg-slate-50/50 border-y border-slate-200 mt-12 py-12">
        <MyBountiesDashboard />
      </div>

      {/* Bounty Cards Section */}
      <div id="browse" className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <BountyShowcase />
      </div>

      {/* Create Bounty Form Section */}
      <div id="create" className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold mb-8 text-center">Create New Bounty</h2>
        <CreateBountyForm />
      </div>

      {/* Leaderboard Section */}
      <div id="leaderboard" className="relative z-10 max-w-7xl mx-auto px-6 py-12 text-center">
        <Leaderboard />
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} />

      {/* Wallet Modal for Mobile/Global */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onConnect={(walletId) => {
          connect(walletId as any);
          setIsWalletModalOpen(false);
        }}
      />
    </div>
  );
}


import { WalletProvider } from './components/wallet-provider';

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="bounty-board-theme">
      <WalletProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </WalletProvider>
    </ThemeProvider>
  );
}