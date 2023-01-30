import { FastifyInstance } from 'fastify';

import { user, SubscribeUserInput, UnsubscribeUserInput } from '../types';

export const subscriptionMutations = (fastify: FastifyInstance) => ({
  subscribedToUser: {
    type: user,
    args: { user: { type: SubscribeUserInput } },
    async resolve(_: any, args: any) {
      const user = await fastify.db.users.findOne({
        key: 'id',
        equals: args.user.id,
      });

      if (!user) {
        throw fastify.httpErrors.notFound('User not found');
      }

      const subscribeToUser = await fastify.db.users.findOne({
        key: 'id',
        equals: args.user.subscribedToUserId,
      });

      if (!subscribeToUser) {
        throw fastify.httpErrors.notFound('subscribeToUser not found');
      }

      if (args.user.id === args.user.subscribedToUserId) {
        throw fastify.httpErrors.badRequest('Subscribe to yourself');
      }

      if (subscribeToUser.subscribedToUserIds.includes(args.user.id)) {
        throw fastify.httpErrors.badRequest('User subscribed');
      }

      const updateUser = await fastify.db.users.change(
        args.user.subscribedToUserId,
        {
          subscribedToUserIds: [
            ...subscribeToUser.subscribedToUserIds,
            args.user.id,
          ],
        },
      );

      return updateUser;
    },
  },

  unsubscribedToUser: {
    type: user,
    args: { user: { type: UnsubscribeUserInput } },
    async resolve(_: any, args: any) {
      const user = await fastify.db.users.findOne({
        key: 'id',
        equals: args.user.id,
      });

      if (!user) {
        throw fastify.httpErrors.notFound('User not found');
      }

      const unsubscribeToUser = await fastify.db.users.findOne({
        key: 'id',
        equals: args.user.unsubscribedToUserId,
      });

      if (!unsubscribeToUser) {
        throw fastify.httpErrors.notFound('unsubscribeToUser not found');
      }

      if (args.user.id === args.user.unsubscribedToUserId) {
        throw fastify.httpErrors.badRequest('Unsubscribe to yourself');
      }

      const { subscribedToUserIds } = unsubscribeToUser;

      const cb = (id: string | number) => id !== args.user.id;
      const newSubscribedToUserIds = subscribedToUserIds.filter(cb);

      try {
        const updateUser = await fastify.db.users.change(
          args.user.unsubscribedToUserId,
          { subscribedToUserIds: newSubscribedToUserIds },
        );

        return updateUser;
      } catch (err: any) {
        throw fastify.httpErrors.badRequest(err.message);
      }
    },
  },
});
