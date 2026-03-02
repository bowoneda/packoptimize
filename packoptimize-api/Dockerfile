FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine
WORKDIR /app
RUN apk add --no-cache dumb-init
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
COPY --from=build /app/prisma.config.js ./prisma.config.js
COPY --from=build /app/prisma ./prisma
EXPOSE 3000
USER node
CMD ["dumb-init", "node", "dist/main.js"]
