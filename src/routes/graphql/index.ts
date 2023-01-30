import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import {
  graphql,
  GraphQLObjectType,
  GraphQLSchema,
  parse,
  validate,
} from 'graphql';

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
import depthLimit = require('graphql-depth-limit');

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
    async function (request, reply) {
      const { query, variables } = request.body;

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

      const errors = validate(schema, parse(String(query)), [depthLimit(6)]);

      if (errors.length > 0) {
        reply.send({ errors: errors, data: null });

        return;
      }

      return await graphql({
        schema: schema,
        source: String(query),
        variableValues: variables,
        contextValue: fastify,
      });
    },
  );
};

export default plugin;
