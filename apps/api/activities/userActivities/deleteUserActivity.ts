import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { db } from "@pathize/db";
import { validateJWT } from "../../lib/validateJwt";
import { DeleteResponse } from "../../types";

type Props = {
  id: string;
};

const handler = async (
  request: FastifyRequest<{
    Querystring: Props;
  }>,
  reply: FastifyReply
) => {
  const { id } = request.query;
  try {
    await db.userActivity.delete({
      where: {
        id: id,
      },
    });
    return reply.status(204).send();
  } catch (err) {
    console.error(err);
    return reply.status(500).send({
      status: 500,
      message: "Internal Server Error",
    } as DeleteResponse);
  }
};

const schema = {
  query: {
    type: "object",
    properties: {
      id: { type: "string" },
    },
    required: ["id"],
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

export const deleteUserActivityRoute = {
  method: "DELETE" as HTTPMethods,
  url: "/api/v1/deleteUserActivity",
  onRequest: validateJWT,
  schema,
  handler,
};
