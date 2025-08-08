import { deposit, scaffoldProgram, sendTransaction } from "../sdk";
import { BN } from "bn.js";

async function main() {
    const { PaymentGpuMarketplaceProgram, provider, signer } =
        scaffoldProgram("deployer.json");

    const extraData = Buffer.from([12, 22]);
    const amount = new BN(100000);

    const { instruction: initializeIx } = await deposit(
        PaymentGpuMarketplaceProgram,
        signer.publicKey,
        {
            amountAitech: amount,
            extraData: extraData,
        }
    );

    await sendTransaction(
        provider,
        initializeIx,
        { loggerIdentity: "deposit" },
        signer.payer
    );
}

main();
