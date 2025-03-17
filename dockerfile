# Build stage with Bun
FROM oven/bun:latest AS builder

# Set working directory
WORKDIR /app

# Copy package.json and other config files
COPY package.json tsconfig.json app.config.ts postcss.config.mjs ./

# Copy source code
COPY app ./app

# Install dependencies
RUN bun install

# Build the application
RUN bun run build

# Debug: List directories to see what was created
RUN ls -la && ls -la .output || echo "No .output directory"

# Production stage with Node.js
FROM node:20-slim AS runner

WORKDIR /app

# Copy built files
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/.vinxi ./.vinxi
COPY --from=builder /app/package.json ./package.json

# Install production dependencies using npm
RUN npm install

# Install explicit react-dom
RUN npm install react-dom@19

# Set environment variables
ENV NODE_ENV=production

# Expose the port your app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]
