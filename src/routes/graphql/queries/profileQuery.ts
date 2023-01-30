import { FastifyInstance } from 'fastify';
import { GraphQLID, GraphQLList } from 'graphql';

import { profile } from '../types';

export const getProfileQueries = (fastify: FastifyInstance) => ({
  profiles: {
    type: new GraphQLList(profile),
    resolve() {
      return fastify.db.profiles.findMany();
    },
  },

  profile: {
    type: profile,
    args: {
      id: { type: GraphQLID },
    },
    async resolve(_: any, args: { id: any }) {
      const profile = await fastify.loaders.profiles.load(args.id);

      if (!profile) {
        throw fastify.httpErrors.notFound('Profile not found');
      }

      return profile;
    },
  },
});
