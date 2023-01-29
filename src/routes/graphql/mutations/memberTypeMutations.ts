import { FastifyInstance } from 'fastify';
import { GraphQLID, GraphQLInt, GraphQLNonNull } from 'graphql';

import { memberType } from '../types';

export const memberTypeMutations = (fastify: FastifyInstance) => ({
  updateMemberTypes: {
    type: memberType,
    args: {
      id: { type: new GraphQLNonNull(GraphQLID) },
      discount: { type: GraphQLInt },
      monthPostsLimit: { type: GraphQLInt },
    },
    async resolve(_: any, args: any) {
      const memberType = await fastify.db.memberTypes.findOne({
        key: 'id',
        equals: args.id,
      });

      if (!memberType) {
        throw fastify.httpErrors.notFound('MemberType not found');
      }

      const newMemberType = await fastify.db.memberTypes.change(args.id, args);

      return newMemberType;
    },
  },
});
