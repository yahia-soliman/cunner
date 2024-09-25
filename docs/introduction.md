# cunner

A cloud computing platform, where you can test the code output safely.


## Features
- **User Authentication**
- Storing code snippets, executing them, and storing the output
- Supporting different languges dynamicly from Docker hub, using Admin account
- Supporting different versions of languages


### Usage
After creating an account and registering you can discover available languages and versions using `GET /languages` you can Create, Retrieve, Update, or Delete snippets and run them `GET /snippets/{id}/run`

### Adminstration
After logging in as an Admin, you can:
- Support different languages with different versions, as long as it is in Docker hub and you know how to run a file written with it.
- Delete entire languages or specific versions


## Dependencies

|                                       | recommended version |
| ------------------------------------- | ------------------- |
| [Node.js](https://nodejs.org/en)      | 20.16               |
| [MongoDB](https://www.mongodb.com/)   | 7.0.12              |
| [DockerAPI](https://www.docker.com/)  | 1.46                |
| [Redis](https://redis.io/)            | 7.0.8               |


## TODO
- [x] Create Docker API abstraction
- [x] Create Docker Container Wrapper
- [x] Create Docker Image Wrapper
- [x] Create and Test the Language Service
- [x] Create and Test the Snippet Service
- [x] Build the API and connect it with the services
- [x] Handle Validation before accessing the services
- [x] Handle Auth service, and Auth routes
- [x] protect /snippets route with authentication
- [x] protect /languages route with Admin authorization
- [x] Improve Internal Server Error handeling
- [x] Make documentation with Scalar or Redoc
- [ ] Handle /snippets/:id/run endpoint
