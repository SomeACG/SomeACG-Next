FROM node:20-slim AS base

# 安装 pnpm 和必要的系统依赖
RUN apt-get update && apt-get install -y openssl wget
RUN corepack enable && corepack prepare pnpm@latest --activate

# 构建层
FROM base AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
# 安装所有依赖
RUN pnpm install --frozen-lockfile

COPY . .
# 生成 Prisma Client
RUN pnpm prisma generate
RUN pnpm build
# 只保留生产依赖
RUN pnpm prune --prod

# 运行层
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
ENV DATABASE_URL="file:/app/prisma/dev.db"

# 安装 Prisma 运行时依赖
RUN apt-get update && apt-get install -y openssl

# 只复制必要的构建产物
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
# 复制生产依赖
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["node", "server.js"] 