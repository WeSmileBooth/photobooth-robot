# Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

COPY .env .

# Build the Vue application
RUN npm run build

# Expose the port
EXPOSE 5080

# ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

# Start the server
CMD ["node", "server.js"]

