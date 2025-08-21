import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import {
    Commitment,
    Connection,
    PublicKey,
    sendAndConfirmTransaction,
    Signer,
} from "@solana/web3.js";
import { loadKeypair } from "./helpers";
import path from "node:path";
import { Transaction, TransactionInstruction } from "@solana/web3.js";
import { IDL } from "./payment_gpu_marketplace";

export const PROGRAM_ID = new PublicKey(
    "FcCaVVv6D57CjEAKAPWuBB2iPA1qebPE68CdmzMTBhmy"
);

export const connection = new Connection("https://api.devnet.solana.com");
export const commitment: Commitment = "confirmed";

export const AITECH_TOKEN = loadKeypair(
    path.join(__dirname, "..", "keys", "aitech_token.json")
);

export const scaffoldProgram = (keyFile: string) => {
    const signerKp = loadKeypair(path.join(__dirname, "..", "keys", keyFile));
    const signer = new Wallet(signerKp);
    const provider = new AnchorProvider(connection, signer, {
        preflightCommitment: commitment,
    });

    const PaymentGpuMarketplaceProgram = new Program(IDL, PROGRAM_ID, provider);
    return {
        signer,
        provider,
        PaymentGpuMarketplaceProgram,
        signerKp,
    };
};

export async function sendTransaction(
    provider: AnchorProvider,
    ix: TransactionInstruction | TransactionInstruction[],
    { loggerIdentity }: { loggerIdentity: string },
    signer: Signer | Signer[],
    commitment: Commitment = "confirmed"
) {
    let signers: Signer[] = [];
    if (!Array.isArray(signer)) {
        signers = [signer];
    } else {
        signers = signer;
    }
    const block = await provider.connection.getLatestBlockhash();
    const transaction = new Transaction({
        feePayer: signers[0].publicKey,
        blockhash: block.blockhash,
        lastValidBlockHeight: block.lastValidBlockHeight,
    });
    if (Array.isArray(ix)) {
        transaction.add(...ix);
    } else {
        transaction.add(ix);
    }
    const txHash = await sendAndConfirmTransaction(
        provider.connection,
        transaction,
        signers
    );
    console.log(loggerIdentity, `https://explorer.solana.com/tx/${txHash}?cluster=custom&customUrl=${provider.connection.rpcEndpoint}`);
    console.log("waiting for transaction...");
    await provider.connection.confirmTransaction({
        ...block,
        signature: txHash,
    }, commitment);
    console.info(loggerIdentity, "Transaction is", commitment);
    return txHash;
}
