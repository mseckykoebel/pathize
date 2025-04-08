import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyReply,
  FastifyRequest,
} from "fastify";

const root = async (
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
) => {
  fastify.get("/", async (_request: FastifyRequest, _reply: FastifyReply) => {
    return { fhir: true };
  });
};

export default root;
