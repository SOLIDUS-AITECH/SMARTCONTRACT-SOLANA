import * as anchor from "@coral-xyz/anchor";
import { expect } from "chai";
import {
    deposit,
    getConfigPda,
    getProgramTokenVaultPda,
    pause,
    PaymentGpuMarketplace,
} from "../sdk";
import { boilerPlateReduction } from "./utils/helpers";
import {
    AITECH_TOKEN,
    DENOMINATION,
    GPU_RENTER_ACCOUNT_KEYPAIR,
    OWNER_KEYPAIR,
} from "./utils/consts";
import { PublicKey } from "@solana/web3.js";
import {
    getAccount,
    getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";
import { BN } from "bn.js";

describe("02. Payment: deposit unit test", async function () {
    anchor.setProvider(anchor.AnchorProvider.env());
    const provider = anchor.getProvider();
    const PaymentContract = anchor.workspace
        .PaymentGpuMarketplace as anchor.Program<PaymentGpuMarketplace>;

    const { expectIxToSucceed, expectIxToFailWithError } = boilerPlateReduction(
        provider.connection,
        OWNER_KEYPAIR
    );

    let programTokenVaultPda: PublicKey;
    let configPda: PublicKey,
        configData: Awaited<
            ReturnType<typeof PaymentContract.account.config.fetch>
        >;

    before(async () => {
        programTokenVaultPda = getProgramTokenVaultPda(
            PaymentContract.programId,
            AITECH_TOKEN.publicKey
        )[0];
        configPda = getConfigPda(PaymentContract.programId)[0];
        configData = await PaymentContract.account.config.fetch(configPda);
    });

    it("TC-101: deposit success: correct transfer amounts", async () => {
        const userTokenAccount = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            GPU_RENTER_ACCOUNT_KEYPAIR,
            AITECH_TOKEN.publicKey,
            GPU_RENTER_ACCOUNT_KEYPAIR.publicKey
        );
        const preProgramTokenVaultBalance = (
            await getAccount(provider.connection, programTokenVaultPda)
        ).amount;
        const preStakingBalance = (
            await getAccount(provider.connection, configData.stakingWallet)
        ).amount;
        const preUserBalance = (
            await getAccount(provider.connection, userTokenAccount.address)
        ).amount;
        const stakingRate = BigInt(configData.stakingRate);
        const burnRate = BigInt(configData.burnRate);

        const depositAmount = 10000n;
        const stakingAmount = (depositAmount * stakingRate) / DENOMINATION;
        const burnAmount = (depositAmount * burnRate) / DENOMINATION;
        const transferAmount = depositAmount - stakingAmount - burnAmount;
        const extraData = Buffer.from([12, 45]);

        const { instruction: depositIx } = await deposit(
            PaymentContract,
            GPU_RENTER_ACCOUNT_KEYPAIR.publicKey,
            {
                amountAitech: new BN(depositAmount.toString()),
                extraData: extraData,
            }
        );
        await expectIxToSucceed(depositIx, [GPU_RENTER_ACCOUNT_KEYPAIR]);

        const postProgramTokenVaultBalance = (
            await getAccount(provider.connection, programTokenVaultPda)
        ).amount;
        const postStakingBalance = (
            await getAccount(provider.connection, configData.stakingWallet)
        ).amount;
        const postUserBalance = (
            await getAccount(provider.connection, userTokenAccount.address)
        ).amount;

        expect(postProgramTokenVaultBalance).to.be.equal(
            preProgramTokenVaultBalance + transferAmount
        );
        expect(postStakingBalance).to.be.equal(
            preStakingBalance + stakingAmount
        );
        expect(postUserBalance).to.be.equal(preUserBalance - depositAmount);
    });

    it("TC-102: deposit success: emit event", async () => {
        const stakingRate = BigInt(configData.stakingRate);
        const burnRate = BigInt(configData.burnRate);

        const extraData = Buffer.from([12, 45]);
        const depositAmount = BigInt(1000);
        const stakingAmount = (depositAmount * stakingRate) / DENOMINATION;
        const burnAmount = (depositAmount * burnRate) / DENOMINATION;
        const transferAmount = depositAmount - stakingAmount - burnAmount;

        let listener = null;
        let event: any = {};

        const { instruction: depositIx } = await deposit(
            PaymentContract,
            GPU_RENTER_ACCOUNT_KEYPAIR.publicKey,
            {
                amountAitech: new BN(depositAmount.toString()),
                extraData: extraData,
            }
        );

        await new Promise(async (resolve) => {
            listener = PaymentContract.addEventListener(
                "Deposit",
                (eventData) => {
                    event = eventData;
                    resolve(1);
                }
            );
            await expectIxToSucceed(depositIx, [
                GPU_RENTER_ACCOUNT_KEYPAIR,
            ]).catch(() => {
                resolve(0);
            });
        });

        PaymentContract.removeEventListener(listener);

        expect(event.from.toString()).eq(
            GPU_RENTER_ACCOUNT_KEYPAIR.publicKey.toString()
        );
        expect(event.amountAitech.toString()).eq(depositAmount.toString());
        expect(event.transferAmount.toString()).eq(transferAmount.toString());
        expect(event.burnAmount.toString()).eq(burnAmount.toString());
        expect(event.stakingAmount.toString()).eq(stakingAmount.toString());
        expect(event.extraData.toString()).eq(extraData.toString());
    });

    it("TC-103: deposit fail: zero amount", async () => {
        const { instruction: depositIx } = await deposit(
            PaymentContract,
            GPU_RENTER_ACCOUNT_KEYPAIR.publicKey,
            { amountAitech: new BN(0), extraData: Buffer.from([]) }
        );
        await expectIxToFailWithError(depositIx, "ZeroAmount", [
            GPU_RENTER_ACCOUNT_KEYPAIR,
        ]);
    });

    it("TC-104: deposit fail: exceed allowance amount", async () => {
        const userTokenAccount = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            GPU_RENTER_ACCOUNT_KEYPAIR,
            AITECH_TOKEN.publicKey,
            GPU_RENTER_ACCOUNT_KEYPAIR.publicKey
        );
        const preUserBalance = (
            await getAccount(provider.connection, userTokenAccount.address)
        ).amount;
        const depositAmount = new BN((preUserBalance + 100n).toString());
        const { instruction: depositIx } = await deposit(
            PaymentContract,
            GPU_RENTER_ACCOUNT_KEYPAIR.publicKey,
            { amountAitech: depositAmount, extraData: Buffer.from([]) }
        );
        await expectIxToFailWithError(depositIx, "", [
            GPU_RENTER_ACCOUNT_KEYPAIR,
        ]);
    });

    it("TC-105: deposit fail: paused contract", async () => {
        const { instruction: pauseIx } = await pause(
            PaymentContract,
            OWNER_KEYPAIR.publicKey
        );
        const { instruction: depositIx } = await deposit(
            PaymentContract,
            GPU_RENTER_ACCOUNT_KEYPAIR.publicKey,
            { amountAitech: new BN(10000), extraData: Buffer.from([]) }
        );
        await expectIxToFailWithError([pauseIx, depositIx], "Paused", [
            OWNER_KEYPAIR,
            GPU_RENTER_ACCOUNT_KEYPAIR,
        ]);
    });
});
