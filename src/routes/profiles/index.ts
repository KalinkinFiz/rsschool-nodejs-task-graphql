import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createProfileBodySchema, changeProfileBodySchema } from './schema';
import type { ProfileEntity } from '../../utils/DB/entities/DBProfiles';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify,
): Promise<void> => {
  fastify.get('/', async function (_request, reply): Promise<ProfileEntity[]> {
    return reply.status(200).send(this.db.profiles.findMany());
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const profile = await this.db.profiles.findOne({
        key: 'id',
        equals: request.params.id,
      });

      if (!profile) {
        return reply.status(404).send({ message: 'Profile not found' });
      }

      return reply.status(200).send(profile);
    },
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createProfileBodySchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const memberType = await this.db.memberTypes.findOne({
        key: 'id',
        equals: request.body.memberTypeId,
      });

      if (!memberType) {
        return reply.status(400).send({ message: 'Bad Request' });
      }

      const hasUserProfile = await this.db.profiles.findOne({
        key: 'userId',
        equals: request.body.userId,
      });

      if (hasUserProfile) {
        return reply.status(400).send({ message: 'User has profile' });
      }

      const newProfile = await this.db.profiles.create(request.body);

      return reply.status(201).send(newProfile);
    },
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const profile = await this.db.profiles.findOne({
        key: 'id',
        equals: request.params.id,
      });

      if (!profile) {
        return reply.code(400).send({ message: 'Bad Request' });
      }

      const deleteProfile = await this.db.profiles.delete(request.params.id);

      return reply.status(204).send(deleteProfile);
    },
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeProfileBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const profile = await this.db.profiles.findOne({
        key: 'id',
        equals: request.params.id,
      });

      if (!profile) {
        return reply.code(400).send({ message: 'Bad Request' });
      }

      const updateProfile = await this.db.profiles.change(
        request.params.id,
        request.body,
      );

      return reply.status(200).send(updateProfile);
    },
  );
};

export default plugin;
