import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { changeMemberTypeBodySchema } from './schema';
import type { MemberTypeEntity } from '../../utils/DB/entities/DBMemberTypes';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify,
): Promise<void> => {
  fastify.get('/', async function (_request, reply): Promise<
    MemberTypeEntity[]
  > {
    return reply.send(this.db.memberTypes.findMany());
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<MemberTypeEntity> {
      const memberType = await this.db.memberTypes.findOne({
        key: 'id',
        equals: request.params.id,
      });

      if (!memberType) {
        return reply.code(404).send({ message: 'MemberType not found' });
      }

      return reply.send(memberType);
    },
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeMemberTypeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<MemberTypeEntity> {
      try {
        const newMemberType = await this.db.memberTypes.change(
          request.params.id,
          request.body,
        );

        return reply.send(newMemberType);
      } catch (err: any) {
        return reply.code(400).send({ message: err.message });
      }
    },
  );
};

export default plugin;
