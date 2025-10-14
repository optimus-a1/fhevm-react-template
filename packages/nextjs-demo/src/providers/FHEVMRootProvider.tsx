"use client";
import React from "react";
import { FHEVMProvider } from "@fhevm/sdk-react";

/**
 * 🚀 Root-level FHEVM Provider
 * 确保整个前端 App 都包裹在 FHEVMProvider 内
 */
export function FHEVMRootProvider({ children }: { children: React.ReactNode }) {
  console.log("🚀 FHEVMRootProvider mounted (client)");
  return <FHEVMProvider>{children}</FHEVMProvider>;
}
