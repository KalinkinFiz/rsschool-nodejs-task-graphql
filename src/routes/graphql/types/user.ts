import { FastifyInstance } from 'fastify';
import { GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';

import { profile, post, memberType } from './index';

// @ts-ignore
export const user = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    subscribedToUserIds: { type: new GraphQLList(GraphQLString) },
    profile: {
      type: profile,
      async resolve({ id }, _args, context: FastifyInstance) {
        const profile = await context.db.profiles.findOne({
          key: 'userId',
          equals: id,
        });

        return profile;
      },
    },
    posts: {
      type: new GraphQLList(post),
      async resolve({ id }, _args, context: FastifyInstance) {
        const post = await context.db.posts.findMany({
          key: 'userId',
          equals: id,
        });

        return post;
      },
    },
    memberType: {
      type: memberType,
      async resolve({ id }, _args, context: FastifyInstance) {
        const profile = await context.db.profiles.findOne({
          key: 'userId',
          equals: id,
        });

        if (!profile) {
          return Promise.resolve(null);
        }

        const getMemberType = await context.db.memberTypes.findOne({
          key: 'id',
          equals: profile.memberTypeId,
        });

        return getMemberType;
      },
    },
    subscribedToUser: {
      type: new GraphQLList(user),
      async resolve({ subscribedToUserIds }, _args, context: FastifyInstance) {
        const usersSubscribed = await context.db.users.findMany({
          key: 'id',
          equalsAnyOf: subscribedToUserIds,
        });

        return usersSubscribed;
      },
    },
    userSubscribedTo: {
      type: new GraphQLList(user),
      async resolve({ id }, _args, context: FastifyInstance) {
        const getUserSubscribed = await context.db.users.findMany({
          key: 'subscribedToUserIds',
          inArray: id,
        });

        return getUserSubscribed;
      },
    },
  }),
});
