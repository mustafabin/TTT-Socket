# Use the official Bun image
FROM oven/bun:latest as build

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Copy the rest of the app
COPY . .

RUN bun run build

# Expose the port your app runs on
EXPOSE 3030

# Command to start your application
CMD ["bun", "start", "index.js"]
