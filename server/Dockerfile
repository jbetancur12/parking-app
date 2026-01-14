FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install curl for healthchecks
RUN apk add --no-cache curl

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose API port
EXPOSE 3000

# Start command
CMD ["npm", "run", "start:prod"]
