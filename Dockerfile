FROM node:lts AS build

WORKDIR /home/app

COPY package.json package-lock.json ./

RUN npm ci

COPY tsconfig.build.json ./
COPY src ./src

RUN npm run build



FROM node:lts-alpine

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

EXPOSE 4000

WORKDIR /home/app

COPY package.json package-lock.json ./
RUN npm ci --production && npm cache clean --force

COPY --from=build /home/app/dist ./dist

CMD [ "node", "dist/index.js" ]
