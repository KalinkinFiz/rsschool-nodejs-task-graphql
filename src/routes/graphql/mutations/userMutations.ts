import { FastifyInstance } from 'fastify';
import { GraphQLID, GraphQLNonNull, GraphQLString } from 'graphql';

import { user } from '../types';

export const userMutations = (fastify: FastifyInstance) => ({
  createNewUser: {
    type: user,
    args: {
      firstName: { type: new GraphQLNonNull(GraphQLString) },
      lastName: { type: new GraphQLNonNull(GraphQLString) },
      email: { type: new GraphQLNonNull(GraphQLString) },
    },
    async resolve(_: any, args: any) {
      const user = await fastify.db.users.create({
        firstName: args.firstName,
        lastName: args.lastName,
        email: args.email,
      });

      return user;
    },
  },

  updateUser: {
    type: user,
    args: {
      id: { type: new GraphQLNonNull(GraphQLID) },
      firstName: { type: GraphQLString },
      lastName: { type: GraphQLString },
      email: { type: GraphQLString },
    },
    async resolve(_: any, args: any) {
      const user = await fastify.db.users.findOne({
        key: 'id',
        equals: args.id,
      });

      if (!user) {
        throw fastify.httpErrors.notFound('User not found');
      }

      const newUser = await fastify.db.users.change(args.id, args);

      return newUser;
    },
  },
});
