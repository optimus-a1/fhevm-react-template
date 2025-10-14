"use client";
import { FHEVMProvider } from "@fhevm/sdk-react";

export default function FHEVMRootProvider({ children }: { children: React.ReactNode }) {
  console.log("🚀 FHEVMRootProvider mounted (client)");
  return <FHEVMProvider>{children}</FHEVMProvider>;
}
