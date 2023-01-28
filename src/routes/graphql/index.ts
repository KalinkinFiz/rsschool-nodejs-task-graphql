import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import {
  graphql,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';

import { graphqlBodySchema } from './schema';
import { user, post, memberType, profile } from './types';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify,
): Promise<void> => {
  fastify.post(
    '/',
    {
      schema: {
        body: graphqlBodySchema,
      },
    },
    async function (request, _reply) {
      const schema: GraphQLSchema = new GraphQLSchema({
        query: new GraphQLObjectType({
          name: 'Query',
          fields: {
            users: {
              type: new GraphQLList(user),
              resolve() {
                return fastify.db.users.findMany();
              },
            },
            profiles: {
              type: new GraphQLList(profile),
              resolve() {
                return fastify.db.profiles.findMany();
              },
            },
            posts: {
              type: new GraphQLList(post),
              resolve() {
                return fastify.db.posts.findMany();
              },
            },
            memberTypes: {
              type: new GraphQLList(memberType),
              resolve() {
                return fastify.db.memberTypes.findMany();
              },
            },

            user: {
              type: user,
              args: {
                id: { type: GraphQLID },
              },
              async resolve(_, args) {
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
            profile: {
              type: profile,
              args: {
                id: { type: GraphQLID },
              },
              async resolve(_, args) {
                const profile = await fastify.db.profiles.findOne({
                  key: 'id',
                  equals: args.id,
                });

                if (!profile) {
                  throw fastify.httpErrors.notFound('Profile not found');
                }

                return profile;
              },
            },
            post: {
              type: post,
              args: {
                id: { type: GraphQLID },
              },
              async resolve(_, args) {
                const post = await fastify.db.posts.findOne({
                  key: 'id',
                  equals: args.id,
                });

                if (!post) {
                  throw fastify.httpErrors.notFound('Post not found');
                }

                return post;
              },
            },
            memberType: {
              type: memberType,
              args: {
                id: { type: GraphQLID },
              },
              async resolve(_, args) {
                const memberType = await fastify.db.memberTypes.findOne({
                  key: 'id',
                  equals: args.id,
                });

                if (!memberType) {
                  throw fastify.httpErrors.notFound('MemberType not found');
                }

                return memberType;
              },
            },
          },
        }),

        mutation: new GraphQLObjectType({
          name: 'Mutation',
          fields: {
            createNewUser: {
              type: user,
              args: {
                firstName: { type: new GraphQLNonNull(GraphQLString) },
                lastName: { type: new GraphQLNonNull(GraphQLString) },
                email: { type: new GraphQLNonNull(GraphQLString) },
              },
              async resolve(_, args) {
                const user = await fastify.db.users.create({
                  firstName: args.firstName,
                  lastName: args.lastName,
                  email: args.email,
                });

                return user;
              },
            },
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
              async resolve(_, args) {
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
            createNewPost: {
              type: post,
              args: {
                userId: { type: new GraphQLNonNull(GraphQLID) },
                title: { type: new GraphQLNonNull(GraphQLString) },
                content: { type: new GraphQLNonNull(GraphQLString) },
              },
              async resolve(_, args) {
                const user = await fastify.db.users.findOne({
                  key: 'id',
                  equals: args.userId,
                });

                if (!user) {
                  throw fastify.httpErrors.notFound('User not found');
                }

                const post = await fastify.db.posts.create({
                  userId: args.userId,
                  title: args.title,
                  content: args.content,
                });

                return post;
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
              async resolve(_, args) {
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
              async resolve(_, args) {
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

                const newProfile = await fastify.db.profiles.change(
                  args.id,
                  args,
                );

                return newProfile;
              },
            },
            updatePost: {
              type: post,
              args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                title: { type: GraphQLString },
                content: { type: GraphQLString },
              },
              async resolve(_, args) {
                const post = await fastify.db.posts.findOne({
                  key: 'id',
                  equals: args.id,
                });

                if (!post) {
                  throw fastify.httpErrors.notFound('Post not found');
                }

                const newPost = await fastify.db.posts.change(args.id, args);

                return newPost;
              },
            },
            updateMemberTypes: {
              type: memberType,
              args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                discount: { type: GraphQLInt },
                monthPostsLimit: { type: GraphQLInt },
              },
              async resolve(_, args) {
                const memberType = await fastify.db.memberTypes.findOne({
                  key: 'id',
                  equals: args.id,
                });

                if (!memberType) {
                  throw fastify.httpErrors.notFound('MemberType not found');
                }

                const newMemberType = await fastify.db.memberTypes.change(
                  args.id,
                  args,
                );

                return newMemberType;
              },
            },

            subscribedToUser: {
              type: user,
              args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                subscribedToUserId: { type: new GraphQLNonNull(GraphQLID) },
              },
              async resolve(_, args) {
                const user = await fastify.db.users.findOne({
                  key: 'id',
                  equals: args.id,
                });

                if (!user) {
                  throw fastify.httpErrors.notFound('User not found');
                }

                const subscribeToUser = await fastify.db.users.findOne({
                  key: 'id',
                  equals: args.subscribedToUserId,
                });

                if (!subscribeToUser) {
                  throw fastify.httpErrors.notFound(
                    'subscribeToUser not found',
                  );
                }

                if (args.id === args.subscribedToUserId) {
                  throw fastify.httpErrors.badRequest('Subscribe to yourself');
                }

                if (subscribeToUser.subscribedToUserIds.includes(args.id)) {
                  throw fastify.httpErrors.badRequest('User subscribed');
                }

                const updateUser = await fastify.db.users.change(
                  args.subscribedToUserId,
                  {
                    subscribedToUserIds: [
                      ...subscribeToUser.subscribedToUserIds,
                      args.id,
                    ],
                  },
                );

                return updateUser;
              },
            },
            unsubscribedToUser: {
              type: user,
              args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                unsubscribedToUserId: { type: new GraphQLNonNull(GraphQLID) },
              },
              async resolve(_, args) {
                const user = await fastify.db.users.findOne({
                  key: 'id',
                  equals: args.id,
                });

                if (!user) {
                  throw fastify.httpErrors.notFound('User not found');
                }

                const unsubscribeToUser = await fastify.db.users.findOne({
                  key: 'id',
                  equals: args.unsubscribedToUserId,
                });

                if (!unsubscribeToUser) {
                  throw fastify.httpErrors.notFound(
                    'unsubscribeToUser not found',
                  );
                }

                if (args.id === args.unsubscribedToUserId) {
                  throw fastify.httpErrors.badRequest(
                    'Unsubscribe to yourself',
                  );
                }

                try {
                  const subscribedUserIndex =
                    unsubscribeToUser.subscribedToUserIds.indexOf(args.id);

                  unsubscribeToUser.subscribedToUserIds.splice(
                    subscribedUserIndex,
                    1,
                  );

                  const updateUser = await fastify.db.users.change(
                    args.unsubscribedToUserId,
                    {
                      subscribedToUserIds:
                        unsubscribeToUser.subscribedToUserIds,
                    },
                  );

                  return updateUser;
                } catch (err: any) {
                  throw fastify.httpErrors.badRequest(err.message);
                }
              },
            },
          },
        }),
      });

      return await graphql({ schema, source: request.body.query! });
    },
  );
};

export default plugin;
