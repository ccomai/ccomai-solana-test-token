import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import { Connection, clusterApiUrl, Keypair, PublicKey } from "@solana/web3.js";
import * as fs from 'fs';

async function addMetadataToExistingToken() {
  // Solana devnet에 연결
  const connection = new Connection(clusterApiUrl("devnet"));

  // 개인 키 로드 (토큰 만든 계정과 동일한 계정이어야 함)
  let keypair;
  try {
    const secretKey = JSON.parse(fs.readFileSync('/Users/ccomai/my-wallet.json', 'utf8'));
    keypair = Keypair.fromSecretKey(new Uint8Array(secretKey));
  } catch (error) {
    console.error("키페어 파일을 불러올 수 없습니다:", error);
    return;
  }

  // Metaplex 인스턴스 초기화 (업데이트된 방식)
  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(keypair));

  // 이미 생성된 토큰 민트 주소
  const existingTokenMint = new PublicKey("xzrLXYPdVjrHCusFfuyxYkxkGai8Ay9wDyU7eL6X4Zn");
  console.log("기존 토큰 민트 주소:", existingTokenMint.toString());

  // 코인용 이름과 심볼 설정
  const tokenName = "CCOMAI Token";
  const tokenSymbol = "CMITST";
  
  // 로고 이미지 URI
  const imageUri = "https://raw.githubusercontent.com/ccomai/ccomai-solana-test-token/main/ccomai_token_logo.png";
  
  // 메타데이터 업로드
  console.log("토큰 메타데이터 업로드 중...");
  const { uri } = await metaplex.nfts().uploadMetadata({
    name: tokenName,
    symbol: tokenSymbol,
    description: "My cryptocurrency token on Solana",
    image: imageUri,
    attributes: [
      {
        trait_type: "Token Type",
        value: "Fungible"
      }
    ],
    properties: {
      files: [
        {
          uri: imageUri,
          type: "image/png"
        }
      ],
      category: "cryptocurrency"
    }
  });

  console.log("메타데이터 URI:", uri);

  // 토큰에 메타데이터 연결
  console.log("토큰에 메타데이터 연결 중...");
  try {
    const { nft: tokenMetadata } = await metaplex.nfts().create({
      uri: uri,
      name: tokenName,
      symbol: tokenSymbol,
      sellerFeeBasisPoints: 0,
      useNewMint: existingTokenMint,
      tokenStandard: 1,
    });

    console.log("토큰 메타데이터가 성공적으로 등록되었습니다:");
    console.log("메타데이터 주소:", tokenMetadata.address.toString());
    console.log("토큰 이름:", tokenName);
    console.log("토큰 심볼:", tokenSymbol);
  } catch (error) {
    // 이미 메타데이터가 있는 경우 업데이트 시도
    console.log("메타데이터 생성 실패, 이미 존재하는 메타데이터를 업데이트합니다:", error.message);
    
    try {
      // 기존 메타데이터 찾기
      const nft = await metaplex.nfts().findByMint({ mintAddress: existingTokenMint });
      
      // 메타데이터 업데이트
      const { nft: updatedMetadata } = await metaplex.nfts().update({
        nftOrSft: nft,
        name: tokenName,
        symbol: tokenSymbol,
        uri: uri,
      });
      
      console.log("토큰 메타데이터가 성공적으로 업데이트되었습니다:");
      console.log("메타데이터 주소:", updatedMetadata.address.toString());
      console.log("토큰 이름:", tokenName);
      console.log("토큰 심볼:", tokenSymbol);
    } catch (updateError) {
      console.error("메타데이터 업데이트 실패:", updateError);
    }
  }
}

addMetadataToExistingToken().catch(error => {
  console.error("오류 발생:", error);
});