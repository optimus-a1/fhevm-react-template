"use client";
import React from "react";
import { FHEVMRootProvider } from "../providers/FHEVMRootProvider";

/**
 * ✅ 全局 Providers 层
 * 挂载在 layout.tsx 中，确保所有组件都在 Context 内
 */
export function Providers({ children }: { children: React.ReactNode }) {
  console.log("✅ Providers mounted (client)");
  return <FHEVMRootProvider>{children}</FHEVMRootProvider>;
}
