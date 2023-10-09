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

2 - Create a [random UUID](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID) jwt tokens and add it to env file.

3 - Build the bestyol-back image with this command:

```bash
docker build -t bestyol-back
```

4 - Build/run the container

```
docker-compose up -d
```
