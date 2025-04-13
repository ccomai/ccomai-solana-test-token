import fs from "fs";
import { Connection, clusterApiUrl, Keypair, PublicKey } from "@solana/web3.js";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";

// 1. 지갑 비밀키 로드
const secret = JSON.parse(fs.readFileSync("/Users/ccomai/my-wallet.json", "utf-8"));
const keypair = Keypair.fromSecretKey(new Uint8Array(secret));

// 2. 설정
const connection = new Connection(clusterApiUrl("devnet"));
const metaplex = Metaplex.make(connection).use(keypairIdentity(keypair));

// 3. 이미 발행된 토큰의 Mint 주소
const mintAddress = new PublicKey("xzrLXYPdVjrHCusFfuyxYkxkGai8Ay9wDyU7eL6X4Zn");

// 4. 메타데이터 등록
const { response } = await metaplex.nfts().create({
    uri: "https://raw.githubusercontent.com/ccomai/ccomai-solana-test-token/main/ccomai-token-metadata.json",
    name: "CCOMAI Token",
    symbol: "CMITST",
    sellerFeeBasisPoints: 0,
    mintAddress,
    updateAuthority: keypair,
    isMutable: true,
  });

console.log("✅ Metadata created:", response.signature);