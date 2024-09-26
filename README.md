# cunner

A cloud computing platform, where you can test the code output safely.

This API aims to provide an easy way to run your code snippets in a remote machine, without having to install anything.
It provides an API for both the user to create, run, read, update, or delete snippets, and for the administirator of the application to support/unsupport different languages and versions.

## Features
- **User Authentication**: the users can only run code snippets and store them when they have an account.
- **Code Snippets**: Users can store, run, inspect their snippets.
- **Language Support**: Admins can manage the available language, and versions through the API so the user can work with.


### Usage
- Guests can show available languages, create an account, and login to an account.
- Users can do CRUD operations and run their snippets.
- Admins can do CRUD operations over languages and versions.

## Project Setup & Contribution
### Installation
If you want to run the project locally, you need to install the following dependencies:

|                                       | recommended version |
| ------------------------------------- | ------------------- |
| [Node.js](https://nodejs.org/en)      | 20.16               |
| [MongoDB](https://www.mongodb.com/)   | 7.0.12              |
| [DockerAPI](https://www.docker.com/)  | 1.46                |
| [Redis](https://redis.io/)            | 7.0.8               |

After installing the dependencies, you can clone the repository and run the following commands:

```bash
npm install
```

## Running the project
```bash
./tmux.sh
```
This script will start a tmux session with the following windows:
- `editor`: where the editor `neovim` will run
- `server`: where the nodejs, redis, and typescript compiler will run
- `client`: where mongosh will run to interact with the database

if you don't have tmux installed, you can run the following commands (each in a different terminal):

```bash
redis-server
mongod
npm run build:dev
npm run server:dev
```

### Environment Variables
You need to create a `.env` file in the root of the project with the following variables, you can adjust it based on your setup:

```bash
MONGO_URL=mongodb://localhost:27017
DB_NAME=cunner

ADMIN_NAME=cunner
ADMIN_EMAIL=admin@yes
ADMIN_PASS=strongpass
```
