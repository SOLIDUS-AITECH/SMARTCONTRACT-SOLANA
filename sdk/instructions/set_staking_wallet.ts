import { Program } from "@coral-xyz/anchor";
import { PaymentGpuMarketplace } from "../payment_gpu_marketplace";
import { PublicKey } from "@solana/web3.js";
import { getConfigPda } from "../pda";

export async function setStakingWallet(
  program: Program<PaymentGpuMarketplace>,
  signer: PublicKey,
  args: {
    stakingWallet: PublicKey,
  }
) {
  const configPda = getConfigPda(program.programId)[0];

  const ix = await program.methods
    .setStakingWallet()
    .accounts({
      signer: signer,
      config: configPda,
      stakingWallet: args.stakingWallet,
    })
    .instruction();
  return {
    instruction: ix,
  };
} 