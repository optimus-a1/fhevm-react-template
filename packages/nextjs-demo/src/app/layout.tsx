import "./globals.css";
import React from "react";
import { Providers } from "./providers";

export const metadata = {
  title: "Universal FHEVM Demo",
  description: "Next.js + FHEVM SDK example",
};

/**
 * 🧩 Root Layout
 * ✅ 确保 <Providers> 包裹所有子组件，保证 Context 生效
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log("🧩 RootLayout rendered (server)");
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
