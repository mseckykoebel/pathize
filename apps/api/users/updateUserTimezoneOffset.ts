import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";

import { User, db } from "@pathize/db";
import { PatchResponse, PostResponse } from "../types";
import { validateJWT } from "../lib/validateJwt";

type Props = {
  userId: string;
  timezoneOffset: number;
}

const handler = async (
  request: FastifyRequest<{ Querystring: Props }>,
  reply: FastifyReply
) => {
  const { userId, timezoneOffset } = request.query;
  try {
    const response: User = await db.user.update({
      where: { id: userId },
      data: {
        timezoneOffset: timezoneOffset,
        updatedAt: new Date(),
      },
    });
    if (!response) {
      reply
        .status(404)
        .send({ message: "User not found" } as PatchResponse<null>);
      return;
    }
    return reply.status(200).send({
      status: 200,
      message: "Timezone data updated",
    } as PostResponse<null>);
  } catch (err) {
    return reply.status(500).send({
      status: 500,
      message: "Internal Server Error",
    });
  }
};

const schema = {
  querystring: {
    type: "object",
    properties: {
      userId: { type: "string" },
      timezoneOffset: { type: "number" },
    },
    required: ["userId", "timezoneOffset"],
  },
  response: {
    200: {
      type: "object",
      properties: {
        status: { type: "number" },
        message: { type: "string" },
      },
      required: ["status", "message"],
    },
    404: {
      type: "object",
      properties: {
        status: { type: "number" },
        message: { type: "string" },
      },
      required: ["status", "message"],
    },
  },
};

export const updateUserTimezoneOffsetRoute = {
  method: "PATCH" as HTTPMethods,
  url: "/api/v1/updateUserTimezoneOffset",
  onRequest: validateJWT,
  handler,
  schema,
};
