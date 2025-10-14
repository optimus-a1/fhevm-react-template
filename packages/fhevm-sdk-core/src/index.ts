// packages/fhevm-sdk-core/src/index.ts

// 模拟 SDK 核心逻辑

export interface SdkConfig {
  rpcUrl: string;
  contractAddress: string;
  chainId: number;
}

export async function createFHEVM(config: SdkConfig) {
  console.log("🧠 Initializing FHEVM SDK with config:", config);

  // 模拟异步初始化（可以未来接实际 RPC）
  await new Promise((resolve) => setTimeout(resolve, 500));

  console.log("✅ FHEVM SDK initialized");

  // 返回带有加密与解密功能的对象
  return {
    encryptUint32(value: number) {
      // 模拟加密逻辑
      const encryptedValue = `enc_${value}_${Math.random().toString(36).substring(2, 8)}`;
      const proof = `proof_${Date.now()}`;
      return { encryptedValue, proof };
    },

    decryptUint32(encryptedValue: string, proof: string) {
      console.log("🔓 decrypt called:", encryptedValue, proof);
      try {
        const parts = encryptedValue.split("_");
        return Number(parts[1]) || 0;
      } catch (err) {
        console.error("解密失败:", err);
        return 0;
      }
    },
  };
}
