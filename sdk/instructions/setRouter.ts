import { Program } from "@coral-xyz/anchor";
import { PaymentGpuMarketplace } from "../payment_gpu_marketplace";
import { PublicKey } from "@solana/web3.js";
import { getConfigPda } from "../pda";

export async function setRouter(
  program: Program<PaymentGpuMarketplace>,
  signer: PublicKey,
  args: {
    poolState: PublicKey,
    cpSwapProgram: PublicKey,
  }
) {
  const configPda = getConfigPda(program.programId)[0];

  const ix = await program.methods
    .setRouter()
    .accounts({
      signer: signer,
      config: configPda,
      poolState: args.poolState,
      cpSwapProgram: args.cpSwapProgram,
    })
    .instruction();
  return {
    instruction: ix,
  };
} 