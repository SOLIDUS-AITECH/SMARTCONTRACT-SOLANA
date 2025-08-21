import {
    createMint,
    getOrCreateAssociatedTokenAccount,
    mintTo,
} from "@solana/spl-token";
import { AITECH_TOKEN, connection, loadKeypair } from "../sdk";
import assert from "node:assert";
import path from "node:path";

const DEPLOYER_WALLET = loadKeypair(
    path.join(__dirname, "..", "keys", "deployer.json")
);

export async function createToken() {
    const mint = await createMint(
        connection,
        DEPLOYER_WALLET,
        DEPLOYER_WALLET.publicKey,
        null,
        9,
        AITECH_TOKEN
    );
    assert(mint.toString() === AITECH_TOKEN.publicKey.toString());
    console.info("Created AITECH_TOKEN", AITECH_TOKEN.publicKey.toString());

    const deployerAitechTokenAcc = await getOrCreateAssociatedTokenAccount(
        connection,
        DEPLOYER_WALLET,
        mint,
        DEPLOYER_WALLET.publicKey
    );

    const MINT_AMOUNT = 1_000_000_000_000000000n;
    await mintTo(
        connection,
        DEPLOYER_WALLET,
        mint,
        deployerAitechTokenAcc.address,
        DEPLOYER_WALLET.publicKey,
        MINT_AMOUNT
    );

    console.info(
        "Minted AITECH_TOKEN",
        MINT_AMOUNT.toString(),
        "to",
        deployerAitechTokenAcc.address.toString()
    );
}

createToken();
