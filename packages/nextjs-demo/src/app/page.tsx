"use client";
import React from "react";
import Home from "../components/Home";

/**
 * 页面入口
 * ✅ 确保 Home 在 Providers 包裹的上下文中执行
 */
export default function Page() {
  console.log("📄 Page mounted (client)");
  return <Home />;
}
