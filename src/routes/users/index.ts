import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import {
  createUserBodySchema,
  changeUserBodySchema,
  subscribeBodySchema,
} from './schemas';
import type { UserEntity } from '../../utils/DB/entities/DBUsers';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify,
): Promise<void> => {
  fastify.get('/', async function (_request, reply): Promise<UserEntity[]> {
    return reply.send(this.db.users.findMany());
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const user = await this.db.users.findOne({
        key: 'id',
        equals: request.params.id,
      });

      if (!user) return reply.code(404).send({ message: 'User not found' });

      return reply.send(user);
    },
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createUserBodySchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const addUser = await this.db.users.create(request.body);

      return reply.status(201).send(addUser);
    },
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      try {
        const user = await this.db.users.delete(request.params.id);

        const userPosts = await this.db.posts.findMany({
          key: 'userId',
          equals: request.params.id,
        });

        const subscribers = await this.db.users.findMany({
          key: 'subscribedToUserIds',
          equals: [user.id]!,
        });

        for (const userPost of userPosts) {
          await this.db.posts.delete(userPost.id);
        }

        for (const subscriber of subscribers) {
          await this.db.users.change(subscriber.id, {
            subscribedToUserIds: subscriber.subscribedToUserIds.filter(
              (subscriberId) => subscriberId !== user.id,
            ),
          });
        }

        return reply.send(user);
      } catch {
        return reply.status(400).send({ message: 'Bad Request' });
      }
    },
  );

  fastify.post(
    '/:id/subscribeTo',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const user = await this.db.users.findOne({
        key: 'id',
        equals: request.params.id,
      });

      const currentUser = await this.db.users.findOne({
        key: 'id',
        equals: request.body.userId,
      });

      if (!user) {
        return reply.status(404).send({ message: 'User not found' });
      }

      const newUser = await this.db.users.change(request.body.userId, {
        subscribedToUserIds: [
          ...currentUser!.subscribedToUserIds,
          request.params.id,
        ],
      });

      return reply.status(200).send(newUser);
    },
  );

  fastify.post(
    '/:id/unsubscribeFrom',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const user = await this.db.users.findOne({
        key: 'id',
        equals: request.params.id,
      });

      const currentUser = await this.db.users.findOne({
        key: 'id',
        equals: request.body.userId,
      });

      if (!user) {
        return reply.status(404).send({ message: 'User not found' });
      }

      const userSubscribedToAnotherUser =
        currentUser!.subscribedToUserIds.includes(request.params.id);

      if (!userSubscribedToAnotherUser) {
        return reply.status(400).send({ message: 'Bad Request' });
      }

      currentUser!.subscribedToUserIds.splice(
        currentUser!.subscribedToUserIds.indexOf(request.params.id),
        1,
      );

      const newUser = await this.db.users.change(request.body.userId, {
        subscribedToUserIds: currentUser!.subscribedToUserIds,
      });

      return reply.send(newUser);
    },
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeUserBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const user = await this.db.users.findOne({
        key: 'id',
        equals: request.params.id,
      });

      if (!user) return reply.status(400).send({ message: 'Bad Request' });

      const newUser = await this.db.users.change(
        request.params.id,
        request.body,
      );

      return reply.send(newUser);
    },
  );
};

export default plugin;
