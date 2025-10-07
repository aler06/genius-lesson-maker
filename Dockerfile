FROM node:22.17.1-alpine AS builder

LABEL maintainer="Genius Lesson Maker Team"
LABEL version="1.0.0"
LABEL description="Genius Lesson Maker Frontend - Vite + React Application"

# Argumentos de build para variables de entorno
ARG VITE_API_URL
ARG VITE_API_BASE_URL
ARG VITE_WS_URL
ARG VITE_FRONTEND_URL

# Establecer variables de entorno para el build
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_WS_URL=${VITE_WS_URL}
ENV VITE_FRONTEND_URL=${VITE_FRONTEND_URL}

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

FROM nginx:1.27-alpine AS production

RUN apk add --no-cache curl

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3011

CMD ["nginx", "-g", "daemon off;"]