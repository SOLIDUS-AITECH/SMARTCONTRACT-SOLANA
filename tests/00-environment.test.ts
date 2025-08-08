import * as anchor from "@coral-xyz/anchor";
import { boilerPlateReduction } from "./utils/helpers";
import {
    AITECH_TOKEN,
    FEE_WALLET_KEYPAIR,
    GPU_OWNER_ACCOUNT_KEYPAIR,
    GPU_RENTER_ACCOUNT_KEYPAIR,
    OWNER_KEYPAIR,
    REST_KEYPAIR,
    STAKING_WALLET_KEYPAIR,
    WITHDRAW_SIGNER_KEYPAIR,
} from "./utils/consts";
import { assert } from "chai";
import { createToken } from "./utils/createToken";
import { getAccount, getAssociatedTokenAddress } from "@solana/spl-token";

describe("00. Setup Environment", () => {
    anchor.setProvider(anchor.AnchorProvider.env());
    const provider = anchor.getProvider();
    const { requestAirdrop } = boilerPlateReduction(
        provider.connection,
        OWNER_KEYPAIR
    );

    before("Airdrop", async function () {
        await Promise.all(
            [
                OWNER_KEYPAIR,
                GPU_OWNER_ACCOUNT_KEYPAIR,
                GPU_RENTER_ACCOUNT_KEYPAIR,
                FEE_WALLET_KEYPAIR,
                STAKING_WALLET_KEYPAIR,
                WITHDRAW_SIGNER_KEYPAIR,
                ...REST_KEYPAIR,
            ]
                .map((kp) => kp.publicKey)
                .map(requestAirdrop)
        );
    });

    it("should setup successfully", async () => {
        const ownerBalance = await provider.connection.getBalance(
            OWNER_KEYPAIR.publicKey
        );

        assert.isTrue(ownerBalance > 0);
    });

    it("should create assets", async () => {
        await createToken(provider.connection);

        const ownerAiTechAta = await getAssociatedTokenAddress(
            AITECH_TOKEN.publicKey,
            OWNER_KEYPAIR.publicKey
        );
        const ownerAitechBalance = await getAccount(
            provider.connection,
            ownerAiTechAta
        );
        assert.isTrue(ownerAitechBalance.amount > 0, "Failed to create assets");
    });
});
