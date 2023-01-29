import { FastifyInstance } from 'fastify';
import { GraphQLID, GraphQLNonNull } from 'graphql';

import { user } from '../types';

export const subscriptionMutations = (fastify: FastifyInstance) => ({
  subscribedToUser: {
    type: user,
    args: {
      id: { type: new GraphQLNonNull(GraphQLID) },
      subscribedToUserId: { type: new GraphQLNonNull(GraphQLID) },
    },
    async resolve(_: any, args: any) {
      const user = await fastify.db.users.findOne({
        key: 'id',
        equals: args.id,
      });

      if (!user) {
        throw fastify.httpErrors.notFound('User not found');
      }

      const subscribeToUser = await fastify.db.users.findOne({
        key: 'id',
        equals: args.subscribedToUserId,
      });

      if (!subscribeToUser) {
        throw fastify.httpErrors.notFound('subscribeToUser not found');
      }

      if (args.id === args.subscribedToUserId) {
        throw fastify.httpErrors.badRequest('Subscribe to yourself');
      }

      if (subscribeToUser.subscribedToUserIds.includes(args.id)) {
        throw fastify.httpErrors.badRequest('User subscribed');
      }

      const updateUser = await fastify.db.users.change(
        args.subscribedToUserId,
        {
          subscribedToUserIds: [
            ...subscribeToUser.subscribedToUserIds,
            args.id,
          ],
        },
      );

      return updateUser;
    },
  },

  unsubscribedToUser: {
    type: user,
    args: {
      id: { type: new GraphQLNonNull(GraphQLID) },
      unsubscribedToUserId: { type: new GraphQLNonNull(GraphQLID) },
    },
    async resolve(_: any, args: any) {
      const user = await fastify.db.users.findOne({
        key: 'id',
        equals: args.id,
      });

      if (!user) {
        throw fastify.httpErrors.notFound('User not found');
      }

      const unsubscribeToUser = await fastify.db.users.findOne({
        key: 'id',
        equals: args.unsubscribedToUserId,
      });

      if (!unsubscribeToUser) {
        throw fastify.httpErrors.notFound('unsubscribeToUser not found');
      }

      if (args.id === args.unsubscribedToUserId) {
        throw fastify.httpErrors.badRequest('Unsubscribe to yourself');
      }

      const { subscribedToUserIds } = unsubscribeToUser;

      const cb = (id: string | number) => id !== args.id;
      const newSubscribedToUserIds = subscribedToUserIds.filter(cb);

      try {
        const updateUser = await fastify.db.users.change(
          args.unsubscribedToUserId,
          { subscribedToUserIds: newSubscribedToUserIds },
        );

        return updateUser;
      } catch (err: any) {
        throw fastify.httpErrors.badRequest(err.message);
      }
    },
  },
});
