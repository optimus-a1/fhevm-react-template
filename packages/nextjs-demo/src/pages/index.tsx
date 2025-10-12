import { useState } from "react";
import { useFHEVM } from "@fhevm/sdk-react"; // 从 SDK 导入 hook

const Home = () => {
  const [amount, setAmount] = useState(0);
  const [encryptedAmount, setEncryptedAmount] = useState(null);
  const { encryptUint32, decryptUint32 } = useFHEVM(); // 使用 SDK 提供的加密和解密功能

  const handleEncrypt = () => {
    const { input, proof } = encryptUint32(amount);
    setEncryptedAmount({ input, proof });
  };

  const handleDecrypt = () => {
    if (encryptedAmount) {
      const decryptedAmount = decryptUint32(encryptedAmount.input, encryptedAmount.proof);
      alert(`Decrypted value: ${decryptedAmount}`);
    }
  };

  return (
    <div>
      <h1>FHEVM Private Transfer Demo</h1>
      <input 
        type="number" 
        value={amount} 
        onChange={(e) => setAmount(Number(e.target.value))} 
        placeholder="Enter amount"
      />
      <button onClick={handleEncrypt}>Encrypt Amount</button>
      <button onClick={handleDecrypt}>Decrypt Amount</button>
    </div>
  );
};

export default Home;
