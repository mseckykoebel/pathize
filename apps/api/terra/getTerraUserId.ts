import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { db } from "@pathize/db";
import { validateJWT } from "../lib/validateJwt";
import { GetResponse } from "../types";

type Props = {
  userId: string;
};

const handler = async (
  request: FastifyRequest<{ Querystring: Props }>,
  reply: FastifyReply
) => {
  try {
    const { userId } = request.query;

    const user = await db.deviceConnection.findMany({
      where: { userId: userId },
    });
    if (user.length === 0) {
      reply
        .status(404)
        .send({ status: 404, message: "User not found" } as GetResponse<null>);
      return;
    }
    reply.send({ terraUserId: user[0].terraUserId });
  } catch (err) {
    reply.status(500).send({
      status: 500,
      message: "Internal Server Error",
    } as GetResponse<null>);
  }
};

const schema = {
  querystring: {
    type: "object",
    properties: {
      userId: { type: "string" },
    },
    required: ["userId"],
  },
  response: {
    200: {
      type: "object",
      properties: {
        terraUserId: { type: "string" },
      },
      required: ["terraUserId"],
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

export const getTerraUserIdRoute = {
  method: "GET" as HTTPMethods,
  url: "/api/v1/terraUserId",
  schema,
  onRequest: validateJWT,
  handler,
};
