# Stage 1: Build the React application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json (if available)
# Leverage Docker cache by copying only these files first
COPY package*.json ./

# Install dependencies
# Use 'npm ci' for cleaner installs in CI/CD if package-lock.json exists
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
# This assumes the build output goes to the 'dist' directory (default for Vite)
RUN npm run build

# Stage 2: Serve the static assets with Nginx
FROM nginx:stable-alpine

# Copy the build output from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (standard HTTP port for Nginx)
EXPOSE 80

# The base Nginx image already has a CMD to start Nginx
# CMD ["nginx", "-g", "daemon off;"] 