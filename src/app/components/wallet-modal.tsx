import { motion, AnimatePresence } from 'motion/react';
import { X, HelpCircle, Wallet, Shield, Zap } from 'lucide-react';
import { BountyBadge } from './bounty-badge';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (wallet: string) => void;
}

interface WalletOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  recommended?: boolean;
  color: string;
}

export function WalletModal({ isOpen, onClose, onConnect }: WalletModalProps) {
  const wallets: WalletOption[] = [
    {
      id: 'freighter',
      name: 'Freighter',
      description: 'Browser extension for Stellar',
      icon: <Wallet size={48} />,
      recommended: true,
      color: 'from-primary to-purple-600',
    },
    {
      id: 'albedo',
      name: 'Albedo',
      description: 'Web-based Stellar signer',
      icon: <Shield size={48} />,
      color: 'from-secondary to-cyan-600',
    },
    {
      id: 'xbull',
      name: 'xBull',
      description: 'Multi-platform Stellar wallet',
      icon: <Zap size={48} />,
      color: 'from-accent to-orange-600',
    },
  ];

  const handleWalletClick = (walletId: string) => {
    onConnect(walletId);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-foreground/80 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="relative w-full max-w-[480px] bg-card rounded-2xl shadow-2xl overflow-hidden"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Gradient Accent Line */}
              <div className="h-1 bg-gradient-to-r from-primary via-secondary to-accent" />

              {/* Header */}
              <div className="relative p-8 pb-6">
                <h2 className="text-2xl font-bold text-center text-card-foreground">
                  Connect Your Wallet
                </h2>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Choose your preferred Stellar wallet
                </p>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted/50 transition-colors group"
                  aria-label="Close modal"
                >
                  <X size={20} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                </button>
              </div>

              {/* Wallet Options */}
              <div className="px-8 pb-6 space-y-3">
                {wallets.map((wallet, index) => (
                  <motion.button
                    key={wallet.id}
                    className="relative w-full h-[120px] bg-background border-2 border-border rounded-xl p-6 flex items-center gap-4 transition-all duration-300 hover:border-primary/40 hover:-translate-y-1 hover:shadow-xl group overflow-hidden"
                    onClick={() => handleWalletClick(wallet.id)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className={`absolute inset-0 bg-gradient-to-r ${wallet.color} opacity-5`} />
                      <div className={`absolute -inset-1 bg-gradient-to-r ${wallet.color} opacity-20 blur-xl`} />
                    </div>

                    {/* Content */}
                    <div className="relative flex items-center gap-4 w-full">
                      {/* Wallet Icon */}
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${wallet.color} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <div className="text-white">
                          {wallet.icon}
                        </div>
                      </div>

                      {/* Wallet Info */}
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg text-card-foreground group-hover:text-primary transition-colors">
                            {wallet.name}
                          </h3>
                          {wallet.recommended && (
                            <BountyBadge variant="new" className="text-[10px] px-2 py-0.5">
                              Recommended
                            </BountyBadge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {wallet.description}
                        </p>
                      </div>

                      {/* Arrow Indicator */}
                      <div className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path
                            d="M7.5 15L12.5 10L7.5 5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Footer */}
              <div className="px-8 pb-8">
                <div className="pt-6 border-t border-border">
                  <a
                    href="https://stellar.org/learn"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
                  >
                    <HelpCircle size={16} className="group-hover:rotate-12 transition-transform" />
                    <span className="font-medium">New to Stellar?</span>
                    <span className="text-primary">Learn more →</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
