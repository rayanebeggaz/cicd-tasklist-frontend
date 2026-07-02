# ---- Build stage ----
FROM node:22-slim AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
# Optional API base URL injected at build time (defaults to /api)
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ---- Runtime stage (static files served by nginx) ----
FROM nginx:1.27-alpine AS runner

# SPA-aware nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Built assets
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
