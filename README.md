# Bestyol backend

## Techs

-   [Express](https://expressjs.com/en/5x/api.html) with [Typescript](https://www.typescriptlang.org/docs/)
-   [Prisma](https://www.prisma.io/docs)

## Requirements

-   [Node.js installed with NPM](https://nodejs.org/en/download/package-manager)
-   a PostgreSQL database (if you're not using docker-compose)

If you want to build the backend + database as a docker image:

-   [Docker](https://www.docker.com/)

## Installation

```bash
npm i
```

## Usage

dev env:

```bash
npm run dev
```

build:

```bash
npm run build
```

prod:

```bash
npm run start
```

## Docker setup (optional)

1 - Make sure to create an env file from .env.example.

2 - Create two [random UUID](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID) and **_add it to env file_** to both tokens, both should be different

```js
crypto.randomUUID();
```

3 - Run build command:

```bash
npm run build
```

4 - Build the bestyol-back image with this command:

```bash
docker build -t bestyol-back .
```

5 - Build/run the container:

```bash
docker-compose up -d
```
