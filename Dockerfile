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

ARG TYPEORM_CONNECTION=sqlite
ENV TYPEORM_CONNECTION=${TYPEORM_CONNECTION}

ARG TYPEORM_DATABASE="./database/database.sqlite"
ENV TYPEORM_DATABASE=${TYPEORM_DATABASE}

ARG TYPEORM_ENTITIES="./dist/**/*Entity.js"
ENV TYPEORM_ENTITIES=${TYPEORM_ENTITIES}

WORKDIR /home/app

COPY package.json package-lock.json ./
RUN npm ci --production && npm cache clean --force

COPY database.sqlite ./database/

COPY --from=build /home/app/dist ./dist

CMD [ "node", "dist/index.js" ]
