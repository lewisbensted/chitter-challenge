# Chitter

## Description:
A mock Twitter app where users are able to post "cheets" (messages up to 50 characters in length) to a public forum, as well as view and reply to other users' cheets. The app also allows direct messages to be sent between users.

## Requirements

* [Node.js](https://nodejs.org/en)
* [MySQL](https://www.mysql.com/) (Server)

## Setup

1. Clone this repo:

```sh
  git clone https://github.com/lewisbensted/chitter.git
```

2. Install dependencies from the project [root directory](/):

```sh
  npm install-all
```

3. Create _.env_ files for the respective environments in the [root directory](/):

```sh
  touch .env.development
  touch .env.test
  touch .env.production
```

4. Populate the _.env_ files with the following environment variables, assigning values where necessary:

```sh
  PORT =                # Point of entry to the frontend app for non-prod environments (defaults to 3000)
  SERVER_PORT =         # Point of entry to the server

  REACT_APP_SERVER_URL = http://localhost:${SERVER_PORT}

  DB_NAME =             # Name of the database in a particular environment, eg. chitter_dev
  DB_USER =             # Username of MySQL connection
  DB_PASSWORD =         # Password of MySQL connection
  DB_PORT =             # Point of access to the MySQL server - 3306 by default

  DATABASE_URL = mysql://${DB_USER}:${DB_PASSWORD}@localhost:${DB_PORT}/${DB_NAME}

```

5. Migrate databases:

```sh
  npm run migrate:dev
  npm run migrate:test
  npm run migrate:prod
```

## Execution

From the [root directory](/), run:

```sh
npm run start:dev
npm run start:test
npm run start:prod
```

Non-production environments require the client and server to be run on separate ports, with HTTP requests being sent between them. To access the app in non-prod environments, follow the instructions in the terminal.  
In the production environment, however, the frontend app is first built and is then served by the backend. This allows the app to run on a single port which can be accessed via the SERVER_URL in the _.env_ file.  
Once the app is running, the user must register and then login to an account in order to post and reply to cheets.

## Testing

## Tech Stack

[![My Skills](https://skillicons.dev/icons?i=nodejs,ts,express,react,prisma,mysql,vitest,materialui,vscode,github)](https://skillicons.dev)
