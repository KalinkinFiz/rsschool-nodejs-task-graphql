import { FastifyInstance } from 'fastify';

import { user, CreateUserInput, UpdateUserInput } from '../types';

export const userMutations = (fastify: FastifyInstance) => ({
  createNewUser: {
    type: user,
    args: { user: { type: CreateUserInput } },
    async resolve(_: any, args: any) {
      const user = await fastify.db.users.create({
        firstName: args.user.firstName,
        lastName: args.user.lastName,
        email: args.user.email,
      });

      return user;
    },
  },

  updateUser: {
    type: user,
    args: { user: { type: UpdateUserInput } },
    async resolve(_: any, args: any) {
      const user = await fastify.db.users.findOne({
        key: 'id',
        equals: args.user.id,
      });

      if (!user) {
        throw fastify.httpErrors.notFound('User not found');
      }

      const newUser = await fastify.db.users.change(args.user.id, args.user);

      return newUser;
    },
  },
});
