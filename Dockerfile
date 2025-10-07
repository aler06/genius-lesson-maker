# Build stage
FROM node:22.17.1-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_API_URL=http://taller-api-fw2kqq-703289-173-212-248-96.traefik.me
ARG VITE_API_BASE_URL=http://taller-api-fw2kqq-703289-173-212-248-96.traefik.me/api/v1
ARG VITE_WS_URL=http://taller-api-fw2kqq-703289-173-212-248-96.traefik.me
ARG VITE_FRONTEND_URL=http://localhost:3011

# Set environment variables
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_WS_URL=${VITE_WS_URL}
ENV VITE_FRONTEND_URL=${VITE_FRONTEND_URL}

# Build the application
RUN npm run build

# Production stage
FROM nginx:1.27-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 3011

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3011/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]