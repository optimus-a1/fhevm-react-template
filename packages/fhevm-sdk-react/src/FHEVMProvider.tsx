import React, { createContext, useContext, useState, useEffect } from "react";
import { createFHEVM, sdkConfig } from "@fhevm/sdk-core"; // 引入刚才实现的 SDK

const FHEVMContext = createContext(null);

export const FHEVMProvider = ({ children }) => {
  const [fhevm, setFhevm] = useState(null);

  useEffect(() => {
    const initializeSDK = async () => {
      const sdkInstance = await createFHEVM(sdkConfig); // 初始化 SDK
      setFhevm(sdkInstance);
    };
    initializeSDK();
  }, []);

  return (
    <FHEVMContext.Provider value={fhevm}>
      {children}
    </FHEVMContext.Provider>
  );
};

export const useFHEVM = () => {
  const context = useContext(FHEVMContext);
  if (!context) {
    throw new Error("useFHEVM must be used within a FHEVMProvider");
  }
  return context;
};
