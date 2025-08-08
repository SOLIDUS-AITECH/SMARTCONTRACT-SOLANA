import { BN, Program } from "@coral-xyz/anchor";
import { PaymentGpuMarketplace } from "../payment_gpu_marketplace";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { getAuthorityPda, getConfigPda, getProgramTokenVaultPda } from "../pda";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";

export async function deposit(
    program: Program<PaymentGpuMarketplace>,
    signer: PublicKey,
    args: {
        amountAitech: BN;
        extraData: Buffer;
    }
) {
    const configPda = getConfigPda(program.programId)[0];
    const configData = await program.account.config.fetch(configPda);

    const authorityPda = getAuthorityPda(program.programId)[0];
    const programTokenVault = getProgramTokenVaultPda(
        program.programId,
        configData.aitechToken
    )[0];

    const signerTokenAccount = getAssociatedTokenAddressSync(
        configData.aitechToken,
        signer
    );

    const ix = await program.methods
        .deposit(args.amountAitech, args.extraData)
        .accounts({
            signer: signer,
            signerTokenAccount: signerTokenAccount,
            authority: authorityPda,
            programTokenVault: programTokenVault,
            config: configPda,
            aitechToken: configData.aitechToken,
            stakingWallet: configData.stakingWallet,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
        })
        .instruction();
    return {
        instruction: ix,
        configPda: configPda,
    };
}
