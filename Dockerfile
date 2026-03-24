# Production Dockerfile
FROM node:20-slim AS build

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
RUN npm install

# Copy source files
COPY . .

# Build the project
RUN npm run build

# Stage 2: Serve using Nginx
FROM nginx:alpine

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy default nginx config if needed (optional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
