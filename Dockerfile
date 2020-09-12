FROM node:14.7.0-slim AS build

COPY package.json package-lock.json /app/

WORKDIR /app

RUN npm ci --quiet

COPY . ./

RUN npm run --quiet build

RUN npm prune --production

FROM gcr.io/distroless/nodejs:14

ENV NODE_ENV=production

COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist
COPY --from=build /app/package.json /app/package-lock.json /app/

WORKDIR /app

CMD ["/app/dist/run.js"]
