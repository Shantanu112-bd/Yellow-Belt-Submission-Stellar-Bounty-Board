
import * as StellarSdk from '@stellar/stellar-sdk';
console.log('Keys:', Object.keys(StellarSdk));
console.log('SorobanRpc exists?', !!StellarSdk.SorobanRpc);
console.log('rpc exists?', !!StellarSdk.rpc);
console.log('Server exists on rpc?', !!(StellarSdk.rpc && StellarSdk.rpc.Server));
console.log('Server exists on SorobanRpc?', !!(StellarSdk.SorobanRpc && StellarSdk.SorobanRpc.Server));
