import { Program } from "@coral-xyz/anchor";
import { PaymentGpuMarketplace } from "../payment_gpu_marketplace";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { getAuthorityPda, getConfigPda, getProgramTokenVaultPda } from "../pda";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

export async function setToken(
  program: Program<PaymentGpuMarketplace>,
  signer: PublicKey,
  args: {
    newAitechToken: PublicKey,
  }
) {
  const configPda = getConfigPda(program.programId)[0];
  const authorityPda = getAuthorityPda(program.programId)[0];

  const configData = await program.account.config.fetch(configPda);
  
  // Get current token vault PDA
  const currentTokenVaultPda = getProgramTokenVaultPda(program.programId, configData.aitechToken)[0];
  
  // Get new token vault PDA
  const newTokenVaultPda = getProgramTokenVaultPda(program.programId, args.newAitechToken)[0];

  const ix = await program.methods
    .setToken()
    .accounts({
      signer: signer,
      authority: authorityPda,
      config: configPda,
      newAitechToken: args.newAitechToken,
      aitechToken: configData.aitechToken,
      programTokenVault: currentTokenVaultPda,
      newProgramTokenVault: newTokenVaultPda,
      feeWallet: configData.feeWallet,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
  return {
    instruction: ix,
  };
} 