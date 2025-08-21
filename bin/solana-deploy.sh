#!/bin/bash

## Get the size of file is around 480K (~491520 bytes)
##  -> so can decided the `--max-len 501520` 489,765625 K
## If you put too low, you will get error: 
## `Error: Buffer account data size (722077) is smaller than the minimum size (723069)`
## Read more at: https://solana.com/docs/programs/deploying
## ls -lh target/deploy/<program>.so


solana program deploy \
  --url https://api.devnet.solana.com \
  --use-rpc \
  --max-len 501520 \
  --max-sign-attempts 1000 \
  --with-compute-unit-price 100 \
  --program-id keys/2025-08-21.stg-program.json \
  --keypair keys/deployer.json \
  target/deploy/payment_gpu_marketplace.so
