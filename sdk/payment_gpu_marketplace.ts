export type PaymentGpuMarketplace = {
  "version": "0.1.0",
  "name": "payment_gpu_marketplace",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aitechToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "programTokenVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "feeWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakingWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "feeRate",
          "type": "u16"
        },
        {
          "name": "stakingRate",
          "type": "u16"
        },
        {
          "name": "burnRate",
          "type": "u16"
        },
        {
          "name": "minimumWithdraw",
          "type": "u64"
        },
        {
          "name": "maximumWithdraw",
          "type": "u64"
        },
        {
          "name": "owner",
          "type": "publicKey"
        },
        {
          "name": "withdrawSigner",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "pause",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "The signer account"
          ]
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "The game state"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "unpause",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "The admin account"
          ]
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "The game state"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "updateConfig",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "feeWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakingWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "feeRate",
          "type": "u16"
        },
        {
          "name": "stakingRate",
          "type": "u16"
        },
        {
          "name": "burnRate",
          "type": "u16"
        },
        {
          "name": "minimumWithdraw",
          "type": "u64"
        },
        {
          "name": "maximumWithdraw",
          "type": "u64"
        }
      ]
    },
    {
      "name": "setMaximumWithdraw",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newMaximumWithdraw",
          "type": "u64"
        }
      ]
    },
    {
      "name": "setMinimumWithdraw",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newMinimumWithdraw",
          "type": "u64"
        }
      ]
    },
    {
      "name": "setWithdrawSigner",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newWithdrawSigner",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "setStakingWallet",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakingWallet",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "setStakingRate",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newStakingRate",
          "type": "u16"
        }
      ]
    },
    {
      "name": "setBurnRate",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newBurnRate",
          "type": "u16"
        }
      ]
    },
    {
      "name": "setFeeWallet",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "feeWallet",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "setFeeRate",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newFeeRate",
          "type": "u16"
        }
      ]
    },
    {
      "name": "setToken",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "newAitechToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aitechToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "programTokenVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "newProgramTokenVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "feeWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "emergencyWithdraw",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "programTokenVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aitechToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aitechTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "feeWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "deposit",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "signerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "programTokenVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aitechToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakingWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amountAitech",
          "type": "u64"
        },
        {
          "name": "extraData",
          "type": "bytes"
        }
      ]
    },
    {
      "name": "withdraw",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "withdrawSigner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "signerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "withdrawRequest",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "programTokenVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aitechToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aitechTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "feeWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "withdrawRequestId",
          "type": "u64"
        },
        {
          "name": "withdrawRequestTimestamp",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "config",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authorityBump",
            "type": "u8"
          },
          {
            "name": "programTokenVaultBump",
            "type": "u8"
          },
          {
            "name": "paused",
            "type": "bool"
          },
          {
            "name": "feeRate",
            "type": "u16"
          },
          {
            "name": "stakingRate",
            "type": "u16"
          },
          {
            "name": "burnRate",
            "type": "u16"
          },
          {
            "name": "minimumWithdraw",
            "type": "u64"
          },
          {
            "name": "maximumWithdraw",
            "type": "u64"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "withdrawSigner",
            "type": "publicKey"
          },
          {
            "name": "aitechToken",
            "type": "publicKey"
          },
          {
            "name": "feeWallet",
            "type": "publicKey"
          },
          {
            "name": "stakingWallet",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "withdrawal",
      "type": {
        "kind": "struct",
        "fields": []
      }
    }
  ],
  "events": [
    {
      "name": "Paused",
      "fields": []
    },
    {
      "name": "UnPaused",
      "fields": []
    },
    {
      "name": "MaximumWithdrawChange",
      "fields": [
        {
          "name": "newMaximumWithdraw",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "MinimumWithdrawChange",
      "fields": [
        {
          "name": "newMinimumWithdraw",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "WithdrawSignerChange",
      "fields": [
        {
          "name": "newWithdrawSigner",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "StakingWalletChange",
      "fields": [
        {
          "name": "newStakingWallet",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "FeeWalletChange",
      "fields": [
        {
          "name": "newFeeWallet",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "StakingRateChange",
      "fields": [
        {
          "name": "newStakingRate",
          "type": "u16",
          "index": false
        }
      ]
    },
    {
      "name": "BurnRateChange",
      "fields": [
        {
          "name": "newBurnRate",
          "type": "u16",
          "index": false
        }
      ]
    },
    {
      "name": "FeeRateChange",
      "fields": [
        {
          "name": "newFeeRate",
          "type": "u16",
          "index": false
        }
      ]
    },
    {
      "name": "Deposit",
      "fields": [
        {
          "name": "from",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "amountAitech",
          "type": "u64",
          "index": false
        },
        {
          "name": "transferAmount",
          "type": "u64",
          "index": false
        },
        {
          "name": "burnAmount",
          "type": "u64",
          "index": false
        },
        {
          "name": "stakingAmount",
          "type": "u64",
          "index": false
        },
        {
          "name": "extraData",
          "type": "bytes",
          "index": false
        }
      ]
    },
    {
      "name": "Withdraw",
      "fields": [
        {
          "name": "to",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "tokenOut",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        },
        {
          "name": "swapAmount",
          "type": "u64",
          "index": false
        },
        {
          "name": "feeAmount",
          "type": "u64",
          "index": false
        },
        {
          "name": "withdrawRequestId",
          "type": "u64",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "Paused",
      "msg": "Contract was paused"
    },
    {
      "code": 6001,
      "name": "NotPaused",
      "msg": "Contract was not paused"
    },
    {
      "code": 6002,
      "name": "NotOwner",
      "msg": "Caller is not the Owner"
    },
    {
      "code": 6003,
      "name": "InvalidMaximumWithdraw",
      "msg": "New maximum withdraw must be greater than minimum withdraw"
    },
    {
      "code": 6004,
      "name": "InvalidMinimumWithdraw",
      "msg": "New minimum withdraw must be less than maximum withdraw"
    },
    {
      "code": 6005,
      "name": "InvalidAddress",
      "msg": "Invalid address"
    },
    {
      "code": 6006,
      "name": "InvalidRate",
      "msg": "Invalid rate"
    },
    {
      "code": 6007,
      "name": "ZeroAmount",
      "msg": "Amount must be greater than 0"
    },
    {
      "code": 6008,
      "name": "MathOverflow",
      "msg": "Math overflow"
    },
    {
      "code": 6009,
      "name": "InvalidBump",
      "msg": "Invalid bump"
    },
    {
      "code": 6010,
      "name": "AmountLowerThanMinimumWithdraw",
      "msg": "Amount must be greater than minimum withdraw"
    },
    {
      "code": 6011,
      "name": "AmountGreaterThanMaximumWithdraw",
      "msg": "Amount must be less than maximum withdraw"
    },
    {
      "code": 6012,
      "name": "TransactionTimeout",
      "msg": "Transaction timeout"
    },
    {
      "code": 6013,
      "name": "InsufficientBalance",
      "msg": "Insufficient balance"
    }
  ]
};

export const IDL: PaymentGpuMarketplace = {
  "version": "0.1.0",
  "name": "payment_gpu_marketplace",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aitechToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "programTokenVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "feeWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakingWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "feeRate",
          "type": "u16"
        },
        {
          "name": "stakingRate",
          "type": "u16"
        },
        {
          "name": "burnRate",
          "type": "u16"
        },
        {
          "name": "minimumWithdraw",
          "type": "u64"
        },
        {
          "name": "maximumWithdraw",
          "type": "u64"
        },
        {
          "name": "owner",
          "type": "publicKey"
        },
        {
          "name": "withdrawSigner",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "pause",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "The signer account"
          ]
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "The game state"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "unpause",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "The admin account"
          ]
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "The game state"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "updateConfig",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "feeWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakingWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "feeRate",
          "type": "u16"
        },
        {
          "name": "stakingRate",
          "type": "u16"
        },
        {
          "name": "burnRate",
          "type": "u16"
        },
        {
          "name": "minimumWithdraw",
          "type": "u64"
        },
        {
          "name": "maximumWithdraw",
          "type": "u64"
        }
      ]
    },
    {
      "name": "setMaximumWithdraw",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newMaximumWithdraw",
          "type": "u64"
        }
      ]
    },
    {
      "name": "setMinimumWithdraw",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newMinimumWithdraw",
          "type": "u64"
        }
      ]
    },
    {
      "name": "setWithdrawSigner",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newWithdrawSigner",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "setStakingWallet",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakingWallet",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "setStakingRate",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newStakingRate",
          "type": "u16"
        }
      ]
    },
    {
      "name": "setBurnRate",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newBurnRate",
          "type": "u16"
        }
      ]
    },
    {
      "name": "setFeeWallet",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "feeWallet",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "setFeeRate",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newFeeRate",
          "type": "u16"
        }
      ]
    },
    {
      "name": "setToken",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "newAitechToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aitechToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "programTokenVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "newProgramTokenVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "feeWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "emergencyWithdraw",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "programTokenVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aitechToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aitechTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "feeWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "deposit",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "signerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "programTokenVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aitechToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakingWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amountAitech",
          "type": "u64"
        },
        {
          "name": "extraData",
          "type": "bytes"
        }
      ]
    },
    {
      "name": "withdraw",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "withdrawSigner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "signerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "withdrawRequest",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "programTokenVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aitechToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aitechTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "feeWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "withdrawRequestId",
          "type": "u64"
        },
        {
          "name": "withdrawRequestTimestamp",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "config",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authorityBump",
            "type": "u8"
          },
          {
            "name": "programTokenVaultBump",
            "type": "u8"
          },
          {
            "name": "paused",
            "type": "bool"
          },
          {
            "name": "feeRate",
            "type": "u16"
          },
          {
            "name": "stakingRate",
            "type": "u16"
          },
          {
            "name": "burnRate",
            "type": "u16"
          },
          {
            "name": "minimumWithdraw",
            "type": "u64"
          },
          {
            "name": "maximumWithdraw",
            "type": "u64"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "withdrawSigner",
            "type": "publicKey"
          },
          {
            "name": "aitechToken",
            "type": "publicKey"
          },
          {
            "name": "feeWallet",
            "type": "publicKey"
          },
          {
            "name": "stakingWallet",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "withdrawal",
      "type": {
        "kind": "struct",
        "fields": []
      }
    }
  ],
  "events": [
    {
      "name": "Paused",
      "fields": []
    },
    {
      "name": "UnPaused",
      "fields": []
    },
    {
      "name": "MaximumWithdrawChange",
      "fields": [
        {
          "name": "newMaximumWithdraw",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "MinimumWithdrawChange",
      "fields": [
        {
          "name": "newMinimumWithdraw",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "WithdrawSignerChange",
      "fields": [
        {
          "name": "newWithdrawSigner",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "StakingWalletChange",
      "fields": [
        {
          "name": "newStakingWallet",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "FeeWalletChange",
      "fields": [
        {
          "name": "newFeeWallet",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "StakingRateChange",
      "fields": [
        {
          "name": "newStakingRate",
          "type": "u16",
          "index": false
        }
      ]
    },
    {
      "name": "BurnRateChange",
      "fields": [
        {
          "name": "newBurnRate",
          "type": "u16",
          "index": false
        }
      ]
    },
    {
      "name": "FeeRateChange",
      "fields": [
        {
          "name": "newFeeRate",
          "type": "u16",
          "index": false
        }
      ]
    },
    {
      "name": "Deposit",
      "fields": [
        {
          "name": "from",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "amountAitech",
          "type": "u64",
          "index": false
        },
        {
          "name": "transferAmount",
          "type": "u64",
          "index": false
        },
        {
          "name": "burnAmount",
          "type": "u64",
          "index": false
        },
        {
          "name": "stakingAmount",
          "type": "u64",
          "index": false
        },
        {
          "name": "extraData",
          "type": "bytes",
          "index": false
        }
      ]
    },
    {
      "name": "Withdraw",
      "fields": [
        {
          "name": "to",
          "type": "publicKey",
          "index": true
        },
        {
          "name": "tokenOut",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        },
        {
          "name": "swapAmount",
          "type": "u64",
          "index": false
        },
        {
          "name": "feeAmount",
          "type": "u64",
          "index": false
        },
        {
          "name": "withdrawRequestId",
          "type": "u64",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "Paused",
      "msg": "Contract was paused"
    },
    {
      "code": 6001,
      "name": "NotPaused",
      "msg": "Contract was not paused"
    },
    {
      "code": 6002,
      "name": "NotOwner",
      "msg": "Caller is not the Owner"
    },
    {
      "code": 6003,
      "name": "InvalidMaximumWithdraw",
      "msg": "New maximum withdraw must be greater than minimum withdraw"
    },
    {
      "code": 6004,
      "name": "InvalidMinimumWithdraw",
      "msg": "New minimum withdraw must be less than maximum withdraw"
    },
    {
      "code": 6005,
      "name": "InvalidAddress",
      "msg": "Invalid address"
    },
    {
      "code": 6006,
      "name": "InvalidRate",
      "msg": "Invalid rate"
    },
    {
      "code": 6007,
      "name": "ZeroAmount",
      "msg": "Amount must be greater than 0"
    },
    {
      "code": 6008,
      "name": "MathOverflow",
      "msg": "Math overflow"
    },
    {
      "code": 6009,
      "name": "InvalidBump",
      "msg": "Invalid bump"
    },
    {
      "code": 6010,
      "name": "AmountLowerThanMinimumWithdraw",
      "msg": "Amount must be greater than minimum withdraw"
    },
    {
      "code": 6011,
      "name": "AmountGreaterThanMaximumWithdraw",
      "msg": "Amount must be less than maximum withdraw"
    },
    {
      "code": 6012,
      "name": "TransactionTimeout",
      "msg": "Transaction timeout"
    },
    {
      "code": 6013,
      "name": "InsufficientBalance",
      "msg": "Insufficient balance"
    }
  ]
};
