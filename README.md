# Bestyol backend

Backend for the BestYol web app.

## Table Of Contents

-   [Table Of Contents](#table-of-contents)
-   [Techs](#Techs)
-   [Getting Started](#getting-started)
-   [Requirements](#requirements)
-   [Installation](#installation)
-   [Local](#local)
-   [Docker (optional)](#docker-optional)

## Techs

-   [Express](https://expressjs.com/en/5x/api.html) with [Typescript](https://www.typescriptlang.org/docs/)
-   [Prisma](https://www.prisma.io/docs)

## Getting started

### Requirements

-   [Node.js installed with NPM](https://nodejs.org/en/download/package-manager)

#### options

##### Docker

With this option you just have to follow instruction [here](#docker-optional)

-   [Docker](https://www.docker.com/)

##### PostgreSQL

Either build your own database on your machine

-   [PostgreSQL](https://www.postgresql.org/download/)

Or use an online solution

-   [Neon](https://neon.tech/)

### Installation

1 - Install modules

```bash
npm i
```

2 - **Make sure to create an env file from .env.example**

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

Either use :

```bash
npm run dockerize
```

Or do it manually with these steps:

1 - Build the bestyol-back image with this command:

```bash
docker build -t bestyol-back .
```

2 - Build/run the container:

```bash
docker-compose up -d
```
