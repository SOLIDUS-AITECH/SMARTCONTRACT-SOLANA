import { Keypair } from "@solana/web3.js";

export const OWNER_KEYPAIR = Keypair.generate();
export const GPU_OWNER_ACCOUNT_KEYPAIR = Keypair.generate();
export const GPU_RENTER_ACCOUNT_KEYPAIR = Keypair.generate();
export const FEE_WALLET_KEYPAIR = Keypair.generate();
export const STAKING_WALLET_KEYPAIR = Keypair.generate();
export const WITHDRAW_SIGNER_KEYPAIR = Keypair.generate();
export const REST_KEYPAIR = [
    Keypair.generate(),
    Keypair.generate(),
]

export const USDT_TOKEN = Keypair.generate();
export const AITECH_TOKEN = Keypair.generate();

export const DENOMINATION = 10000n;
