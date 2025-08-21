import { BN, Program } from "@coral-xyz/anchor";
import { PaymentGpuMarketplace } from "../payment_gpu_marketplace";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { getAuthorityPda, getConfigPda, getProgramTokenVaultPda } from "../pda";
import { createAssociatedTokenAccountInstruction, getAccount, getAssociatedTokenAddressSync, getOrCreateAssociatedTokenAccount, TOKEN_PROGRAM_ID } from "@solana/spl-token";

export async function emergencyWithdraw(
    program: Program<PaymentGpuMarketplace>,
    signer: PublicKey,
    args: {
        amountAitech: BN;
    }
) {
    const configPda = getConfigPda(program.programId)[0];
    const configData = await program.account.config.fetch(configPda);

    const authorityPda = getAuthorityPda(program.programId)[0];
    const programTokenVault = getProgramTokenVaultPda(
        program.programId,
        configData.aitechToken
    )[0];

    const signerAta = getAssociatedTokenAddressSync(
        configData.aitechToken,
        signer
    );
    let instruction = [];
    try {
        await getAccount(program.provider.connection, signerAta);
    } catch (error) {
        instruction.push(createAssociatedTokenAccountInstruction(
            signer,
            signerAta,
            signer,
            configData.aitechToken,
        ));
    }

    instruction.push(await program.methods
        .emergencyWithdraw(args.amountAitech)
        .accounts({
            signer: signer,
            authority: authorityPda,
            programTokenVault: programTokenVault,
            config: configPda,
            aitechToken: configData.aitechToken,
            aitechTokenProgram: TOKEN_PROGRAM_ID,
            signerWallet: signerAta,
            systemProgram: SystemProgram.programId,
        })
        .instruction());
    

    
    return {
        instruction: instruction,
        configPda: configPda,
    };
}
