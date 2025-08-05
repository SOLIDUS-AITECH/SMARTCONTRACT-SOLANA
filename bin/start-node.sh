#!/bin/bash

solana-test-validator \
    --bpf-program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA dump_programs/token_program.so \
    --bpf-program ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL dump_programs/associate_token_program.so \
    --bpf-program metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s dump_programs/metaplex.so \
    --reset