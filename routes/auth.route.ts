import { FastifyInstance } from 'fastify';
import * as sessionService from '../services/session.auth.js';
import * as userService from '../services/user.js';
import yup from 'yup';
import { User } from '../models/user.model.js';

const postBody = {
  email: yup.string().email().required(),
  password: yup.string().required().min(8),
};

const userRes = {
  email: yup.string(),
  name: yup.string(),
  created: yup.date(),
  updated: yup.date(),
};

const postRes = {
  token: yup.string(),
};

/**
 * Encapsulates the controller and validation logic for the session service
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 */
export default async function route(fastify: FastifyInstance) {
  const tags = ['auth'];
  fastify.post<{ Body: User }>(
    '/login',
    {
      schema: {
        body: yup.object(postBody).required('Email and password are required'),
        response: { 200: yup.object(postRes) },
        description: 'Login and get a session token',
        tags,
      },
    },
    async (req) => {
      const { email, password } = req.body;
      const token = await sessionService.createSession(email, password);
      return { token };
    },
  );

  fastify.post<{ Body: User }>(
    '/register',
    {
      schema: {
        body: yup
          .object({ ...postBody, name: yup.string().required().min(1) })
          .required('Empty body'),
        response: { 200: yup.object(userRes) },
        description: 'Create a new user account',
        tags,
      },
    },
    async (req) => await userService.newUser(req.body),
  );

  fastify.get(
    '/me',
    {
      schema: {
        response: {
          200: yup.object(userRes),
        },
        tags,
        description: 'Get the current logged in user',
      },
    },
    async (req) => {
      return await sessionService.getUser(req.headers.authorization);
    },
  );

  fastify.delete(
    '/logout',
    {
      schema: {
        response: { 200: yup.object({ message: yup.string() }) },
        description: 'Logout and invalidate the current session',
        tags,
      },
    },
    async (req) => {
      await sessionService.deleteSession(req.headers.authorization);
      return { message: 'Logged out' };
    },
  );
}
