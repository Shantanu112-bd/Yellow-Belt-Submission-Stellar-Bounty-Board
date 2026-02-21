
import * as StellarSdk from '@stellar/stellar-sdk';
import { server, getContract, networkPassphrase, xlmToStroops } from '../lib/stellar-client';

// Native XLM token address on testnet
const NATIVE_TOKEN = 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC';

export interface TransactionResult {
    success: boolean;
    hash: string;
    error?: string;
}

export class ContractService {
    private contract: StellarSdk.Contract;

    constructor() {
        this.contract = getContract();
    }

    /**
     * CREATE BOUNTY
     */
    async createBounty(
        creatorAddress: string,
        title: string,
        description: string,
        rewardXlm: number,
        durationDays: number,
        signTransaction: (xdr: string) => Promise<string>
    ): Promise<TransactionResult> {
        try {
            const deadline = BigInt(Math.floor(Date.now() / 1000) + (durationDays * 24 * 60 * 60));
            const rewardStroops = xlmToStroops(rewardXlm);

            console.log('📝 Creating bounty:', {
                title,
                reward: rewardXlm + ' XLM',
                deadline: new Date(Number(deadline) * 1000).toLocaleString(),
            });

            // Prepare correct ScVal types
            const args = [
                StellarSdk.nativeToScVal(title, { type: 'string' }),
                StellarSdk.nativeToScVal(description, { type: 'string' }),
                StellarSdk.nativeToScVal(rewardStroops, { type: 'i128' }),
                StellarSdk.nativeToScVal(deadline, { type: 'u64' }),
                StellarSdk.nativeToScVal(NATIVE_TOKEN, { type: 'address' }) // Token address
            ];

            const fullArgs = [
                new StellarSdk.Address(creatorAddress).toScVal(),
                ...args
            ];

            const operation = this.contract.call('create_bounty', ...fullArgs);

            return await this.buildAndSendTransaction(creatorAddress, operation, signTransaction);
        } catch (error: any) {
            return {
                success: false,
                hash: '',
                error: error.message || 'Failed to create bounty'
            }
        }
    }

    /**
     * Build and send a transaction
     */
    private async buildAndSendTransaction(
        sourceAddress: string,
        operation: StellarSdk.xdr.Operation,
        signTransaction: (xdr: string) => Promise<string>
    ): Promise<TransactionResult> {
        try {
            console.log('🔨 Building transaction...');

            // Get account
            const account = await server.getAccount(sourceAddress);

            // Build transaction
            const transaction = new StellarSdk.TransactionBuilder(account, {
                fee: StellarSdk.BASE_FEE,
                networkPassphrase,
            })
                .addOperation(operation)
                .setTimeout(30)
                .build();

            console.log('🧪 Simulating transaction...');

            // Simulate transaction
            const simulatedTx = await server.simulateTransaction(transaction);

            // Use correct rpc namespace
            const Rpc = StellarSdk.rpc;

            if (Rpc.Api.isSimulationError(simulatedTx)) {
                // Extract error properly
                const errorMsg = simulatedTx.error || 'Simulation failed';
                throw new Error(`Simulation error: ${errorMsg}`);
            }

            console.log('✅ Simulation successful');

            // Prepare transaction (assemble with simulation data for resources)
            const preparedTx = Rpc.assembleTransaction(transaction, simulatedTx).build();

            // Sign transaction
            const signedXdr = await signTransaction(preparedTx.toXDR());

            // Parse signed transaction to verify/object
            const signedTx = StellarSdk.TransactionBuilder.fromXDR(
                signedXdr,
                networkPassphrase
            );

            console.log('📤 Submitting transaction...');

            // Submit transaction
            const sendResponse = await server.sendTransaction(signedTx);

            if (sendResponse.status === 'ERROR') {
                // it might be PENDING or SUCCESS or ERROR
                throw new Error('Transaction submission failed at immediate response');
            }

            // If PENDING or SUCCESS, we wait.
            console.log('⏳ Transaction submitted. Hash:', sendResponse.hash);

            // Poll for result
            const result = await this.pollTransactionResult(sendResponse.hash);

            if (result.status === Rpc.Api.GetTransactionStatus.SUCCESS) {
                console.log('✅ Transaction confirmed!');
                return {
                    success: true,
                    hash: sendResponse.hash,
                };
            } else {
                throw new Error('Transaction failed after polling');
            }

        } catch (error: any) {
            console.error('❌ Transaction error:', error);
            return {
                success: false,
                hash: '',
                error: this.parseError(error),
            };
        }
    }

    /**
     * Poll for transaction result
     */
    private async pollTransactionResult(hash: string, maxAttempts = 30): Promise<StellarSdk.rpc.Api.GetTransactionResponse> {
        console.log('🔍 Polling for transaction result...');

        const Rpc = StellarSdk.rpc;

        for (let i = 0; i < maxAttempts; i++) {
            // Wait 1 second
            await new Promise(resolve => setTimeout(resolve, 1000));

            const response = await server.getTransaction(hash);

            if (response.status !== Rpc.Api.GetTransactionStatus.NOT_FOUND) {
                // It's either SUCCESS or FAILED
                return response;
            }
        }

        throw new Error('Transaction timeout - result not found after 30 seconds');
    }

    /**
     * Parse error messages
     */
    private parseError(error: any): string {
        const message = error.message || String(error);

        if (message.includes('insufficient')) {
            return 'Insufficient XLM balance to complete this transaction';
        }
        if (message.includes('rejected') || message.includes('User declined')) {
            return 'Transaction was rejected in wallet';
        }
        if (message.includes('timeout')) {
            return 'Network timeout. Please try again';
        }
        if (message.includes('not found')) {
            return 'Wallet extension not found. Please install Freighter';
        }
        if (message.includes('expired')) {
            return 'This bounty has expired';
        }
        if (message.includes('Contract already initialized')) {
            return 'Contract is already initialized';
        }

        return message;
    }

    /**
     * Get all bounties
     */
    async getAllBounties(): Promise<any[]> {
        console.log('🔍 Fetching all bounties...');
        try {
            const operation = this.contract.call('get_all_bounties');

            const dummy = StellarSdk.Keypair.random();
            const source = new StellarSdk.Account(dummy.publicKey(), '0');

            const transaction = new StellarSdk.TransactionBuilder(source, {
                fee: StellarSdk.BASE_FEE,
                networkPassphrase,
            })
                .addOperation(operation)
                .setTimeout(30)
                .build();

            const simulated = await server.simulateTransaction(transaction);

            // Access properties safely
            if (StellarSdk.rpc.Api.isSimulationSuccess(simulated)) {
                if (simulated.result && simulated.result.retval) {
                    return StellarSdk.scValToNative(simulated.result.retval);
                }
            }

            console.error('Failed to simulate get_all_bounties', simulated);
            return [];
        } catch (error) {
            console.error('Error fetching bounties:', error);
            return [];
        }
    }

    /**
     * Get bounty count
     */
    async getBountyCount(): Promise<number> {
        try {
            const operation = this.contract.call('get_bounty_count');
            const dummy = StellarSdk.Keypair.random();
            const source = new StellarSdk.Account(dummy.publicKey(), '0');

            const transaction = new StellarSdk.TransactionBuilder(source, {
                fee: StellarSdk.BASE_FEE,
                networkPassphrase,
            })
                .addOperation(operation)
                .setTimeout(30)
                .build();

            const simulated = await server.simulateTransaction(transaction);

            if (StellarSdk.rpc.Api.isSimulationSuccess(simulated)) {
                if (simulated.result && simulated.result.retval) {
                    return Number(StellarSdk.scValToNative(simulated.result.retval));
                }
            }
            return 0;
        } catch (error) {
            console.error('Error fetching bounty count:', error);
            return 0;
        }
    }
}

// Export singleton instance
export const contractService = new ContractService();
