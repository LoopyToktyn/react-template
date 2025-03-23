# Dockerfile
# ----------
# Multi-stage build for production and local dev

### Base stage (shared)
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./

### Development stage
FROM base AS dev
RUN npm install
COPY . .
EXPOSE 3000
CMD npm run start  # Assumes this starts webpack-dev-server

### Build stage for production
FROM base AS build
RUN npm ci
COPY . .
RUN npm run build  # Must output to /app/dist or similar

### Final stage: Serve with nginx
FROM nginx:alpine AS prod
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY env-config.template.js /usr/share/nginx/html/env-config.template.js
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]
