"use client";
import { useState, useEffect } from "react";
import { useFHEVM } from "@fhevm/sdk-react";
import { ethers } from "ethers";

const Home = () => {
  // ======== 状态变量 ========
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [encryptedAmount, setEncryptedAmount] = useState<any>(null);
  const [sdkReady, setSdkReady] = useState(false);

  // ======== SDK 实例 ========
  const fhevm = useFHEVM();

  // ======== 初始化检查 ========
  useEffect(() => {
    if (fhevm) {
      console.log("✅ FHEVM SDK 已初始化:", fhevm);
      console.dir(fhevm);
      console.log("🔑 可用的键:", Object.keys(fhevm));
      setSdkReady(true);
    } else {
      console.warn("⚠️ FHEVM SDK 尚未初始化");
    }
  }, [fhevm]);

  // ======== 钱包连接 ========
  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      alert("请先安装 MetaMask 或其他以太坊钱包扩展！");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      setProvider(provider);
      setWalletAddress(address);
      console.log("🦊 钱包已连接:", address);
    } catch (err) {
      console.error("❌ 钱包连接失败:", err);
    }
  };

  // ======== 加密金额 ========
  const handleEncrypt = () => {
    if (!sdkReady) return alert("FHEVM SDK 尚未准备好，请稍等！");
    if (!amount || amount <= 0) return alert("请输入一个有效的数字");

    try {
      // 👇 自动检测正确的加密函数位置
      const encryptFn =
        fhevm?.fhevm?.encryptUint32 ||
        fhevm?.fhevm?.encryptor?.encryptUint32 ||
        fhevm?.encryptUint32;

      if (!encryptFn) {
        console.error("❌ 未找到 encryptUint32 方法，fhevm 结构如下:", fhevm);
        alert("SDK 中未找到 encryptUint32 方法，请查看控制台日志！");
        return;
      }

      const { encryptedValue, proof } = encryptFn(amount);
      console.log("🔐 加密结果:", encryptedValue);
      console.log("🧾 加密证明:", proof);
      setEncryptedAmount({ encryptedValue, proof });
      alert("✅ 加密成功！");
    } catch (err) {
      console.error("加密失败:", err);
      alert("❌ 加密失败，请检查控制台日志。");
    }
  };

  // ======== 解密金额 ========
  const handleDecrypt = () => {
    if (!sdkReady) return alert("FHEVM SDK 尚未准备好！");
    if (!encryptedAmount) return alert("请先执行加密操作！");

    try {
      const decryptFn =
        fhevm?.fhevm?.decryptUint32 ||
        fhevm?.fhevm?.decryptor?.decryptUint32 ||
        fhevm?.decryptUint32;

      if (!decryptFn) {
        console.error("❌ 未找到 decryptUint32 方法，fhevm 结构如下:", fhevm);
        alert("SDK 中未找到 decryptUint32 方法，请查看控制台日志！");
        return;
      }

      const decrypted = decryptFn(
        encryptedAmount.encryptedValue,
        encryptedAmount.proof
      );
      console.log("🔓 解密结果:", decrypted);
      alert(`解密结果: ${decrypted}`);
    } catch (err) {
      console.error("解密失败:", err);
      alert("❌ 解密失败，请检查日志。");
    }
  };

  // ======== 与合约交互 ========
  const handleSendToContract = async () => {
    if (!provider || !walletAddress) return alert("请先连接钱包！");
    if (!sdkReady || !encryptedAmount) return alert("SDK 未准备好或未加密数据！");

    try {
      const signer = await provider.getSigner();
      const contractAddress = "0x964656ad7aE6D2b502F4467B358aC8C070dBc5Bd"; // ← 你的 FHEVM 合约地址
      const abi = [
        "function storeEncryptedValue(bytes encryptedValue, bytes proof) public",
      ];

      // 👇 将 SDK 内部字符串序列化为 Bytes
      const encryptedBytes = ethers.toUtf8Bytes(encryptedAmount.encryptedValue);
      const proofBytes = ethers.toUtf8Bytes(encryptedAmount.proof);

      const contract = new ethers.Contract(contractAddress, abi, signer);
      console.log("📡 正在发送交易...");
      const tx = await contract.storeEncryptedValue(encryptedBytes, proofBytes);
      await tx.wait();

      console.log("✅ 交易完成:", tx.hash);
      alert(`✅ 已将加密数据发送到合约！\nTx: ${tx.hash}`);
    } catch (err) {
      console.error("❌ 发送失败:", err);
      alert("❌ 与合约交互失败，请检查控制台日志。");
    }
  };

  // ======== 前端 UI ========
  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>🔐 FHEVM Private Transfer Demo</h1>

      {/* SDK 状态 */}
      <p>
        SDK 状态:{" "}
        <strong style={{ color: sdkReady ? "green" : "red" }}>
          {sdkReady ? "已初始化 ✅" : "未就绪 ❌"}
        </strong>
      </p>

      {/* 钱包状态 */}
      {!walletAddress ? (
        <button
          onClick={connectWallet}
          style={{
            padding: "0.5rem 1rem",
            background: "#f6851b",
            border: "none",
            color: "white",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          🦊 连接钱包
        </button>
      ) : (
        <p>
          已连接钱包：<code>{walletAddress}</code>
        </p>
      )}

      <hr style={{ margin: "20px 0" }} />

      {/* 加密输入框 */}
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        placeholder="输入要加密的金额"
        style={{ padding: "0.5rem", marginRight: "1rem", width: "180px" }}
      />
      <button onClick={handleEncrypt}>加密</button>
      <button onClick={handleDecrypt} style={{ marginLeft: "10px" }}>
        解密
      </button>

      <hr style={{ margin: "20px 0" }} />

      {/* 发送加密数据到链上 */}
      <button
        onClick={handleSendToContract}
        style={{
          padding: "0.5rem 1rem",
          background: "#0070f3",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        🚀 将加密数据发送到合约
      </button>

      {/* 加密结果显示 */}
      {encryptedAmount && (
        <div
          style={{
            marginTop: "20px",
            background: "#f0f0f0",
            padding: "1rem",
            borderRadius: "8px",
          }}
        >
          <h3>📦 加密结果</h3>
          <p>
            <strong>Encrypted:</strong> {encryptedAmount.encryptedValue}
          </p>
          <p>
            <strong>Proof:</strong> {encryptedAmount.proof}
          </p>
        </div>
      )}
    </div>
  );
};

export default Home;
