import { Program } from "@coral-xyz/anchor";
import { PaymentGpuMarketplace } from "../payment_gpu_marketplace";
import { PublicKey } from "@solana/web3.js";
import { getConfigPda } from "../pda";

export async function setWithdrawSigner(
  program: Program<PaymentGpuMarketplace>,
  signer: PublicKey,
  args: {
    withdrawSigner: PublicKey,
  }
) {
  const configPda = getConfigPda(program.programId)[0];

  const ix = await program.methods
    .setWithdrawSigner(args.withdrawSigner)
    .accounts({
      signer: signer,
      config: configPda,
    })
    .instruction();
  return {
    instruction: ix,
  };
} 