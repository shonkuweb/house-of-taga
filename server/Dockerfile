FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy server code
COPY . .

# Ensure uploads and data directories exist
RUN mkdir -p /app/uploads /app/data

EXPOSE 5000

CMD ["node", "index.js"]
