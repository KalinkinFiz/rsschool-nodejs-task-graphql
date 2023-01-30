import { FastifyInstance } from 'fastify';

import { profile, CreateProfileInput, UpdateProfileInput } from '../types';

export const profileMutations = (fastify: FastifyInstance) => ({
  createNewProfile: {
    type: profile,
    args: { profile: { type: CreateProfileInput } },
    async resolve(_: any, args: any) {
      const user = await fastify.db.users.findOne({
        key: 'id',
        equals: args.profile.userId,
      });

      if (!user) {
        throw fastify.httpErrors.notFound('User not found');
      }

      const memberType = await fastify.db.memberTypes.findOne({
        key: 'id',
        equals: args.profile.memberTypeId,
      });

      if (!memberType) {
        throw fastify.httpErrors.notFound('MemberType not found');
      }

      const hasUserProfile = await fastify.db.profiles.findOne({
        key: 'userId',
        equals: args.profile.userId,
      });

      if (hasUserProfile) {
        throw fastify.httpErrors.badRequest('User has profile');
      }

      const newProfile = await fastify.db.profiles.create({
        avatar: args.profile.avatar,
        sex: args.profile.sex,
        birthday: args.profile.birthday,
        country: args.profile.country,
        street: args.profile.street,
        city: args.profile.city,
        userId: args.profile.userId,
        memberTypeId: args.profile.memberTypeId,
      });

      return newProfile;
    },
  },

  updateProfile: {
    type: profile,
    args: { profile: { type: UpdateProfileInput } },
    async resolve(_: any, args: any) {
      const profile = await fastify.db.profiles.findOne({
        key: 'id',
        equals: args.profile.id,
      });

      if (!profile) {
        throw fastify.httpErrors.notFound('Profile not found');
      }

      const memberType = await fastify.db.memberTypes.findOne({
        key: 'id',
        equals: args.profile.memberTypeId,
      });

      if (!memberType) {
        throw fastify.httpErrors.notFound('MemberType not found');
      }

      const newProfile = await fastify.db.profiles.change(
        args.profile.id,
        args.profile,
      );

      return newProfile;
    },
  },
});
