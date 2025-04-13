import fs from "fs";
import { Connection, clusterApiUrl, Keypair, PublicKey } from "@solana/web3.js";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";

// 1. Load wallet
const secret = JSON.parse(fs.readFileSync("/Users/ccomai/my-wallet.json", "utf-8"));
const keypair = Keypair.fromSecretKey(new Uint8Array(secret));

// 2. Setup Metaplex
const connection = new Connection(clusterApiUrl("devnet"));
const metaplex = Metaplex.make(connection).use(keypairIdentity(keypair));

// 3. Your token mint
const mintAddress = new PublicKey("xzrLXYPdVjrHCusFfuyxYkxkGai8Ay9wDyU7eL6X4Zn");

// ✅ 4. Load existing NFT metadata
const nft = await metaplex.nfts().findByMint({ mintAddress });

// ✅ 5. Update with fallback values (especially creators)
const { response } = await metaplex.nfts().update({
  nftOrSft: nft,
  uri: "https://raw.githubusercontent.com/ccomai/ccomai-solana-test-token/main/ccomai-token-metadata.json",
  name: "CCOMAI Token",
  symbol: "CMITST",
  creators: nft.creators ?? null,  // 🔥 에러 방지용 추가
  updateAuthority: keypair,
});

console.log("✅ Metadata updated! Signature:", response.signature);