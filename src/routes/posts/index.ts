import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createPostBodySchema, changePostBodySchema } from './schema';
import type { PostEntity } from '../../utils/DB/entities/DBPosts';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify,
): Promise<void> => {
  fastify.get('/', async function (_request, reply): Promise<PostEntity[]> {
    return reply.send(this.db.posts.findMany());
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const post = await this.db.posts.findOne({
        key: 'id',
        equals: request.params.id,
      });

      if (!post) {
        return reply.code(404).send({ message: 'Post not found' });
      }

      return reply.send(post);
    },
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createPostBodySchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const post = await this.db.users.findOne({
        key: 'id',
        equals: request.body.userId,
      });

      if (!post) {
        return reply.code(404).send({ message: 'Post not found' });
      }

      const newPost = await this.db.posts.create(request.body);

      return reply.send(newPost);
    },
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const post = await this.db.posts.findOne({
        key: 'id',
        equals: request.params.id,
      });

      if (!post) {
        return reply.code(400).send({ message: 'Post not found' });
      }

      const deletePost = await this.db.posts.delete(request.params.id);

      return reply.send(deletePost);
    },
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changePostBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      try {
        const updatePost = await this.db.posts.change(
          request.params.id,
          request.body,
        );

        return reply.send(updatePost);
      } catch (err: any) {
        return reply.code(400).send({ message: err.message });
      }
    },
  );
};

export default plugin;
