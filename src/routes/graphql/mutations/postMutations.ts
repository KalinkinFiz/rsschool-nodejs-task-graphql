import { FastifyInstance } from 'fastify';

import { post, CreatePostInput, UpdatePostInput } from '../types';

export const postMutations = (fastify: FastifyInstance) => ({
  createNewPost: {
    type: post,
    args: { post: { type: CreatePostInput } },
    async resolve(_: any, args: any) {
      const user = await fastify.db.users.findOne({
        key: 'id',
        equals: args.post.userId,
      });

      if (!user) {
        throw fastify.httpErrors.notFound('User not found');
      }

      const post = await fastify.db.posts.create({
        userId: args.post.userId,
        title: args.post.title,
        content: args.post.content,
      });

      return post;
    },
  },

  updatePost: {
    type: post,
    args: { post: { type: UpdatePostInput } },
    async resolve(_: any, args: any) {
      const post = await fastify.db.posts.findOne({
        key: 'id',
        equals: args.post.id,
      });

      if (!post) {
        throw fastify.httpErrors.notFound('Post not found');
      }

      const newPost = await fastify.db.posts.change(args.post.id, args.post);

      return newPost;
    },
  },
});
