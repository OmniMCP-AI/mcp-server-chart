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

# Copy application code (needed for husky in prepare script)
COPY . .

# Install dependencies and build
# Set CI=true to skip husky install in Docker
RUN CI=true npm install && npm run build

EXPOSE 1122

# Command will be provided by smithery.yaml
CMD ["node", "build/index.js", "-t", "streamable"]
