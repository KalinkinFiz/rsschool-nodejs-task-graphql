import { FastifyInstance } from 'fastify';
import { GraphQLID, GraphQLList } from 'graphql';

import { post } from '../types';

export const getPostQueries = (fastify: FastifyInstance) => ({
  posts: {
    type: new GraphQLList(post),
    resolve() {
      return fastify.db.posts.findMany();
    },
  },

  post: {
    type: post,
    args: {
      id: { type: GraphQLID },
    },
    async resolve(_: any, args: { id: any }) {
      const post = await fastify.loaders.posts.load(args.id);

      if (!post) {
        throw fastify.httpErrors.notFound('Post not found');
      }

      return post;
    },
  },
});
