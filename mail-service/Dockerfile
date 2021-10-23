FROM node:alpine AS builder

WORKDIR /src

COPY package.json ./
COPY yarn.lock ./

RUN yarn

COPY . .

RUN yarn 
RUN npm prune --production

FROM node:alpine AS runner

WORKDIR /src

COPY --from=builder /src/node_modules ./node_modules
COPY --from=builder /src/dist ./dist
COPY --from=builder /src/package.json ./package.json

EXPOSE 3000

ENTRYPOINT ["node", "dist/index.js"]
USER node