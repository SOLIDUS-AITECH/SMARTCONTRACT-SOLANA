import { BN, Program } from "@coral-xyz/anchor";
import { PaymentGpuMarketplace } from "../payment_gpu_marketplace";
import { PublicKey } from "@solana/web3.js";
import { getConfigPda } from "../pda";

export async function setMaximumWithdraw(
    program: Program<PaymentGpuMarketplace>,
    signer: PublicKey,
    args: {
        maximumWithdraw: BN;
    }
) {
    const configPda = getConfigPda(program.programId)[0];

    const ix = await program.methods
        .setMaximumWithdraw(args.maximumWithdraw)
        .accounts({
            signer: signer,
            config: configPda,
        })
        .instruction();
    return {
        instruction: ix,
    };
}
