import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE";

// 加密函数：加密明文为密文
export const encryptUint32 = (value: number): { input: euint32; proof: bytes } => {
  const encryptedValue = FHE.asEuint32(value); 
  const proof = FHE.getProof(encryptedValue); 
  return { input: encryptedValue, proof };
};

// 解密函数：从合约读取加密数据并解密
export const decryptUint32 = (encryptedValue: externalEuint32, proof: bytes): number => {
  const decryptedValue = FHE.fromExternal(encryptedValue, proof); 
  return decryptedValue.toNumber(); 
};
