FROM alpine:latest

RUN apk add --update nodejs npm

COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json

RUN cd /app; npm install

COPY . /app

ENTRYPOINT [ "node","app/index.js" ]