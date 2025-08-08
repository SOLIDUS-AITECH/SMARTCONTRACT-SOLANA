import {
    pause,
    scaffoldProgram,
    sendTransaction,
    setBurnRate,
    setFeeRate,
    setStakingRate,
    unpause,
} from "../sdk";

async function main() {
    const { PaymentGpuMarketplaceProgram, provider, signer } =
        scaffoldProgram("owner.json");

    const { instruction: pauseIx } = await pause(
        PaymentGpuMarketplaceProgram,
        signer.publicKey
    );
    const { instruction: setFeeRateIx } = await setFeeRate(
        PaymentGpuMarketplaceProgram,
        signer.publicKey,
        {
            feeRate: 100,
        }
    );
    const { instruction: setStakingRateIx } = await setStakingRate(
        PaymentGpuMarketplaceProgram,
        signer.publicKey,
        {
            stakingRate: 100,
        }
    );
    const { instruction: setBurnRateIx } = await setBurnRate(
        PaymentGpuMarketplaceProgram,
        signer.publicKey,
        {
            burnRate: 100,
        }
    );
    const { instruction: unpauseIx } = await unpause(
        PaymentGpuMarketplaceProgram,
        signer.publicKey
    );

    await sendTransaction(
        provider,
        [pauseIx, setFeeRateIx, setStakingRateIx, setBurnRateIx, unpauseIx],
        { loggerIdentity: "setRate" },
        signer.payer
    );
}

main();
