FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate
RUN npm run build
RUN echo "===== DIST FILES =====" && find /app/dist -maxdepth 4 -type f

FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./

EXPOSE 3001
CMD ["node", "dist/main.js"]
