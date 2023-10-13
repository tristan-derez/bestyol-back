# Bestyol backend

Backend for the BestYol web app.

## Table Of Contents

-   [Table Of Contents](#table-of-contents)
-   [Techs](#Techs)
-   [Getting Started](#getting-started)
-   [Requirements](#requirements)
-   [Ínstallation](#installation)
-   [Local](#local)
-   [Docker (optional)](#docker-optional)

## Techs

-   [Express](https://expressjs.com/en/5x/api.html) with [Typescript](https://www.typescriptlang.org/docs/)
-   [Prisma](https://www.prisma.io/docs)

## Getting started

### Requirements

-   [Node.js installed with NPM](https://nodejs.org/en/download/package-manager)
-   a PostgreSQL database (if you're not using docker-compose)

If you want to build the backend + database as a docker image:

-   [Docker](https://www.docker.com/)

### Installation

1 - Install modules

```bash
npm i
```

2 - Make sure to create an env file from .env.example.

3 - Create two [random UUID](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID) and **_add it to env file_** to both tokens, both should be different

```js
crypto.randomUUID();
```

### Local

If you already have a local database or use a service like [Neon](https://neon.tech/)

1 - Generate Prisma client

```bash
npx prisma generate
```

2 - Run build command :

```bash
npm run build
```

3 - Push schema to database

```bash
npx prisma db push
```

4 - Seed database

```bash
node dist/prisma/seed.ts
```

5 - Start server

```bash
npm run build
```

### Docker (optional)

1 - Run build command:

```bash
npm run build
```

2 - Build the bestyol-back image with this command:

```bash
docker build -t bestyol-back .
```

3 - Build/run the container:

```bash
docker-compose up -d
```
