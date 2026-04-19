# use the official Bun image
FROM oven/bun:1.2-alpine AS base
WORKDIR /app

# ===================================================
# Stage 1: Install dependencies
# ===================================================
FROM base AS install
COPY package.json bun.lock .
RUN bun install --production

# ===================================================
# Stage 2: Development (with watch mode)
# ===================================================
FROM base AS development
COPY --from=install /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=development

# Run the dev script which includes watch mode
USER bun
CMD ["bun", "run", "--watch", "app/app.ts"]
