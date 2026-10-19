# Multi-stage build for Refraction Simulator
# Stage 1: Build with Node.js Alpine
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci || npm install

COPY . .
RUN npm run build

# Stage 2: Ultra-lightweight production server with Nginx Alpine (~25MB)
FROM nginx:alpine

# Replace default Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy optimized production bundle from builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
