import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { db } from "@pathize/db";
import { validateJWT } from "../lib/validateJwt";
import { DeleteResponse } from "../types";

type DeleteFcmTokenProps = {
  userId: string;
  token: string;
};

const handler = async (
  request: FastifyRequest<{ Body: DeleteFcmTokenProps }>,
  reply: FastifyReply
) => {
  try {
    const { userId, token } = request.body;

    const foundTokens = await db.fcmToken.findMany({
      where: {
        userId: userId,
      },
    });

    // delete for every found token
    for (const foundToken of foundTokens) {
      if (foundToken.token !== token) continue;
      await db.fcmToken.delete({
        where: {
          id: foundToken.id,
        },
      });
    }

    return reply.status(204).send();
  } catch (err) {
    console.error(err);
    reply.code(500).send({
      status: 500,
      message: "Internal Server Error",
    } as DeleteResponse);
  }
};

const schema = {
  body: {
    type: "object",
    properties: {
      userId: { type: "string" },
      token: { type: "string" },
    },
    required: ["userId", "token"],
  },
  response: {
    204: {
      type: "object",
      properties: {},
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

export const deleteFcmTokenRoute = {
  method: "DELETE" as HTTPMethods,
  url: "/api/v1/deleteFcmToken",
  onRequest: validateJWT,
  schema,
  handler,
};
