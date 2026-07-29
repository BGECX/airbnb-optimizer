# Étape 1 : Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copie des fichiers de dépendances
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copie du code source
COPY . .

# Build de l'application Next.js en mode standalone
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Étape 2 : Runtime
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=10000
ENV HOSTNAME=0.0.0.0

# Copie des fichiers nécessaires depuis le builder
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 10000

CMD ["node", "server.js"]
