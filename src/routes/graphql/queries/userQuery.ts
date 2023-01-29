import { FastifyInstance } from 'fastify';
import { GraphQLID, GraphQLList } from 'graphql';

import { user } from '../types';

export const getUserQueries = (fastify: FastifyInstance) => ({
  users: {
    type: new GraphQLList(user),
    resolve() {
      return fastify.db.users.findMany();
    },
  },

  user: {
    type: user,
    args: {
      id: { type: GraphQLID },
    },
    async resolve(_: any, args: { id: string }) {
      const user = await fastify.db.users.findOne({
        key: 'id',
        equals: args.id,
      });

      if (!user) {
        throw fastify.httpErrors.notFound('User not found');
      }

      return user;
    },
  },
});
