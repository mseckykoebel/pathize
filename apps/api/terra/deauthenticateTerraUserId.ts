import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";

import { validateJWT } from "../lib/validateJwt";
import { getTerraEnv } from "./utils";
import { DeleteResponse } from "../types";

type Props = {
  terraUserId: string;
};

const handler = async (
  request: FastifyRequest<{ Querystring: Props }>,
  reply: FastifyReply
) => {
  const { terraUserId } = request.query;
  try {
    const terra = getTerraEnv();
    await terra.deauthUser(terraUserId);
    reply.status(204).send();
  } catch (err) {
    reply.status(500).send({ status: 500, message: err } as DeleteResponse);
  }
};

const schema = {
  querystring: {
    type: "object",
    properties: {
      terraUserId: { type: "string" },
    },
    required: ["terraUserId"],
  },
  response: {
    204: {
      type: "object",
      properties: {},
    },
    500: {
      type: "object",
      properties: {
        status: { type: "number" },
        message: { type: "string" },
      },
      required: ["status", "message"],
    },
  },
};

export const deauthenticateTerraUserIdRoute = {
  method: "DELETE" as HTTPMethods,
  url: "/api/v1/deauthenticateTerraUserId",
  schema,
  onRequest: validateJWT,
  handler,
};
