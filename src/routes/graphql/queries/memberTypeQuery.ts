import { FastifyInstance } from 'fastify';
import { GraphQLID, GraphQLList } from 'graphql';

import { memberType } from '../types';

export const getMemberTypeQueries = (fastify: FastifyInstance) => ({
  memberTypes: {
    type: new GraphQLList(memberType),
    resolve() {
      return fastify.db.memberTypes.findMany();
    },
  },

  memberType: {
    type: memberType,
    args: {
      id: { type: GraphQLID },
    },
    async resolve(_: any, args: { id: any }) {
      const memberType = await fastify.loaders.memberTypes.load(args.id);

      if (!memberType) {
        throw fastify.httpErrors.notFound('MemberType not found');
      }

      return memberType;
    },
  },
});
