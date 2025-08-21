import {
    AITECH_TOKEN,
    emergencyWithdraw,
    getProgramTokenVaultPda,
    scaffoldProgram,
    sendTransaction
} from "../sdk";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { getAccount } from "@solana/spl-token";
import { BN } from "bn.js";

process.removeAllListeners("warning");
const PROMPT = "> ";

const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const RESET = "\x1b[0m";

async function main() {
    const { PaymentGpuMarketplaceProgram, provider, signer } =
        scaffoldProgram("owner.json");

    const programTokenVault = getProgramTokenVaultPda(
        PaymentGpuMarketplaceProgram.programId,
        AITECH_TOKEN.publicKey
    )[0];
    const aitechBalance = await getAccount(
        PaymentGpuMarketplaceProgram.provider.connection,
        programTokenVault
    );
    const balanceWithoutDecimals = aitechBalance.amount / BigInt(10 ** 9);

    console.info(`${GREEN}AITECH balance: ${balanceWithoutDecimals}${RESET}`);

    const rl = readline.createInterface({
        input,
        output,
        prompt: PROMPT,
        removeHistoryDuplicates: true,
    });
    let amount = await getAmount(rl);
    while (
        Number.isNaN(amount) ||
        amount === 0n ||
        BigInt(amount) > balanceWithoutDecimals
    ) {
        console.info(`${RED}Invalid amount${RESET}`);
        amount = await getAmount(rl);
    }

    rl.close();

    const { instruction: emergencyWithdrawIx } = await emergencyWithdraw(
        PaymentGpuMarketplaceProgram,
        signer.publicKey,
        {
            amountAitech: new BN((amount * BigInt(10 ** 9)).toString()),
        }
    );

    await sendTransaction(
        provider,
        emergencyWithdrawIx,
        { loggerIdentity: "emergencyWithdraw" },
        signer.payer
    );
}

async function getAmount(rl: readline.Interface) {
    const defaultAmount = "0";
    const amount = BigInt(
        (await rl.question(
            `|- Input amount want to withdraw (without decimals):\n${PROMPT}`
        )) ?? defaultAmount
    );

    console.info(`${GREEN}Withdrawing ${amount}${RESET}`);

    return amount;
}

main();
