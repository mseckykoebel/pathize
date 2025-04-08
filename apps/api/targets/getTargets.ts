import { db, UserTarget } from "@pathize/db";
import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { validateJWT } from "../lib/validateJwt";
import { GetResponse } from "../types";

type GetUserTargets = {
  userId: string;
};

const handler = async (
  request: FastifyRequest<{ Querystring: GetUserTargets }>,
  reply: FastifyReply
) => {
  try {
    const { userId } = request.query;
    const targets: UserTarget[] | null = await db.userTarget.findMany({
      where: {
        userId: userId,
        targetName: "BASELINE",
      },
    });
    if (!targets || targets.length === 0) {
      return reply.status(404).send({
        status: 404,
        message: "Targets not found",
      } as GetResponse<null>);
    }
    return reply.status(200).send(targets);
  } catch (err) {
    console.error(err);
    return reply.status(500).send();
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
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          targetName: { type: "string" },
          target: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          userId: { type: "string" },
        },
        required: ["id", "targetName", "target", "createdAt", "userId"],
      },
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

export const getTargetsRoute = {
  method: "GET" as HTTPMethods,
  url: "/api/v1/getTargets",
  onRequest: validateJWT, // auth validation
  schema,
  handler,
};
