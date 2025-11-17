FROM node:lts-alpine

WORKDIR /app

# Install system dependencies required for canvas
RUN apk add --no-cache \
    build-base \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    pixman-dev

# Copy package files
COPY package*.json ./

# Install dependencies (remove --ignore-scripts to allow canvas to build)
RUN npm install

# Copy application code
COPY . .

EXPOSE 1122

# Build the application
RUN npm run build

# Command will be provided by smithery.yaml
CMD ["node", "build/index.js", "-t", "streamable"]
