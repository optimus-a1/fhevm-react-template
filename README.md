# Universal FHEVM SDK (Monorepo)

> **一行简介**：一个**框架无关、可插拔适配器**的 FHEVM SDK 栈，提供最小可用的初始化 / 加密 / 解密能力，以及 React “wagmi-like” 适配层与 Next.js 示例应用。

* **Live Demo**（Vercel 部署，HTTPS）：`https://http://65.21.128.40:3000/`  ← 
* **示例合约地址**（Sepolia）：`0x9F8069282814a1177C1f6b8D7d8f7cC11A663554`  ← 
* **演示视频（3–5 分钟）**：`https://www.loom.com/share/097214bec74f4048be40e7d01b940137?sid=4dcf3270-bd37-490e-a8f6-bff3282a047d` ← 
---

## 目录

* [项目结构](#项目结构)
* [架构图](#架构图)
* [功能特性](#功能特性)
* [快速开始（≤ 10 行命令）](#快速开始-≤-10-行命令)
* [环境变量](#环境变量)
* [脚本命令](#脚本命令)
* [核心 API（fhevm-sdk-core）](#核心-api-fhevm-sdk-core)
* [React 适配（fhevm-sdk-react）](#react-适配-fhevm-sdk-react)
* [EIP-712 “read-permit” 解密流程](#eip-712-read-permit-解密流程)
* [Next.js 示例](#nextjs-示例)
* [测试](#测试)
* [部署（Vercel）](#部署-vercel)
* [常见问题 & 排障](#常见问题--排障)
* [里程碑 / 变更记录](#里程碑--变更记录)
* [License](#license)

---

## 项目结构

```text
universal-fhevm-sdk/
├─ packages/
│  ├─ fhevm-sdk-core/      # 核心库：纯 TypeScript，无框架依赖
│  ├─ fhevm-sdk-react/     # React 适配层（hooks / Provider）
│  └─ (optional adapters)  # viem/ethers 等适配，或 vue/node 等
├─ examples/
│  └─ nextjs-demo/         # 必做：Next.js 示例，展示 SDK 使用
├─ scripts/                # 可选：工具脚本（CI、发布等）
├─ package.json            # workspace 根；聚合脚本
└─ README.md
```

> Monorepo 使用 `pnpm` workspaces：根 `package.json` 声明 `"workspaces": ["packages/*", "examples/*"]`。

---

## 架构图

```
             +-----------------------+
             |   dApps (Any Frontend)|
             +-----------+-----------+
                         |
                 (React Adapter)
                         v
             +-----------------------+
             |  fhevm-sdk-react      |
             |  - <FHEVMProvider>    |
             |  - useFHEVM()         |
             |  - useEncryptedWrite()|
             |  - useDecryption()    |
             +-----------+-----------+
                         |
                 (Core APIs / TS)
                         v
             +-----------------------+
             |  fhevm-sdk-core       |
             |  - createFHEVM        |
             |  - encryptUint32      |
             |  - encryptBytes       |
             |  - userDecrypt        |
             |  - publicDecrypt      |
             +-----------+-----------+
                         |
                 (Blockchain I/O)
                         v
             +-----------------------+
             |  Adapters (viem/ethers)
             |  - Provider/Signer     |
             |  - EIP-712 signing     |
             +-----------------------+
```

**设计要点**：

* **核心无框架依赖**，React/Vue/Node 通过适配层接入；
* **可插拔链交互适配**（viem / ethers），核心仅暴露纯函数/类型；
* **最小 API 面**覆盖初始化、加密、解密（包含 userDecrypt + publicDecrypt）。

---

## 功能特性

* ✅ **createFHEVM**：基于链 ID / RPC / 上下文初始化 SDK
* ✅ **encryptUint32 / encryptBytes**：前端加密，返回 `{ input, proof }`
* ✅ **userDecrypt**（EIP-712 授权）：对链上密文进行“读许可”解密
* ✅ **publicDecrypt**：无需签名的公共解密路径（合约/上下文允许时）
* ✅ **React hooks**：`useFHEVM`、`useEncryptedWrite`、`useDecryption`
* ✅ **Next.js 示例**：连接钱包 → 加密写入 → 读取解密
* ✅ **打包产物**：ESM + CJS + `.d.ts` 类型声明

---

## 快速开始（≤ 10 行命令）

```bash
# 1) 克隆你的 fork（务必从官方模板 fork 而来）
git clone https://github.com/<your-username>/fhevm-react-template.git universal-fhevm-sdk
cd universal-fhevm-sdk

# 2) 安装 & 构建
pnpm bootstrap && pnpm build

# 3) 启动示例（Next.js）
pnpm demo:next
# 访问 http://localhost:3000 （或 Vercel 部署后的 HTTPS 链接）
```

> *注意：不是从 fork 提交会被直接淘汰。*

---

## 环境变量

示例应用（`examples/nextjs-demo`）支持如下环境变量：

```bash
# .env.local
NEXT_PUBLIC_RPC_URL=https://rpc.sepolia.org
NEXT_PUBLIC_CONTRACT_ADDRESS=0x9F8069282814a1177C1f6b8D7d8f7cC11A663554
```

在 Vercel 上，将相同键值配置到 **Project → Settings → Environment Variables**。

---

## 脚本命令

根 `package.json`：

```json
{
  "scripts": {
    "bootstrap": "pnpm install",
    "build": "pnpm -r build",                 
    "contract:compile": "hardhat compile",     
    "contract:deploy": "hardhat run scripts/deploy.ts --network sepolia",
    "demo:next": "pnpm --filter nextjs-demo dev"
  }
}
```

> 如示例包含合约，请根据你的 `hardhat` 配置调整网络与脚本路径。

---

## 核心 API（`fhevm-sdk-core`）

### `createFHEVM(config)`

```ts
interface FHEVMConfig {
  chainId: number;
  rpcUrl: string;
  // 可选：上下文、适配器注入等
  adapter?: {
    // 例如：签名、读写请求、链上读取等
    signTypedData?: (payload: any) => Promise<string>;
    read?: (call: any) => Promise<any>;
    write?: (tx: any) => Promise<any>;
  };
}

function createFHEVM(config: FHEVMConfig): Promise<{
  encryptUint32: (v: number) => Promise<{ input: string; proof: string }>;
  encryptBytes: (b: Uint8Array) => Promise<{ input: string; proof: string }>;
  userDecrypt: (args: UserDecryptArgs) => Promise<string | number | Uint8Array>;
  publicDecrypt: (payload: any) => Promise<string | number | Uint8Array>;
}>;
```

### `encryptUint32(value)`

* 入参：`number`
* 出参：`{ input: string; proof: string }`（可直接作为合约 `externalEuintXX` 入参）

### `encryptBytes(data)`

* 入参：`Uint8Array`
* 出参：`{ input: string; proof: string }`

### `userDecrypt({ account, payload, ... })`

* 行为：发起 **EIP-712** 签名授权，并对链上密文进行“读许可”解密
* 依赖：`adapter.signTypedData`

### `publicDecrypt(payload)`

* 行为：无需签名的公共解密路径（取决于上下文/合约策略）

> **适配层建议**：将链交互（viem/ethers）做成注入式 adapter，使 `core` 保持纯函数库。

---

## React 适配（`fhevm-sdk-react`）

### `<FHEVMProvider config={...}>`

在 App 入口初始化 SDK，并通过 Context 下发实例与状态：

```tsx
<FHEVMProvider config={{ chainId: 11155111, rpcUrl: process.env.NEXT_PUBLIC_RPC_URL! }}>
  <App />
</FHEVMProvider>
```

### `useFHEVM()`

返回 `{ fhevm, ready, error, account, chainId }`。

### `useEncryptedWrite({ contract, functionName, args, encrypt })`

* 入参明文，hook 内完成 “**加密 → 发交易**”；
* 返回：`{ write, status, txHash, error }`。

### `useDecryption(payload)`

* 对链上密文执行 `userDecrypt` 或 `publicDecrypt`；
* 内置缓存与重试（可配置）。

---

## EIP-712 “read-permit” 解密流程

```mermaid
graph TD
  A[前端 dApp] -->|请求读取密文| B[FHEVM Provider]
  B --> C{是否需要授权?}
  C -- 否 --> D[publicDecrypt]
  C -- 是 --> E[构造 EIP-712 typedData]
  E --> F[钱包签名 (signTypedData)]
  F --> G[userDecrypt with signature]
  D --> H[明文]
  G --> H[明文]
```

**实现要点**：

* typedData 的 `domain.name` / `chainId` / `types` 必须与链上合约期望一致；
* 处理好 `deadline/nonce`，避免重放；
* HTTPS 环境或 `http://localhost`，否则注入钱包不可用。

---

## Next.js 示例

* 页面包含：**Connect / Switch Network**、**Deposit（密文演示）**、**Read Balance（userDecrypt）**、（可选）Transfer；
* 控制台日志（调试）：SDK 初始化 → 加密输出 → 交易哈希 → 解密结果。

> 本仓库内 `examples/nextjs-demo` 即为最小示例，可直接运行或部署。

---

## 测试

使用 `vitest`/`jest` 编写最小单测（建议 2–3 个）：

```bash
# 在 core 包内运行测试
pnpm --filter fhevm-sdk-core test
```

**建议用例**：

* `encryptUint32` 返回对象形状与类型检查；
* `userDecrypt` 对 mock payload 与签名流程跑通；
* （可选）端到端：部署最小合约，写入密文后读取解密一次。

---

## 部署（Vercel）

1. 推送仓库（Public）；
2. Vercel → **New Project** → Import 你的 GitHub 仓库；
3. 设置 Environment Variables：

   * `NEXT_PUBLIC_RPC_URL = https://rpc.sepolia.org`
   * `NEXT_PUBLIC_CONTRACT_ADDRESS = <你的合约>`
4. **Deploy**，获得 `https://<your-app>.vercel.app`；
5. 将链接写入本 README 顶部。

---

## 常见问题 & 排障

* **钱包注入失败**：需在 **HTTPS** 或 `http://localhost` 环境。
* **EIP-712 签名失败**：检查 **domain/chainId/types** 与合约期望是否一致；确保 `deadline/nonce` 设置正确。
* **Next.js 警告：allowedDevOrigins**：在 `next.config.mjs` 添加：

  ```js
  export default {
    experimental: { allowedDevOrigins: ["http://<your-ip>:3000"] },
  }
  ```
* **不是从 fork 提交**：会被直接淘汰。请确保仓库保留 `fork` 关系与 `upstream`。

---

## 里程碑 / 变更记录

* **v0.1.0**：

  * Monorepo 初始化；
  * `fhevm-sdk-core`：createFHEVM / encrypt / userDecrypt / publicDecrypt；
  * `fhevm-sdk-react`：Provider + hooks；
  * Next.js 示例 + 一键脚本；
  * ESM + CJS + `.d.ts` 产物。

---

## License

MIT

---

