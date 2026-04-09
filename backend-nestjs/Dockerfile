# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies first for caching
COPY package*.json ./
RUN npm install

# Copy source and prisma schema
COPY . .
RUN npx prisma generate

# Build the application
RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine AS runtime

WORKDIR /app

COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

# Create uploads directory
RUN mkdir -p uploads/attendance

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
