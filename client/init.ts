import { Wallet } from "@coral-xyz/anchor";
import {
    initialize,
    loadKeypair,
    scaffoldProgram,
    sendTransaction,
} from "../sdk";
import path from "node:path";
import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { BN } from "bn.js";

async function main() {
    const deployerKp = loadKeypair(
        path.join(__dirname, "..", "keys", "deployer.json")
    );
    const deployerWallet = new Wallet(deployerKp);
    const ownerKp = loadKeypair(
        path.join(__dirname, "..", "keys", "owner.json")
    );
    const ownerWallet = new Wallet(ownerKp);
    const withdrawSignerKp = loadKeypair(
        path.join(__dirname, "..", "keys", "withdraw_signer.json")
    );
    const withdrawSignerWallet = new Wallet(withdrawSignerKp);
    const { PaymentGpuMarketplaceProgram, provider } =
        scaffoldProgram("deployer.json");

    const AITECH_TOKEN = new PublicKey(
        "8zEGAKEeggtp3uT5QiUHiVksMJ2JzCHm465oKZzkHNU"
    );
    const DEPLOYER_AITECH_TOKEN_ACC = getAssociatedTokenAddressSync(
        AITECH_TOKEN,
        deployerKp.publicKey
    );
    const FEE_WALLET = DEPLOYER_AITECH_TOKEN_ACC;
    const STAKING_WALLET = DEPLOYER_AITECH_TOKEN_ACC;

    const initializeArgs = {
        feeRate: 500, // 5%
        stakingRate: 500, // 5%
        burnRate: 500, // 5%
        minimumWithdraw: new BN(1000000000), // 1 AITECH
        maximumWithdraw: new BN("1000000000000000000"), // 1,000,000,000 AITECH
        owner: ownerWallet.publicKey,
        withdrawSigner: withdrawSignerWallet.publicKey,
    };

    const { instruction: initializeIx } = await initialize(
        PaymentGpuMarketplaceProgram,
        deployerKp.publicKey,
        AITECH_TOKEN,
        FEE_WALLET,
        STAKING_WALLET,
        initializeArgs
    );

    await sendTransaction(
        provider,
        initializeIx,
        { loggerIdentity: "initialize" },
        deployerWallet.payer
    );
}

main();
