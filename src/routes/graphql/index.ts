import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { graphql, GraphQLObjectType, GraphQLSchema } from 'graphql';

import { graphqlBodySchema } from './schema';
import {
  getUserQueries,
  getPostQueries,
  getProfileQueries,
  getMemberTypeQueries,
} from './queries';
import {
  userMutations,
  profileMutations,
  postMutations,
  memberTypeMutations,
  subscriptionMutations,
} from './mutations';

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
            ...getUserQueries(fastify),

            ...getPostQueries(fastify),

            ...getProfileQueries(fastify),

            ...getMemberTypeQueries(fastify),
          },
        }),

        mutation: new GraphQLObjectType({
          name: 'Mutation',
          fields: {
            ...userMutations(fastify),

            ...profileMutations(fastify),

            ...postMutations(fastify),

            ...memberTypeMutations(fastify),

            ...subscriptionMutations(fastify),
          },
        }),
      });

      return await graphql({ schema, source: request.body.query! });
    },
  );
};

export default plugin;
