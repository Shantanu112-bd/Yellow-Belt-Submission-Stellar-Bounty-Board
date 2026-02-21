import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { StellarWalletsKit, WalletNetwork, allowAllModules } from '@creit.tech/stellar-wallets-kit';
import toast from 'react-hot-toast';

// Define WalletType manually if not exported
export enum WalletType {
    FREIGHTER = 'freighter',
    ALBEDO = 'albedo',
    XBULL = 'xbull',
}

interface WalletState {
    address: string | null;
    isConnected: boolean;
    isLoading: boolean;
    walletType: WalletType | null;
}

interface WalletContextType extends WalletState {
    connect: (walletType?: WalletType) => Promise<string | null>;
    disconnect: () => void;
    signTransaction: (xdr: string) => Promise<string>;
    kit: StellarWalletsKit | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<WalletState>({
        address: null,
        isConnected: false,
        isLoading: false,
        walletType: null,
    });

    const [kit, setKit] = useState<StellarWalletsKit | null>(null);

    // Initialize wallet kit
    useEffect(() => {
        const initKit = async () => {
            try {
                const walletKit = new StellarWalletsKit({
                    network: WalletNetwork.TESTNET,
                    selectedWalletId: WalletType.FREIGHTER,
                    modules: allowAllModules(),
                });
                setKit(walletKit);
                console.log('✅ Wallet kit initialized');
            } catch (error) {
                console.error('Failed to initialize wallet kit:', error);
                // Fallback or retry?
                // toast.error('Failed to initialize wallets');
            }
        };

        initKit();
    }, []);

    // Check for saved connection
    useEffect(() => {
        const savedAddress = localStorage.getItem('walletAddress');
        const savedWalletType = localStorage.getItem('walletType')?.toLowerCase();

        if (savedAddress && savedWalletType && kit) {
            setState(prev => ({
                ...prev,
                address: savedAddress,
                isConnected: true,
                walletType: savedWalletType as WalletType,
            }));
            console.log('✅ Restored wallet connection:', savedAddress.substring(0, 8) + '...');
        }
    }, [kit]);

    // Connect wallet
    const connect = useCallback(async (walletType: WalletType = WalletType.FREIGHTER) => {
        if (!kit) {
            toast.error('Wallet kit not ready. Please refresh the page.');
            console.error('Wallet kit is null');
            return null;
        }

        setState(prev => ({ ...prev, isLoading: true }));

        try {
            console.log('🔄 Connecting to', walletType, 'wallet...');

            // Set wallet type
            await kit.setWallet(walletType);

            // Get address
            const { address } = await kit.getAddress();

            if (!address) {
                throw new Error('No address returned from wallet');
            }

            // Update state
            setState({
                address,
                isConnected: true,
                isLoading: false,
                walletType,
            });

            // Save to localStorage
            localStorage.setItem('walletAddress', address);
            localStorage.setItem('walletType', walletType);

            console.log('✅ Wallet connected:', address.substring(0, 8) + '...');
            toast.success('Wallet connected successfully!');

            return address;

        } catch (error: any) {
            console.error('Wallet connection error:', error);
            setState(prev => ({ ...prev, isLoading: false }));

            const msg = error.message || String(error);
            if (msg.includes('not installed') || msg.includes('not found')) {
                toast.error(`${walletType} wallet not found. Please install the extension.`);
            } else if (msg.includes('rejected') || msg.includes('User declined')) {
                toast.error('Connection rejected by user');
            } else {
                toast.error('Failed to connect wallet: ' + msg);
            }
            throw error;
        }
    }, [kit]);

    // Disconnect wallet
    const disconnect = useCallback(() => {
        setState({
            address: null,
            isConnected: false,
            isLoading: false,
            walletType: null,
        });

        localStorage.removeItem('walletAddress');
        localStorage.removeItem('walletType');

        console.log('👋 Wallet disconnected');
        toast.success('Wallet disconnected');
    }, []);

    // Sign transaction
    const signTransaction = useCallback(async (xdr: string): Promise<string> => {
        if (!kit || !state.address) {
            throw new Error('Wallet not connected');
        }

        try {
            console.log('✍️ Requesting transaction signature...');

            const { signedTxXdr } = await kit.signTransaction(xdr, {
                address: state.address,
                networkPassphrase: 'Test SDF Network ; September 2015',
            });

            console.log('✅ Transaction signed');
            return signedTxXdr;

        } catch (error: any) {
            console.error('Signing error:', error);
            toast.error('Failed to sign transaction');
            throw error;
        }
    }, [kit, state.address]);

    return (
        <WalletContext.Provider value={{ ...state, connect, disconnect, signTransaction, kit }}>
            {children}
        </WalletContext.Provider>
    )
}

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (context === undefined) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
};
