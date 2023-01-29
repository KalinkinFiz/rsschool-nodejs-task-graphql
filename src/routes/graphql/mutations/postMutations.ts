import { FastifyInstance } from 'fastify';
import { GraphQLID, GraphQLNonNull, GraphQLString } from 'graphql';

import { post } from '../types';

export const postMutations = (fastify: FastifyInstance) => ({
  createNewPost: {
    type: post,
    args: {
      userId: { type: new GraphQLNonNull(GraphQLID) },
      title: { type: new GraphQLNonNull(GraphQLString) },
      content: { type: new GraphQLNonNull(GraphQLString) },
    },
    async resolve(_: any, args: any) {
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

  updatePost: {
    type: post,
    args: {
      id: { type: new GraphQLNonNull(GraphQLID) },
      title: { type: GraphQLString },
      content: { type: GraphQLString },
    },
    async resolve(_: any, args: any) {
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
});
