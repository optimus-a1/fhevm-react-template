"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { createFHEVM } from "fhevm-sdk-core";
import detectEthereumProvider from "@metamask/detect-provider";

export const FHEVMContext = createContext<any>(null);

/**
 * 🚀 Provider：初始化 FHEVM SDK 并注入 Context
 */
export function FHEVMProvider({ children }: { children: React.ReactNode }) {
  const [fhevm, setFhevm] = useState<any>(null);
  const [account, setAccount] = useState<string>("");
  const [chainId, setChainId] = useState<number>(11155111); // 默认 Sepolia

  useEffect(() => {
    async function init() {
      try {
        console.log("🔍 检查钱包中...");
        const provider: any = await detectEthereumProvider();

        if (!provider) {
          alert("❌ 未检测到钱包插件，请安装 MetaMask！");
          return;
        }

        console.log("🔗 正在请求连接钱包...");
        const accounts = await provider.request({ method: "eth_requestAccounts" });
        const network = await provider.request({ method: "eth_chainId" });
        const chainNum = parseInt(network, 16);

        console.log("✅ 钱包已连接:", accounts[0]);
        console.log("🌐 当前网络:", chainNum);

        setAccount(accounts[0]);
        setChainId(chainNum);

        console.log("🚀 初始化 FHEVM SDK...");
        const instance = await createFHEVM({
          chainId: chainNum,
          rpcUrl: "https://rpc.sepolia.org",
          contractAddress: "0x9F8069282814a1177C1f6b8D7d8f7cC11A663554", // ✅ 真实合约
        });

        console.log("✅ FHEVM SDK 初始化成功");
        setFhevm(instance);
      } catch (err) {
        console.error("❌ FHEVMProvider 初始化失败:", err);
      }
    }
    init();
  }, []);

  return (
    <FHEVMContext.Provider value={{ fhevm, account, chainId }}>
      {children}
    </FHEVMContext.Provider>
  );
}

/**
 * ⚡ Hook：提供 SDK 实例、账户与链信息
 */
export function useFHEVM() {
  const context = useContext(FHEVMContext);
  if (!context) {
    throw new Error("useFHEVM must be used within a FHEVMProvider");
  }
  return context;
}

export default FHEVMProvider;
