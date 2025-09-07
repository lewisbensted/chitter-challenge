# Chitter

## Description:
A mock Twitter app where users are able to post "cheets" (messages up to 50 characters in length) to a public forum, as well as view and reply to other users' cheets. The app also allows direct messages to be sent between users.

## Requirements

* [Node.js](https://nodejs.org/en)
* [MySQL](https://www.mysql.com/) (Server)

## Setup

1. Clone this repo:

```sh
  git clone https://github.com/lewisbensted/chitter-challenge.git
  cd chitter-challenge
```

2. Install dependencies for the root, frontend and server from the project [root directory](/):

```sh
  npm install-all
```

3. Create a _.env_ file to run in the relevant environment (`dev`, `test` or `prod`):

```sh
  touch .env.dev
```

4. Populate the _.env_ files with the following environment variables, assigning values where necessary:

```sh
  PORT =                # Entry point for frontend (defaults to 3000)
  SERVER_PORT =         # Entry point for server

  REACT_APP_SERVER_URL = http://localhost:${SERVER_PORT}

  DB_NAME =             # Database name in relevant environment
  DB_USER =             # MySQL username
  DB_PASSWORD =         # MySQL password
  DB_PORT =             # MySQL port (default 3306)

  DATABASE_URL = mysql://${DB_USER}:${DB_PASSWORD}@localhost:${DB_PORT}/${DB_NAME}

```

5. Migrate the relevant database (`dev`, `test` or `prod`) and generate the prisma client:

```sh
  npm run migrate:dev
```
Note: New migration files are only generated in `dev` or `test` environments. Existing migration files can be safely deployed to production environments using `npm run migrate:prod`, but cannot be created.

⚠️ To reset the database (destructive):
```sh
  npm run reset:dev
```

## Running the App

In `dev` and `test` environments, running the following from the [root directory](/) will start the frontend and server on separate ports:

```sh
npm run start:dev
```

To run the app in `prod`, all code must first be compiled so that the static frontend files can be served:
```sh
npm run build:prod
npm run start:prod
```

## Testing

## Tech Stack

[![My Skills](https://skillicons.dev/icons?i=nodejs,ts,express,react,prisma,mysql,vitest,materialui,vscode,github)](https://skillicons.dev)
