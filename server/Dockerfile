# Use Node.js LTS (Long Term Support)
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install dependencies (including devDependencies for build)
RUN npm install

# Copy source code
COPY . .

# Build the TypeScript project
RUN npm run build

# Prune dev dependencies to keep image small (optional but good practice)
# RUN npm prune --production # Commented out because sometimes some dev deps are needed or it's safer to keep for now

# Expose the port the app runs on
EXPOSE 3001

# Start the application
CMD ["npm", "start"]
