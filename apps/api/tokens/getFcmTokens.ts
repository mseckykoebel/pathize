import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { FcmToken, db } from "@pathize/db";

import { validateJWT } from "../lib/validateJwt";
import { GetResponse } from "../types";

const handler = async (
  request: FastifyRequest<{
    Querystring: {
      userId: string;
    };
  }>,
  reply: FastifyReply
) => {
  try {
    const { userId } = request.query;

    const allFcmTokens = await db.fcmToken.findMany({
      where: {
        userId: userId,
      },
    });

    // if length is 0, return 404
    if (allFcmTokens.length === 0) {
      return reply.status(404).send({
        status: 404,
        message: "Not Found",
      } as GetResponse<null>);
    }

    return reply.status(200).send({
      status: 200,
      message: "OK",
      data: allFcmTokens,
    } as GetResponse<FcmToken>);
  } catch (err) {
    reply.code(500).send({
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
        status: { type: "number" },
        message: { type: "string" },
        data: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              userId: { type: "string" },
              token: { type: "string" },
              createdAt: { type: "string", format: "date-time" },
            },
            required: ["id", "userId", "token", "createdAt"],
          },
        },
      },
      required: ["status", "data"],
    },
    404: {
      type: "object",
      properties: {
        status: { type: "number" },
        message: { type: "string" },
      },
      required: ["status", "message"],
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

export const getFcmTokensRoute = {
  method: "GET" as HTTPMethods,
  url: "/api/v1/getFcmTokens",
  onRequest: validateJWT,
  schema,
  handler,
};
