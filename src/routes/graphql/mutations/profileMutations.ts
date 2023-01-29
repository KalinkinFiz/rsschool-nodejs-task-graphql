import { FastifyInstance } from 'fastify';
import { GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLString } from 'graphql';

import { profile } from '../types';

export const profileMutations = (fastify: FastifyInstance) => ({
  createNewProfile: {
    type: profile,
    args: {
      avatar: { type: new GraphQLNonNull(GraphQLString) },
      sex: { type: new GraphQLNonNull(GraphQLString) },
      birthday: { type: new GraphQLNonNull(GraphQLInt) },
      country: { type: new GraphQLNonNull(GraphQLString) },
      street: { type: new GraphQLNonNull(GraphQLString) },
      city: { type: new GraphQLNonNull(GraphQLString) },
      userId: { type: new GraphQLNonNull(GraphQLID) },
      memberTypeId: { type: new GraphQLNonNull(GraphQLString) },
    },
    async resolve(_: any, args: any) {
      const user = await fastify.db.users.findOne({
        key: 'id',
        equals: args.userId,
      });

      if (!user) {
        throw fastify.httpErrors.notFound('User not found');
      }

      const memberType = await fastify.db.memberTypes.findOne({
        key: 'id',
        equals: args.memberTypeId,
      });

      if (!memberType) {
        throw fastify.httpErrors.notFound('MemberType not found');
      }

      const hasUserProfile = await fastify.db.profiles.findOne({
        key: 'userId',
        equals: args.userId,
      });

      if (hasUserProfile) {
        throw fastify.httpErrors.badRequest('User has profile');
      }

      const profile = await fastify.db.profiles.create({
        avatar: args.avatar,
        sex: args.sex,
        birthday: args.birthday,
        country: args.country,
        street: args.street,
        city: args.city,
        userId: args.userId,
        memberTypeId: args.memberTypeId,
      });

      return profile;
    },
  },

  updateProfile: {
    type: profile,
    args: {
      id: { type: new GraphQLNonNull(GraphQLID) },
      avatar: { type: GraphQLString },
      sex: { type: GraphQLString },
      birthday: { type: GraphQLInt },
      country: { type: GraphQLString },
      street: { type: GraphQLString },
      city: { type: GraphQLString },
      memberTypeId: { type: GraphQLString },
    },
    async resolve(_: any, args: any) {
      const profile = await fastify.db.profiles.findOne({
        key: 'id',
        equals: args.id,
      });

      if (!profile) {
        throw fastify.httpErrors.notFound('Profile not found');
      }

      const memberType = await fastify.db.memberTypes.findOne({
        key: 'id',
        equals: args.memberTypeId,
      });

      if (!memberType) {
        throw fastify.httpErrors.notFound('MemberType not found');
      }

      const newProfile = await fastify.db.profiles.change(args.id, args);

      return newProfile;
    },
  },
});
