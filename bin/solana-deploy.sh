#!/bin/bash

## Get the size of file is around 480K (~491520 bytes)
##  -> so can decided the `--max-len 501520` 489,765625 K
## If you put too low, you will get error: 
## `Error: Buffer account data size (722077) is smaller than the minimum size (723069)`
## Read more at: https://solana.com/docs/programs/deploying
## ls -lh target/deploy/<program>.so

RPC_URL=$1
PROGRAM_ID=$2
DEPLOYER_KEYPAIR=$3

solana program deploy \
  --url $RPC_URL \
  --use-rpc \
  --max-len 501520 \
  --max-sign-attempts 1000 \
  --with-compute-unit-price 100 \
  --program-id $PROGRAM_ID \
  --keypair $DEPLOYER_KEYPAIR \
  target/deploy/payment_gpu_marketplace.so
