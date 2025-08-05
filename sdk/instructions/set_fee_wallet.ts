import { Program } from "@coral-xyz/anchor";
import { PaymentGpuMarketplace } from "../payment_gpu_marketplace";
import { PublicKey } from "@solana/web3.js";
import { getConfigPda } from "../pda";

export async function setFeeWallet(
  program: Program<PaymentGpuMarketplace>,
  signer: PublicKey,
  args: {
    feeWallet: PublicKey,
  }
) {
  const configPda = getConfigPda(program.programId)[0];

  const ix = await program.methods
    .setFeeWallet()
    .accounts({
      signer: signer,
      config: configPda,
      feeWallet: args.feeWallet,
    })
    .instruction();
  return {
    instruction: ix,
  };
} 