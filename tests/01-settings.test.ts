import { config, expect } from "chai";
import { emergencyWithdraw, getProgramTokenVaultPda, initialize, pause, PaymentGpuMarketplace, setBurnRate, setFeeRate, setFeeWallet, setMaximumWithdraw, setMinimumWithdraw, setRouter, setStakingRate, setStakingWallet, setToken, setWithdrawSigner, unpause, updateConfig } from "../sdk";
import { Program } from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";
import { boilerPlateReduction, sleepSeconds } from "./utils/helpers";
import { AITECH_TOKEN, FEE_WALLET_KEYPAIR, OWNER_KEYPAIR, REST_KEYPAIR, STAKING_WALLET_KEYPAIR, WITHDRAW_SIGNER_KEYPAIR } from "./utils/consts";
import { Account as TokenAccount, createMint, createTransferInstruction, getAccount, getOrCreateAssociatedTokenAccount, transfer } from "@solana/spl-token";
import { BN } from "bn.js";
import { Keypair, PublicKey } from '@solana/web3.js'

describe("01. Payment:settings test", async function () {
  anchor.setProvider(anchor.AnchorProvider.env());
  const provider = anchor.getProvider();
  const PaymentContract = anchor.workspace
      .PaymentGpuMarketplace as Program<PaymentGpuMarketplace>;

  const { expectIxToSucceed, expectIxToFailWithError } = boilerPlateReduction(
      provider.connection,
      OWNER_KEYPAIR
  );

  const initializeArgs = {
    feeRate: 100, // 1%
		stakingRate: 100, // 1%
		burnRate: 100, // 1%
		minimumWithdraw: new BN("1000000000"), // 1 AITECH
		maximumWithdraw: new BN("1000000000000000000"), // 1,000,000,000 AITECH
		owner: OWNER_KEYPAIR.publicKey,
		withdrawSigner: WITHDRAW_SIGNER_KEYPAIR.publicKey,
    poolState: new PublicKey("11111111111111111111111111111111"),
    cpSwapProgram: new PublicKey("CPMDWBwJDtYax9qW7AyRuVC19Cc4L4Vcy4n2BHAbHkCW"),
  }
  let configPda: anchor.web3.PublicKey;
  let configData: Awaited<ReturnType<typeof PaymentContract.account.config.fetch>>

  let feeWallet: TokenAccount;
  let stakingWallet: TokenAccount;
  before(async () => {
    feeWallet = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      FEE_WALLET_KEYPAIR,
      AITECH_TOKEN.publicKey,
      FEE_WALLET_KEYPAIR.publicKey
    )
    stakingWallet = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      STAKING_WALLET_KEYPAIR,
      AITECH_TOKEN.publicKey,
      STAKING_WALLET_KEYPAIR.publicKey
    )
  });

  describe('Initialize', () => {
    it("TC-057: constructor invalid feeWallet", async () => {
      const { instruction: initializeIx } = await initialize(
        PaymentContract,
        OWNER_KEYPAIR.publicKey,
        AITECH_TOKEN.publicKey,
        FEE_WALLET_KEYPAIR.publicKey,
        stakingWallet.address,
        initializeArgs
      );
      expectIxToFailWithError(initializeIx, "InvalidAddress", [OWNER_KEYPAIR]);
    });

    it("TC-058: constructor invalid stakingWallet", async () => {
      const { instruction: initializeIx } = await initialize(
        PaymentContract,
        OWNER_KEYPAIR.publicKey,
        AITECH_TOKEN.publicKey,
        feeWallet.address,
        STAKING_WALLET_KEYPAIR.publicKey,
        initializeArgs
      );
      expectIxToFailWithError(initializeIx, "InvalidAddress", [OWNER_KEYPAIR]);
    });

    it("TC-060: constructor invalid AiTech", async () => {
      const { instruction: initializeIx } = await initialize(
        PaymentContract,
        OWNER_KEYPAIR.publicKey,
        new PublicKey("11111111111111111111111111111111"),
        feeWallet.address,
        stakingWallet.address,
        initializeArgs
      );
      expectIxToFailWithError(initializeIx, "InvalidAddress", [OWNER_KEYPAIR]);
    });

    it("TC-063: initialize success", async () => {
      const { instruction, configPda: configPda_ } = await initialize(
        PaymentContract,
        OWNER_KEYPAIR.publicKey,
        AITECH_TOKEN.publicKey,
        feeWallet.address,
        stakingWallet.address,
        initializeArgs
      );
      await expectIxToSucceed(instruction, [OWNER_KEYPAIR]);

      configPda = configPda_;
      configData = await PaymentContract.account.config.fetch(configPda);
      expect(configData.feeRate).to.be.equal(initializeArgs.feeRate);
      expect(configData.stakingRate).to.be.equal(initializeArgs.stakingRate);
      expect(configData.burnRate).to.be.equal(initializeArgs.burnRate);
      expect(configData.minimumWithdraw.toString()).to.be.equal(initializeArgs.minimumWithdraw.toString());
      expect(configData.maximumWithdraw.toString()).to.be.equal(initializeArgs.maximumWithdraw.toString());
      expect(configData.owner.toString()).to.be.equal(initializeArgs.owner.toString());
      expect(configData.withdrawSigner.toString()).to.be.equal(initializeArgs.withdrawSigner.toString());
    })

    it("TC-064: update configuration should fail when caller is not owner", async () => {
      const { instruction: pauseIx } = await pause(PaymentContract, OWNER_KEYPAIR.publicKey);
      const { instruction: updateConfigIx } = await updateConfig(
        PaymentContract,
        REST_KEYPAIR[0].publicKey,
        {
          feeRate: 101,
          stakingRate: 101,
          burnRate: 101,
          minimumWithdraw: new BN("1010000000"),
          maximumWithdraw: new BN("1000100000000000000"),
          feeWallet: feeWallet.address,
          stakingWallet: stakingWallet.address
        }
      )
      const { instruction: unpauseIx } = await unpause(PaymentContract, OWNER_KEYPAIR.publicKey);
      await expectIxToFailWithError(
        [pauseIx, updateConfigIx, unpauseIx],
        "NotOwner",
        [OWNER_KEYPAIR, REST_KEYPAIR[0]]
      );
    });
  })

  //** setBurnRate */
  describe('setBurnRate', () => {
    const NEW_BURN_RATE = 900;

    it("TC-001: setBurnRate success: set new setBurnRate 9%", async () => {
      const { instruction: pauseIx } = await pause(PaymentContract, OWNER_KEYPAIR.publicKey);
      const { instruction: setBurnRateIx } = await setBurnRate(PaymentContract, OWNER_KEYPAIR.publicKey, { burnRate: NEW_BURN_RATE });
      const { instruction: unpauseIx } = await unpause(PaymentContract, OWNER_KEYPAIR.publicKey);
  
      await expectIxToSucceed([pauseIx, setBurnRateIx, unpauseIx], [OWNER_KEYPAIR]);
  
      configData = await PaymentContract.account.config.fetch(configPda);
      expect(configData.burnRate).to.be.equal(NEW_BURN_RATE);
  
    });
  
    it("TC-002: setBurnRate fail when not pause contract", async () => {
      const { instruction: setBurnRateIx } = await setBurnRate(PaymentContract, OWNER_KEYPAIR.publicKey, { burnRate: NEW_BURN_RATE });
      await expectIxToFailWithError(
        setBurnRateIx,
        "NotPaused",
        [OWNER_KEYPAIR]
      );
    });
  
    it("TC-003: setBurnRate fail when caller is not owner", async () => {
      const { instruction: pauseIx } = await pause(PaymentContract, OWNER_KEYPAIR.publicKey);
      const { instruction: setBurnRateIx } = await setBurnRate(PaymentContract, REST_KEYPAIR[0].publicKey, { burnRate: NEW_BURN_RATE });
      const { instruction: unpauseIx } = await unpause(PaymentContract, OWNER_KEYPAIR.publicKey);
  
      await expectIxToFailWithError(
        [pauseIx, setBurnRateIx, unpauseIx],
        "NotOwner",
        [OWNER_KEYPAIR, REST_KEYPAIR[0]]
      );
    });
  
    it("TC-004: setBurnRate fail: burnRate 100%", async () => {
      const NEW_BURN_RATE = 10000;
      const { instruction: pauseIx } = await pause(PaymentContract, OWNER_KEYPAIR.publicKey);
      const { instruction: setBurnRateIx } = await setBurnRate(PaymentContract, OWNER_KEYPAIR.publicKey, { burnRate: NEW_BURN_RATE });
      const { instruction: unpauseIx } = await unpause(PaymentContract, OWNER_KEYPAIR.publicKey);

      await expectIxToFailWithError(
        [pauseIx, setBurnRateIx, unpauseIx],
        "InvalidRate",
        [OWNER_KEYPAIR]
      );
    });
  })

  describe('setStakingRate', () => { 
    const NEW_STAKING_RATE = 900;

    it("TC-005: stakingRate success: set new stakingRate 9%", async () => {
      const { instruction: pauseIx } = await pause(PaymentContract, OWNER_KEYPAIR.publicKey);
      const { instruction: setStakingRateIx } = await setStakingRate(PaymentContract, OWNER_KEYPAIR.publicKey, { stakingRate: NEW_STAKING_RATE });
      const { instruction: unpauseIx } = await unpause(PaymentContract, OWNER_KEYPAIR.publicKey);
      await expectIxToSucceed([pauseIx, setStakingRateIx, unpauseIx], [OWNER_KEYPAIR]);
      configData = await PaymentContract.account.config.fetch(configPda);
      expect(configData.stakingRate).to.be.equal(NEW_STAKING_RATE);
    });

    it("TC-006: stakingRate fail when not pause contract", async () => {
      const { instruction: setStakingRateIx } = await setStakingRate(PaymentContract, OWNER_KEYPAIR.publicKey, { stakingRate: NEW_STAKING_RATE });
      await expectIxToFailWithError(
        setStakingRateIx,
        "NotPaused",
        [OWNER_KEYPAIR]
      );
    });

    it("TC-007: stakingRate fail when caller is not owner", async () => {
      const { instruction: pauseIx } = await pause(PaymentContract, OWNER_KEYPAIR.publicKey);
      const { instruction: setStakingRateIx } = await setStakingRate(PaymentContract, REST_KEYPAIR[0].publicKey, { stakingRate: NEW_STAKING_RATE });
      const { instruction: unpauseIx } = await unpause(PaymentContract, OWNER_KEYPAIR.publicKey);

      await expectIxToFailWithError(
        [pauseIx, setStakingRateIx, unpauseIx],
        "NotOwner",
        [OWNER_KEYPAIR, REST_KEYPAIR[0]]
      );
    });

    it("TC-008: stakingRate fail: stakingRate 100%", async () => {
      const NEW_STAKING_RATE = 10000;
      const { instruction: pauseIx } = await pause(PaymentContract, OWNER_KEYPAIR.publicKey);
      const { instruction: setStakingRateIx } = await setStakingRate(PaymentContract, OWNER_KEYPAIR.publicKey, { stakingRate: NEW_STAKING_RATE });
      const { instruction: unpauseIx } = await unpause(PaymentContract, OWNER_KEYPAIR.publicKey);

      await expectIxToFailWithError(
        [pauseIx, setStakingRateIx, unpauseIx],
        "InvalidRate",
        [OWNER_KEYPAIR]
      );
    });
  })

  describe('setFeeRate', () => { 
    const NEW_FEE_RATE = 900;

    it("TC-009: setFeeRate success: set new setFeeRate 9%", async () => {
      const { instruction: pauseIx } = await pause(PaymentContract, OWNER_KEYPAIR.publicKey);
      const { instruction: setFeeRateIx } = await setFeeRate(PaymentContract, OWNER_KEYPAIR.publicKey, { feeRate: NEW_FEE_RATE });
      const { instruction: unpauseIx } = await unpause(PaymentContract, OWNER_KEYPAIR.publicKey);
      await expectIxToSucceed([pauseIx, setFeeRateIx, unpauseIx], [OWNER_KEYPAIR]);
      configData = await PaymentContract.account.config.fetch(configPda);
      expect(configData.feeRate).to.be.equal(NEW_FEE_RATE);
    });

    it("TC-010: setFeeRate fail when not pause contract", async () => {
      const { instruction: setFeeRateIx } = await setFeeRate(PaymentContract, OWNER_KEYPAIR.publicKey, { feeRate: NEW_FEE_RATE });
      await expectIxToFailWithError(
        setFeeRateIx,
        "NotPaused",
        [OWNER_KEYPAIR]
      );
    });

    it("TC-011: setFeeRate fail when caller is not owner", async () => {
      const { instruction: pauseIx } = await pause(PaymentContract, OWNER_KEYPAIR.publicKey);
      const { instruction: setFeeRateIx } = await setFeeRate(PaymentContract, REST_KEYPAIR[0].publicKey, { feeRate: NEW_FEE_RATE });
      const { instruction: unpauseIx } = await unpause(PaymentContract, OWNER_KEYPAIR.publicKey);

      await expectIxToFailWithError(
        [pauseIx, setFeeRateIx, unpauseIx],
        "NotOwner",
        [OWNER_KEYPAIR, REST_KEYPAIR[0]]
      );
    });

    it("TC-012: setFeeRate fail: stakingRate 10%", async () => {
      const NEW_FEE_RATE = 10000;
      const { instruction: pauseIx } = await pause(PaymentContract, OWNER_KEYPAIR.publicKey);
      const { instruction: setFeeRateIx } = await setFeeRate(PaymentContract, OWNER_KEYPAIR.publicKey, { feeRate: NEW_FEE_RATE });
      const { instruction: unpauseIx } = await unpause(PaymentContract, OWNER_KEYPAIR.publicKey);

      await expectIxToFailWithError(
        [pauseIx, setFeeRateIx, unpauseIx],
        "InvalidRate",
        [OWNER_KEYPAIR]
      );
    });
  })

  // //** event check */
  describe('Event Check', () => { 
    it("TC-013: emit event FeeRateChange", async () => {
      const NEW_FEE_RATE = 100;
      let listener = null;
      let event = { newFeeRate: 0 };

      const { instruction: pauseIx } = await pause(PaymentContract, OWNER_KEYPAIR.publicKey);
      const { instruction: setFeeRateIx } = await setFeeRate(PaymentContract, OWNER_KEYPAIR.publicKey, { feeRate: NEW_FEE_RATE });
      const { instruction: unpauseIx } = await unpause(PaymentContract, OWNER_KEYPAIR.publicKey);


      [event] = await new Promise(async (resolve, _reject) => {
        listener = PaymentContract.addEventListener("FeeRateChange", (eventData) => {
            resolve([eventData]);
        });
        await expectIxToSucceed([pauseIx, setFeeRateIx, unpauseIx], [OWNER_KEYPAIR]);
      });

      expect(event.newFeeRate).eq(NEW_FEE_RATE);

      PaymentContract.removeEventListener(listener);
    });

    it("TC-014: emit event BurnRateChange", async () => {
      const NEW_BURN_RATE = 100;
      let listener = null;
      let event = { newBurnRate: 0 };

      const { instruction: pauseIx } = await pause(PaymentContract, OWNER_KEYPAIR.publicKey);
      const { instruction: setBurnRateIx } = await setBurnRate(PaymentContract, OWNER_KEYPAIR.publicKey, { burnRate: NEW_BURN_RATE });
      const { instruction: unpauseIx } = await unpause(PaymentContract, OWNER_KEYPAIR.publicKey);

      [event] = await new Promise(async (resolve, _reject) => {
        listener = PaymentContract.addEventListener("BurnRateChange", (eventData) => {
            resolve([eventData]);
        });
        await expectIxToSucceed([pauseIx, setBurnRateIx, unpauseIx], [OWNER_KEYPAIR]);
      });

      expect(event.newBurnRate).eq(NEW_BURN_RATE);

      PaymentContract.removeEventListener(listener);
    });

    it("TC-015: emit event StakingRateChange", async () => {
      const NEW_STAKING_RATE = 100;
      let listener = null;
      let event = { newStakingRate: 0 };

      const { instruction: pauseIx } = await pause(PaymentContract, OWNER_KEYPAIR.publicKey);
      const { instruction: setStakingRateIx } = await setStakingRate(PaymentContract, OWNER_KEYPAIR.publicKey, { stakingRate: NEW_STAKING_RATE });
      const { instruction: unpauseIx } = await unpause(PaymentContract, OWNER_KEYPAIR.publicKey);
      
      [event] = await new Promise(async (resolve) => {
        listener = PaymentContract.addEventListener("StakingRateChange", (eventData) => {
            resolve([eventData]);
        });
        await expectIxToSucceed([pauseIx, setStakingRateIx, unpauseIx], [OWNER_KEYPAIR]);
      });

      expect(event.newStakingRate).eq(NEW_STAKING_RATE);

      PaymentContract.removeEventListener(listener);
    });

    it("TC-016: update configuration", async () => {
      let listener = [];
      let event: any = { }

      const newFeeWallet = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        OWNER_KEYPAIR,
        AITECH_TOKEN.publicKey,
        OWNER_KEYPAIR.publicKey,
      )
      const newStakingWallet = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        OWNER_KEYPAIR,
        AITECH_TOKEN.publicKey,
        OWNER_KEYPAIR.publicKey,
      )

      const newArgs = {
        feeRate: 140, // 1.4%
        stakingRate: 140, // 1.4%
        burnRate: 140, // 1.4%
        minimumWithdraw: new BN("1100000000"), // 1.1 AITECH
        maximumWithdraw: new BN("1100000000000000000"), // 1,100,000,000 AITECH
        feeWallet: newFeeWallet.address,
        stakingWallet: newStakingWallet.address,
      }
      const { instruction: pauseIx } = await pause(PaymentContract, OWNER_KEYPAIR.publicKey);
      const { instruction: updateConfigIx } = await updateConfig(
        PaymentContract,
        OWNER_KEYPAIR.publicKey,
        newArgs
      )
      const { instruction: unpauseIx } = await unpause(PaymentContract, OWNER_KEYPAIR.publicKey);

      listener = await Promise.all([
        PaymentContract.addEventListener("FeeRateChange", (eventData) => {
          event = Object.assign(event, eventData);
        }),
        PaymentContract.addEventListener("StakingRateChange", (eventData) => {
          event = Object.assign(event, eventData);
        }),
        PaymentContract.addEventListener("BurnRateChange", (eventData) => {
          event = Object.assign(event, eventData);
        }),
        PaymentContract.addEventListener("MinimumWithdrawChange", (eventData) => {
          event = Object.assign(event, eventData);
        }),
        PaymentContract.addEventListener("MaximumWithdrawChange", (eventData) => {
          event = Object.assign(event, eventData);
        }),
        PaymentContract.addEventListener("FeeWalletChange", (eventData) => {
          event = Object.assign(event, eventData);
        }),
        PaymentContract.addEventListener("StakingWalletChange", (eventData) => {
          event = Object.assign(event, eventData);
        }),
      ]);
      await expectIxToSucceed([pauseIx, updateConfigIx, unpauseIx], [OWNER_KEYPAIR]);

      await sleepSeconds(1);
      await Promise.all(
        listener.map((l) => PaymentContract.removeEventListener(l))
      )

      expect(event.newMinimumWithdraw.toString()).to.be.equal(newArgs.minimumWithdraw.toString());
      expect(event.newMaximumWithdraw.toString()).to.be.equal(newArgs.maximumWithdraw.toString());
      expect(event.newFeeWallet.toString()).to.be.equal(newArgs.feeWallet.toString());
      expect(event.newStakingWallet.toString()).to.be.equal(newArgs.stakingWallet.toString());
      expect(event.newBurnRate).to.be.equal(newArgs.burnRate);
      expect(event.newStakingRate).to.be.equal(newArgs.stakingRate);
      expect(event.newFeeRate).to.be.equal(newArgs.feeRate);

      configData = await PaymentContract.account.config.fetch(configPda);
      expect(configData.feeRate).to.be.equal(newArgs.feeRate);
      expect(configData.stakingRate).to.be.equal(newArgs.stakingRate);
      expect(configData.burnRate).to.be.equal(newArgs.burnRate);
      expect(configData.minimumWithdraw.toString()).to.be.equal(newArgs.minimumWithdraw.toString());
      expect(configData.maximumWithdraw.toString()).to.be.equal(newArgs.maximumWithdraw.toString());
      expect(configData.feeWallet.toString()).to.be.equal(newArgs.feeWallet.toString());
      expect(configData.stakingWallet.toString()).to.be.equal(newArgs.stakingWallet.toString());
    });

    it("TC-017: update pause contract", async () => {
      let listener = null;
      let event

      const { instruction: pauseIx } = await pause(PaymentContract, OWNER_KEYPAIR.publicKey);

      [event] = await new Promise(async (resolve, _reject) => {
        listener = PaymentContract.addEventListener("Paused", (eventData) => {
            resolve([eventData]);
        });
        await expectIxToSucceed([pauseIx], [OWNER_KEYPAIR]);
      });
      PaymentContract.removeEventListener(listener);


      expect(event).not.undefined;

      configData = await PaymentContract.account.config.fetch(configPda);
      expect(configData.paused).to.be.equal(true);
    });


    it("TC-018: update unpause contract", async () => {
      let listener = null;
      let event;

      const { instruction: unpauseIx } = await unpause(PaymentContract, OWNER_KEYPAIR.publicKey);

      [event] = await new Promise(async (resolve, _reject) => {
        listener = PaymentContract.addEventListener("UnPaused", (eventData) => {
            resolve([eventData]);
        });
        await expectIxToSucceed([unpauseIx], [OWNER_KEYPAIR]);
      });
      PaymentContract.removeEventListener(listener);

      expect(event).not.undefined;

      configData = await PaymentContract.account.config.fetch(configPda);
      expect(configData.paused).to.be.equal(false);
    });
  });

  describe('setAiTech', () => { 
    let newAitechToken = Keypair.generate();

    it("create new AI tech token", async () => {
      await createMint(
        provider.connection,
        OWNER_KEYPAIR,
        OWNER_KEYPAIR.publicKey,
        null,
        9,
        newAitechToken,
      );
    });

    it("TC-019: setToken should fail when contract not pause", async () => {
      const { instruction: setAiTechTokenIx } = await setToken(PaymentContract, OWNER_KEYPAIR.publicKey, { newAitechToken: newAitechToken.publicKey });
      expectIxToFailWithError(setAiTechTokenIx, "NotPaused", [OWNER_KEYPAIR]);
    });

    it("TC-021: setAitech should fail when caller is not owner", async () => {
      const { instruction: pauseIx } = await pause(PaymentContract, OWNER_KEYPAIR.publicKey);
      const { instruction: setAiTechTokenIx } = await setToken(PaymentContract, REST_KEYPAIR[0].publicKey, { newAitechToken: newAitechToken.publicKey });
      const { instruction: unpauseIx } = await unpause(PaymentContract, OWNER_KEYPAIR.publicKey);

      await expectIxToFailWithError(
        [pauseIx, setAiTechTokenIx, unpauseIx],
        "NotOwner",
        [OWNER_KEYPAIR, REST_KEYPAIR[0]]
      )
    });

    it("TC-022: setAitech should success", async () => {
      const { instruction: pauseIx } = await pause(PaymentContract, OWNER_KEYPAIR.publicKey);
      const { instruction: setAiTechTokenIx } = await setToken(PaymentContract, OWNER_KEYPAIR.publicKey, { newAitechToken: newAitechToken.publicKey });

      await expectIxToSucceed([pauseIx, setAiTechTokenIx], [OWNER_KEYPAIR]);

      configData = await PaymentContract.account.config.fetch(configPda);
      expect(configData.aitechToken.toString()).to.be.equal(newAitechToken.publicKey.toString());

      // reset back to main Aitech token
      const { instruction: resetAitechTokenIx } = await setToken(PaymentContract, OWNER_KEYPAIR.publicKey, { newAitechToken: AITECH_TOKEN.publicKey });
      const { instruction: unpauseIx } = await unpause(PaymentContract, OWNER_KEYPAIR.publicKey);

      await expectIxToSucceed([resetAitechTokenIx, unpauseIx], [OWNER_KEYPAIR]);

      configData = await PaymentContract.account.config.fetch(configPda);
      expect(configData.aitechToken.toString()).to.be.equal(AITECH_TOKEN.publicKey.toString());
    });
  })

  describe('setRouter', () => {
    it("TC-023: setRouter should fail when contract not pause", async () => {
      const { instruction: setRouterIx } = await setRouter(PaymentContract, OWNER_KEYPAIR.publicKey, { poolState: new PublicKey("11111111111111111111111111111111"), cpSwapProgram: new PublicKey("CPMDWBwJDtYax9qW7AyRuVC19Cc4L4Vcy4n2BHAbHkCW") });
      expectIxToFailWithError(setRouterIx, "NotPaused", [OWNER_KEYPAIR]);
    });

    it("TC-025: setRouter should fail when caller is not owner", async () => {
      const { instruction: pauseIx } = await pause(PaymentContract, OWNER_KEYPAIR.publicKey);
      const { instruction: setRouterIx } = await setRouter(PaymentContract, REST_KEYPAIR[0].publicKey, { poolState: new PublicKey("11111111111111111111111111111111"), cpSwapProgram: new PublicKey("CPMDWBwJDtYax9qW7AyRuVC19Cc4L4Vcy4n2BHAbHkCW") });
      const { instruction: unpauseIx } = await unpause(PaymentContract, OWNER_KEYPAIR.publicKey);

      await expectIxToFailWithError(
        [pauseIx, setRouterIx, unpauseIx],
        "NotOwner",
        [OWNER_KEYPAIR, REST_KEYPAIR[0]]
      )
    });

    it("TC-026: setRouter should success", async () => {
      const { instruction: pauseIx } = await pause(PaymentContract, OWNER_KEYPAIR.publicKey);
      const { instruction: setRouterIx } = await setRouter(PaymentContract, OWNER_KEYPAIR.publicKey, { poolState: new PublicKey("11111111111111111111111111111111"), cpSwapProgram: new PublicKey("CPMDWBwJDtYax9qW7AyRuVC19Cc4L4Vcy4n2BHAbHkCW") });
      const { instruction: unpauseIx } = await unpause(PaymentContract, OWNER_KEYPAIR.publicKey);

      await expectIxToSucceed([pauseIx, setRouterIx, unpauseIx], [OWNER_KEYPAIR]);
    });

  })

  // //** setWithdrawSigner */
  describe('setWithdrawSigner', () => { 
    it("TC-027: setWithdrawSigner should fail when contract not pause", async () => {
      const { instruction: setWithdrawSignerIx } = await setWithdrawSigner(PaymentContract, OWNER_KEYPAIR.publicKey, { withdrawSigner: WITHDRAW_SIGNER_KEYPAIR.publicKey });
      expectIxToFailWithError(setWithdrawSignerIx, "NotPaused", [OWNER_KEYPAIR]);
    });

    it("TC-029: setWithdrawSigner should fail when caller is not owner", async () => {
      const { instruction: pauseIx } = await pause(PaymentContract, OWNER_KEYPAIR.publicKey);
      const { instruction: setWithdrawSignerIx } = await setWithdrawSigner(PaymentContract, REST_KEYPAIR[0].publicKey, { withdrawSigner: WITHDRAW_SIGNER_KEYPAIR.publicKey });
      const { instruction: unpauseIx } = await unpause(PaymentContract, OWNER_KEYPAIR.publicKey);

      await expectIxToFailWithError(
        [pauseIx, setWithdrawSignerIx, unpauseIx],
        "NotOwner",
        [OWNER_KEYPAIR, REST_KEYPAIR[0]]
      )
    });

    it("TC-030: setWithdrawSigner should success", async () => {
      const { instruction: pauseIx } = await pause(PaymentContract, OWNER_KEYPAIR.publicKey);
      const { instruction: setWithdrawSignerIx } = await setWithdrawSigner(PaymentContract, OWNER_KEYPAIR.publicKey, { withdrawSigner: WITHDRAW_SIGNER_KEYPAIR.publicKey });
      const { instruction: unpauseIx } = await unpause(PaymentContract, OWNER_KEYPAIR.publicKey);

      await expectIxToSucceed([pauseIx, setWithdrawSignerIx, unpauseIx], [OWNER_KEYPAIR]);
    });
  })

  // //** setMinimumWithdraw */
  describe('setMinimumWithdraw', () => { 
    it("TC-031: setMinimumWithdraw should fail when contract not pause", async () => {
      const { instruction: setMinimumWithdrawIx } = await setMinimumWithdraw(PaymentContract, OWNER_KEYPAIR.publicKey, { minimumWithdraw: new BN("1000000000") });
      expectIxToFailWithError(setMinimumWithdrawIx, "NotPaused", [OWNER_KEYPAIR]);
    });
  
    it("TC-032: setMinimumWithdraw should fail when newMinimumWithdraw > maximum", async () => {
      const { instruction: pauseIx } = await pause(PaymentContract, OWNER_KEYPAIR.publicKey);
      const { instruction: setMinimumWithdrawIx } = await setMinimumWithdraw(PaymentContract, OWNER_KEYPAIR.publicKey, { minimumWithdraw: configData.maximumWithdraw.addn(100) });
      const { instruction: unpauseIx } = await unpause(PaymentContract, OWNER_KEYPAIR.publicKey);

      await expectIxToFailWithError(
        [pauseIx, setMinimumWithdrawIx, unpauseIx],
        "InvalidMinimumWithdraw",
        [OWNER_KEYPAIR]
      )
    });
  
    it("TC-033: setMinimumWithdraw should fail when caller is not owner", async () => {
      const { instruction: pauseIx } = await pause(PaymentContract, OWNER_KEYPAIR.publicKey);
      const { instruction: setMinimumWithdrawIx } = await setMinimumWithdraw(PaymentContract, REST_KEYPAIR[0].publicKey, { minimumWithdraw: new BN("1000000000") });
      const { instruction: unpauseIx } = await unpause(PaymentContract, OWNER_KEYPAIR.publicKey);

      await expectIxToFailWithError(
        [pauseIx, setMinimumWithdrawIx, unpauseIx],
        "NotOwner",
        [OWNER_KEYPAIR, REST_KEYPAIR[0]]
      )
    });
  
    it("TC-034: setMinimumWithdraw should success", async () => {
      const { instruction: pauseIx } = await pause(PaymentContract, OWNER_KEYPAIR.publicKey);
      const { instruction: setMinimumWithdrawIx } = await setMinimumWithdraw(PaymentContract, OWNER_KEYPAIR.publicKey, { minimumWithdraw: new BN("1000000000") });
      const { instruction: unpauseIx } = await unpause(PaymentContract, OWNER_KEYPAIR.publicKey);

      await expectIxToSucceed([pauseIx, setMinimumWithdrawIx, unpauseIx], [OWNER_KEYPAIR]);
    });
  })

  describe('setMaximumWithdraw', () => {
    it("TC-035: setMaximumWithdraw should fail when contract not pause", async () => {
      const { instruction: setMaximumWithdrawIx } = await setMaximumWithdraw(PaymentContract, OWNER_KEYPAIR.publicKey, { maximumWithdraw: new BN("1000000000") });
      expectIxToFailWithError(setMaximumWithdrawIx, "NotPaused", [OWNER_KEYPAIR]);
    });

    it("TC-036: setMaximumWithdraw should fail when newMaximumWithdraw < minimum", async () => {
      configData = await PaymentContract.account.config.fetch(configPda);
      const { instruction: pauseIx } = await pause(PaymentContract, OWNER_KEYPAIR.publicKey);
      const { instruction: setMaximumWithdrawIx } = await setMaximumWithdraw(PaymentContract, OWNER_KEYPAIR.publicKey, { maximumWithdraw: configData.minimumWithdraw.subn(100) });
      const { instruction: unpauseIx } = await unpause(PaymentContract, OWNER_KEYPAIR.publicKey);

      await expectIxToFailWithError(
        [pauseIx, setMaximumWithdrawIx, unpauseIx],
        "InvalidMaximumWithdraw",
        [OWNER_KEYPAIR]
      )
    });

    it("TC-037: setMaximumWithdraw should fail when caller is not owner", async () => {
      const { instruction: pauseIx } = await pause(PaymentContract, OWNER_KEYPAIR.publicKey);
      const { instruction: setMaximumWithdrawIx } = await setMaximumWithdraw(PaymentContract, REST_KEYPAIR[0].publicKey, { maximumWithdraw: new BN("1000000000") });
      const { instruction: unpauseIx } = await unpause(PaymentContract, OWNER_KEYPAIR.publicKey);

      await expectIxToFailWithError(
        [pauseIx, setMaximumWithdrawIx, unpauseIx],
        "NotOwner",
        [OWNER_KEYPAIR, REST_KEYPAIR[0]]
      )
    });

    it("TC-038: setMaximumWithdraw should success", async () => {
      const { instruction: pauseIx } = await pause(PaymentContract, OWNER_KEYPAIR.publicKey);
      const { instruction: setMaximumWithdrawIx } = await setMaximumWithdraw(PaymentContract, OWNER_KEYPAIR.publicKey, { maximumWithdraw: new BN("1000000000") });
      const { instruction: unpauseIx } = await unpause(PaymentContract, OWNER_KEYPAIR.publicKey);

      await expectIxToSucceed([pauseIx, setMaximumWithdrawIx, unpauseIx], [OWNER_KEYPAIR]);
    });
  })

  describe('setStakingWallet', () => {
    let newStakingWallet: TokenAccount;

    it ("create new staking wallet", async () => {
      newStakingWallet = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        REST_KEYPAIR[0],
        AITECH_TOKEN.publicKey,
        REST_KEYPAIR[0].publicKey,
      );
    });

    it("TC-039: setStakingWallet should fail when contract not pause", async () => {
      const { instruction: setStakingWalletIx } = await setStakingWallet(PaymentContract, OWNER_KEYPAIR.publicKey, { stakingWallet: newStakingWallet.address });
      expectIxToFailWithError(setStakingWalletIx, "NotPaused", [OWNER_KEYPAIR]);
    });

    it("TC-041: setStakingWallet should fail when caller is not owner", async () => {
      const { instruction: pauseIx } = await pause(PaymentContract, OWNER_KEYPAIR.publicKey);
      const { instruction: setStakingWalletIx } = await setStakingWallet(PaymentContract, REST_KEYPAIR[0].publicKey, { stakingWallet: newStakingWallet.address });
      const { instruction: unpauseIx } = await unpause(PaymentContract, OWNER_KEYPAIR.publicKey);

      await expectIxToFailWithError(
        [pauseIx, setStakingWalletIx, unpauseIx],
        "NotOwner",
        [OWNER_KEYPAIR, REST_KEYPAIR[0]]
      )
    });

    it("TC-042: setStakingWallet should success", async () => {
      const { instruction: pauseIx } = await pause(PaymentContract, OWNER_KEYPAIR.publicKey);
      const { instruction: setStakingWalletIx } = await setStakingWallet(PaymentContract, OWNER_KEYPAIR.publicKey, { stakingWallet: newStakingWallet.address });
      await expectIxToSucceed([pauseIx, setStakingWalletIx], [OWNER_KEYPAIR]);
      configData = await PaymentContract.account.config.fetch(configPda);
      expect(configData.stakingWallet.toString()).to.be.equal(newStakingWallet.address.toString());

      // reset
      const { instruction: resetStakingWalletIx } = await setStakingWallet(PaymentContract, OWNER_KEYPAIR.publicKey, { stakingWallet: stakingWallet.address });
      const { instruction: unpauseIx } = await unpause(PaymentContract, OWNER_KEYPAIR.publicKey);
      await expectIxToSucceed([resetStakingWalletIx, unpauseIx], [OWNER_KEYPAIR]);

      configData = await PaymentContract.account.config.fetch(configPda);
      expect(configData.stakingWallet.toString()).to.be.equal(stakingWallet.address.toString());
    });
  })
  
  describe('setFeeWallet', () => {
    let newFeeWallet: TokenAccount;

    it ("create new fee wallet", async () => {
      newFeeWallet = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        REST_KEYPAIR[0],
        AITECH_TOKEN.publicKey,
        REST_KEYPAIR[0].publicKey,
      );
    })
    it("TC-047: setFeeWallet should fail when contract not pause", async () => {
      const { instruction: setFeeWalletIx } = await setFeeWallet(PaymentContract, OWNER_KEYPAIR.publicKey, { feeWallet: newFeeWallet.address });
      expectIxToFailWithError(setFeeWalletIx, "NotPaused", [OWNER_KEYPAIR]);
    });

    it("TC-049: setFeeWallet should fail when caller is not owner", async () => {
      const { instruction: pauseIx } = await pause(PaymentContract, OWNER_KEYPAIR.publicKey);
      const { instruction: setFeeWalletIx } = await setFeeWallet(PaymentContract, REST_KEYPAIR[0].publicKey, { feeWallet: newFeeWallet.address });
      const { instruction: unpauseIx } = await unpause(PaymentContract, OWNER_KEYPAIR.publicKey);

      await expectIxToFailWithError(
        [pauseIx, setFeeWalletIx, unpauseIx],
        "NotOwner",
        [OWNER_KEYPAIR, REST_KEYPAIR[0]]
      )
    });

    it("TC-050: setFeeWallet should success", async () => {
      const { instruction: pauseIx } = await pause(PaymentContract, OWNER_KEYPAIR.publicKey);
      const { instruction: setFeeWalletIx } = await setFeeWallet(PaymentContract, OWNER_KEYPAIR.publicKey, { feeWallet: newFeeWallet.address });

      await expectIxToSucceed([pauseIx, setFeeWalletIx], [OWNER_KEYPAIR]);

      configData = await PaymentContract.account.config.fetch(configPda);
      expect(configData.feeWallet.toString()).to.be.equal(newFeeWallet.address.toString());

      // reset
      const { instruction: resetFeeWalletIx } = await setFeeWallet(PaymentContract, OWNER_KEYPAIR.publicKey, { feeWallet: feeWallet.address });
      const { instruction: unpauseIx } = await unpause(PaymentContract, OWNER_KEYPAIR.publicKey);
      await expectIxToSucceed([resetFeeWalletIx, unpauseIx], [OWNER_KEYPAIR]);

      configData = await PaymentContract.account.config.fetch(configPda);
      expect(configData.feeWallet.toString()).to.be.equal(feeWallet.address.toString());
    });
  })

  describe('setPaused', () => { 
    it("TC-051: setPaused should fail cause caller is not owner", async () => {
      const { instruction: pauseIx } = await pause(PaymentContract, REST_KEYPAIR[0].publicKey);

      await expectIxToFailWithError(
        pauseIx,
        "NotOwner",
        [REST_KEYPAIR[0]]
      );
    });
  })

  describe('emergencyWithdraw', () => {
    it("TC-052: emergencyWithdraw should fail cause caller is not owner", async () => {
      const { instruction: emergencyWithdrawIx } = await emergencyWithdraw(PaymentContract, REST_KEYPAIR[0].publicKey, { amountAitech: new BN("1000000000") });
      expectIxToFailWithError(emergencyWithdrawIx, "NotOwner", [REST_KEYPAIR[0]]);
    });

    it("TC-053: emergencyWithdraw should fail amount = 0", async () => {
      const { instruction: emergencyWithdrawIx } = await emergencyWithdraw(PaymentContract, OWNER_KEYPAIR.publicKey, { amountAitech: new BN("0") });
      expectIxToFailWithError(emergencyWithdrawIx, "ZeroAmount", [OWNER_KEYPAIR]);
    });

    it("TC-055: emergencyWithdraw success AITECH", async () => {
      const amountAitech = new BN(1000000000);
      const ownerAitechTokenAccount = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        OWNER_KEYPAIR,
        AITECH_TOKEN.publicKey,
        OWNER_KEYPAIR.publicKey,
      );
      const programTokenVault = getProgramTokenVaultPda(PaymentContract.programId, AITECH_TOKEN.publicKey)[0];

      const transferAitechIx = createTransferInstruction(
        ownerAitechTokenAccount.address,
        programTokenVault,
        OWNER_KEYPAIR.publicKey,
        amountAitech.toNumber(),
      )

      const preOwnerAitechBalance = await getAccount(provider.connection, ownerAitechTokenAccount.address);
      const { instruction: emergencyWithdrawIx } = await emergencyWithdraw(PaymentContract, OWNER_KEYPAIR.publicKey, { amountAitech: amountAitech });
      await expectIxToSucceed([transferAitechIx, emergencyWithdrawIx], [OWNER_KEYPAIR]);
      const postOwnerAitechBalance = await getAccount(provider.connection, ownerAitechTokenAccount.address);

      expect(postOwnerAitechBalance.amount).to.be.equal(preOwnerAitechBalance.amount - BigInt(amountAitech.toString()));
    });

    it("TC-056: emergencyWithdraw fail cause insufficient fund", async () => {
      const { instruction: emergencyWithdrawIx } = await emergencyWithdraw(PaymentContract, OWNER_KEYPAIR.publicKey, { amountAitech: new BN("1000000000") });
      expectIxToFailWithError(emergencyWithdrawIx, "InsufficientBalance", [OWNER_KEYPAIR]);
    });
  })
});
