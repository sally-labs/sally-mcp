# Use Node.js LTS version
FROM node:20-slim

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code and config files
COPY . .

# Build TypeScript to JavaScript
RUN pnpm run build

# Set environment variables that will be overridden by Smithery
ENV PRIVATE_KEY=""
ENV RESOURCE_SERVER_URL=""

# Run the production build
CMD ["node", "dist/index.js"]
