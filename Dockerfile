FROM node:14.7.0-slim

COPY package.json package-lock.json /app/

WORKDIR /app

RUN npm ci --quiet

COPY . ./

RUN npm run --quiet build

RUN npm prune --production

ENV NODE_ENV=production

ENTRYPOINT ["node"]

CMD ["/app/dist/run.js"]
