FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate && npm run build

FROM builder AS migrator
CMD ["npx", "prisma", "migrate", "deploy"]

FROM builder AS production-deps
RUN npm prune --omit=dev

FROM node:20-alpine
LABEL org.opencontainers.image.title="KRITIA API" \
      org.opencontainers.image.description="Backend de gestion BTP KRITIA" \
      org.opencontainers.image.vendor="KRITIA"
WORKDIR /app
RUN apk add --no-cache openssl
COPY --from=production-deps /app/dist ./dist
COPY --from=production-deps /app/node_modules ./node_modules
COPY --from=production-deps /app/package*.json ./
COPY --from=production-deps /app/prisma ./prisma
COPY docker-entrypoint.sh /usr/local/bin/kritia-entrypoint
RUN chmod +x /usr/local/bin/kritia-entrypoint && mkdir -p /app/uploads && chown -R node:node /app
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD wget -qO- http://127.0.0.1:3000/api/health/ready >/dev/null || exit 1
ENTRYPOINT ["/usr/local/bin/kritia-entrypoint"]
CMD ["node", "dist/src/main"]
