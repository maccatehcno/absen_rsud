# Use the official Bun image
FROM oven/bun:1-alpine AS base
WORKDIR /app

# Install dependencies
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Build the application
RUN bun run build

# Final stage for serving
FROM oven/bun:1-alpine
WORKDIR /app
COPY --from=base /app/dist ./dist
RUN bun install -g serve

EXPOSE 5173
CMD ["bun", "x", "serve", "-s", "dist", "-l", "5173"]
