# =======================
# Stage 1: 构建阶段
# =======================
FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.12.1 --activate

# 复制所有文件并安装依赖
COPY . .
RUN pnpm install --no-frozen-lockfile
RUN pnpm --filter ./packages/fhevm-sdk-core build
RUN pnpm --filter ./packages/fhevm-sdk-react build
RUN pnpm --filter ./packages/nextjs-demo build

# =======================
# Stage 2: 运行阶段
# =======================
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# 复制构建产物
COPY --from=builder /app/packages/nextjs-demo/.next ./.next
COPY --from=builder /app/packages/nextjs-demo/public ./public
COPY --from=builder /app/packages/nextjs-demo/package.json ./package.json
COPY --from=builder /app/packages/nextjs-demo/node_modules ./node_modules
COPY --from=builder /app/packages/fhevm-sdk-react/dist ./node_modules/@fhevm/sdk-react/dist
COPY --from=builder /app/packages/fhevm-sdk-core/dist ./node_modules/fhevm-sdk-core/dist

# ✅ 去除 workspace 依赖，防止 npm install 报错
RUN sed -i '/workspace:\\*/d' package.json

# ✅ 如果 next 缺失则自动安装
RUN [ -f "node_modules/next/dist/bin/next" ] || npm install next@15.2.5 --no-save

# ✅ 启动 next
CMD ["node", "node_modules/next/dist/bin/next", "start"]
