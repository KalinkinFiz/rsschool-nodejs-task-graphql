import { FastifyInstance } from 'fastify';

import { memberType, UpdateMemberTypeInput } from '../types';

export const memberTypeMutations = (fastify: FastifyInstance) => ({
  updateMemberTypes: {
    type: memberType,
    args: { member: { type: UpdateMemberTypeInput } },
    async resolve(_: any, args: any) {
      const memberType = await fastify.db.memberTypes.findOne({
        key: 'id',
        equals: args.member.id,
      });

      if (!memberType) {
        throw fastify.httpErrors.notFound('MemberType not found');
      }

      const newMemberType = await fastify.db.memberTypes.change(
        args.member.id,
        args.member,
      );

      return newMemberType;
    },
  },
});
