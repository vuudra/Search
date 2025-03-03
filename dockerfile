# Use Bun as the base image
FROM oven/bun:1

# Create app directory
WORKDIR /usr/src/app

# Create a non-root user
RUN addgroup --system appgroup && adduser --system appuser --ingroup appgroup

# Copy package files
COPY package*.json ./

# Install dependencies (clean install)
RUN rm -f package-lock.json && bun install --production

# Copy app source
COPY . .

# Change ownership of the app directory to the non-root user
RUN chown -R appuser:appgroup /usr/src/app

# Switch to non-root user
USER appuser

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["bun", "start"]
