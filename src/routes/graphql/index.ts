import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import {
  graphql,
  GraphQLList,
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
                id: { type: GraphQLString },
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
                id: { type: GraphQLString },
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
                id: { type: GraphQLString },
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
                id: { type: GraphQLString },
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
      });

      return await graphql({ schema, source: request.body.query! });
    },
  );
};

export default plugin;
