import { BN, Program } from "@coral-xyz/anchor";
import { PaymentGpuMarketplace } from "../payment_gpu_marketplace";
import { PublicKey } from "@solana/web3.js";
import { getConfigPda } from "../pda";

export async function setMinimumWithdraw(
    program: Program<PaymentGpuMarketplace>,
    signer: PublicKey,
    args: {
        minimumWithdraw: BN;
    }
) {
    const configPda = getConfigPda(program.programId)[0];

    const ix = await program.methods
        .setMinimumWithdraw(args.minimumWithdraw)
        .accounts({
            signer: signer,
            config: configPda,
        })
        .instruction();
    return {
        instruction: ix,
    };
}
