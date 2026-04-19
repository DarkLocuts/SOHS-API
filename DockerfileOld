# use the official Bun image
FROM oven/bun:1.2-alpine AS base
WORKDIR /app

# ===================================================
# Stage 1: Install dependencies
# ===================================================
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install

RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --production

# ===================================================
# Stage 2: Development (with watch mode)
# ===================================================
FROM base AS development
COPY --from=install /temp/dev/node_modules node_modules
COPY . .
ENV NODE_ENV=development
EXPOSE 4000/tcp
# Run the dev script which includes watch mode
CMD ["bun", "run", "dev"]

# ===================================================
# Stage 3: Build/Prerelease (prepare for production)
# ===================================================
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .
# Generate necessary index files for routes/controllers
RUN bun run barrels

# ===================================================
# Stage 4: Production Release
# ===================================================
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /app/app app
COPY --from=prerelease /app/utils utils
COPY --from=prerelease /app/database database
COPY --from=prerelease /app/blueprints blueprints
COPY --from=prerelease /app/package.json .

ENV NODE_ENV=production
EXPOSE 4000/tcp
USER bun
ENTRYPOINT [ "bun", "run", "app/app.ts" ]
