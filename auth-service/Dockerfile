FROM node:alpine AS builder

WORKDIR /src

COPY package.json ./
COPY yarn.lock ./

RUN yarn

COPY . .

RUN yarn build
RUN npm prune --production

FROM node:alpine AS runner

WORKDIR /src

COPY --from=builder /src/node_modules ./node_modules
COPY --from=builder /src/dist ./dist
COPY --from=builder /src/.env ./.env
COPY --from=builder /src/.env.example ./.env.example
COPY --from=builder /src/ormconfig.js ./ormconfig.js
COPY --from=builder /src/package.json ./package.json

EXPOSE 4000

ENTRYPOINT ["node", "dist/index.js"]
USER node