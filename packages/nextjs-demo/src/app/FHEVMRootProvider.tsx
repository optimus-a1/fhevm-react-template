"use client";
import React from "react";
import { FHEVMProvider } from "@fhevm/sdk-react";

/**
 * ⚡ 用于在客户端挂载 FHEVMProvider 的包装组件
 */
export default function FHEVMRootProvider({ children }: { children: React.ReactNode }) {
  console.log("🚀 FHEVMRootProvider mounted (client)");
  return <FHEVMProvider>{children}</FHEVMProvider>;
}
