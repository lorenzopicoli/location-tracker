FROM node:21-alpine

RUN mkdir -p /app


WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

RUN npm install

COPY ./src ./src

RUN npm run build

RUN rm -rf ./src

RUN mkdir data

EXPOSE 3000

CMD [ "node", "build/index.js" ]
