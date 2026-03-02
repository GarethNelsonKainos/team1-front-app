# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build


# Stage 2: Production
FROM node:22-alpine AS production

WORKDIR /app

COPY package*.json ./
# TypeScript compiles to CommonJS but package.json has "type":"module".
# Remove it so Node treats the compiled output as CommonJS.
RUN npm pkg delete type && npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY views/ ./views/
COPY public/ ./public/

EXPOSE 3000

CMD ["node", "dist/index.js"]
