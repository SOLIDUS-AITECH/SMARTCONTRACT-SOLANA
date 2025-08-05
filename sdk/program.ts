import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import { Commitment, Connection, PublicKey } from "@solana/web3.js";
import { loadKeypair } from "./helpers";
import path from 'node:path'
import { Transaction, TransactionInstruction } from '@solana/web3.js';
import { IDL } from "./payment_gpu_marketplace";

export const PROGRAM_ID = new PublicKey("BV7ZPynu7mnNKP2RNhVsqxXSfEsuZLcx1xfvsZ5z63UU");

export const connection = new Connection("https://api.devnet.solana.com")
export const commitment: Commitment = "confirmed"

export const signerKp = loadKeypair(path.join(__dirname, "..", "keys", "deployer.json"));
export const signer = new Wallet(signerKp);

export const provider = new AnchorProvider(connection, signer, {
  preflightCommitment: commitment,
});

export const PaymentGpuMarketplaceProgram = new Program(IDL, PROGRAM_ID, provider);

export async function sendTransaction(
  ix:
      | TransactionInstruction
      | TransactionInstruction[],
  { loggerIdentity }: { loggerIdentity: string },
  signer: Wallet
) {
  const block = await provider.connection.getLatestBlockhash();
  const transaction = new Transaction({
      feePayer: signer.payer.publicKey,
      blockhash: block.blockhash,
      lastValidBlockHeight: block.lastValidBlockHeight,
  });
  if (Array.isArray(ix)) {
      transaction.add(...ix);
  } else {
      transaction.add(ix);
  }
  const signedTx = await signer.signTransaction(transaction);
  const txHash = await provider.sendAndConfirm(signedTx);
  console.log(loggerIdentity, txHash);
  console.log("waiting for transaction...");
  await provider.connection.confirmTransaction(
      {
          ...block,
          signature: txHash,
      }
  );
  console.info(loggerIdentity, txHash);
  return txHash;
}