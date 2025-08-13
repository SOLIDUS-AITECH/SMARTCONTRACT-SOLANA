import { Wallet } from "@coral-xyz/anchor";
import {
    initialize,
    loadKeypair,
    scaffoldProgram,
    sendTransaction,
    unpause,
    updateConfig,
} from "../sdk";
import path from "node:path";
import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { BN } from "bn.js";

async function main() {
    const deployerKp = loadKeypair(
        path.join(__dirname, "..", "keys", "deployer.json")
    );
    const ownerKp = loadKeypair(
        path.join(__dirname, "..", "keys", "owner.json")
    );
    const ownerWallet = new Wallet(ownerKp);
    const withdrawSignerKp = loadKeypair(
        path.join(__dirname, "..", "keys", "withdraw_signer.json")
    );
    const withdrawSignerWallet = new Wallet(withdrawSignerKp);
    const { PaymentGpuMarketplaceProgram, provider } =
        scaffoldProgram("owner.json");

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
        ownerKp.publicKey,
        AITECH_TOKEN,
        FEE_WALLET,
        STAKING_WALLET,
        initializeArgs
    );

    const { instruction: updateConfigIx } = await updateConfig(PaymentGpuMarketplaceProgram, ownerKp.publicKey, {
        feeRate: initializeArgs.feeRate,
        stakingRate: initializeArgs.stakingRate,
        burnRate: initializeArgs.burnRate,
        minimumWithdraw: initializeArgs.minimumWithdraw,
        maximumWithdraw: initializeArgs.maximumWithdraw,
        feeWallet: FEE_WALLET,
        stakingWallet: STAKING_WALLET,
    });

    const { instruction: unPauseIx } = await unpause(PaymentGpuMarketplaceProgram, ownerKp.publicKey);

    await sendTransaction(
        provider,
        [initializeIx, updateConfigIx, unPauseIx],
        { loggerIdentity: "initialize" },
        [ownerWallet.payer]
    );
}

main();
