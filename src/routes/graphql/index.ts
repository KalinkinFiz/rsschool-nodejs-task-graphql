import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import {
  graphql,
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
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
          },
        }),
      });

      return await graphql({ schema, source: request.body.query! });
    },
  );
};

export default plugin;
