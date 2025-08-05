# Smart Contract

## Dump token program
```sh
solana program dump -u m TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA dump_programs/token_program.so

solana program dump -u m ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL dump_programs/associate_token_program.so

solana program dump -u m metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s dump_programs/metaplex.so

solana program dump -u m CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C dump_programs/raydium_cp_swap.so

```

## Build the document

```sh
cargo doc --no-deps
```

## Deploy 

### Build 
```sh
anchor build
```

### Deploy
```sh
bash bin/deploy.sh
```

### Verify IDL

```sh
anchor idl init -f target/idl/<idl>.json <program_id>
```

## Format rust code

```sh
rustup component add rustfmt --toolchain nightly
cargo +nightly fmt
```