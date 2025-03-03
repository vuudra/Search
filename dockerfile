# Use Bun as the base image for building
FROM oven/bun:1 as builder

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN rm -f package-lock.json && bun install

# Copy app source
COPY . .

# Build the application
RUN bun run build

# Production image
FROM node:20-slim

WORKDIR /usr/src/app

# Create a non-root user
RUN groupadd --system appgroup && useradd --system --gid appgroup appuser

# Copy built assets and dependencies from builder
COPY --from=builder /usr/src/app/.output ./
COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Change ownership of the app directory to the non-root user
RUN chown -R appuser:appgroup /usr/src/app

# Switch to non-root user
USER appuser

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["node", "server/index.mjs"]
