# Project Outline

As mentioned in the introduction the project is centered around running code snippets for different language and different versions of a language.

## Authentication
most of the api end point require authentication, to authenticate you need to `POST /auth/login` and you need an account to login with `POST /auth/register`

**There is a special accout "The Admin"**
In the `.env` file you can specify the email and password for that account.
this will allow you to manipulate the `/languages`

## Language
To support a language you can `POST /languages`
