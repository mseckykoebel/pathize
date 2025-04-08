import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { db } from "@pathize/db";
import { DeleteResponse } from "../types";

type LogoutRequest = {
  userId: string;
};

const handler = async (
  request: FastifyRequest<{ Body: LogoutRequest }>,
  reply: FastifyReply
) => {
  try {
    const { userId } = request.body;
    await db.refreshToken.deleteMany({
      where: {
        userId: userId,
      },
    });

    reply.code(204).send();
  } catch (err) {
    reply.code(500).send({
      status: 500,
      message: "Internal Server Error",
    } as DeleteResponse);
  }
};

const logoutSchema = {
  body: {
    type: "object",
    properties: {
      userId: { type: "string" },
    },
    required: ["userId"],
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

export const logoutRoute = {
  method: "DELETE" as HTTPMethods,
  url: "/api/v1/logout",
  logoutSchema,
  handler,
};
