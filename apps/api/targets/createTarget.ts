import { db, UserTarget } from "@pathize/db";
import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { validateJWT } from "../lib/validateJwt";
import { CreateResponse } from "../types";

type GetUserTargets = {
  userId: string;
  target: string;
};

const handler = async (
  request: FastifyRequest<{ Querystring: GetUserTargets }>,
  reply: FastifyReply
) => {
  try {
    const { userId, target } = request.query;
    const createdTarget: UserTarget | null = await db.userTarget.create({
      data: {
        target: target,
        userId: userId,
        createdAt: new Date(),
        targetName: "BASELINE",
      },
    });
    if (!createdTarget) {
      reply
        .status(404)
        .send({
          status: 404,
          message: "Targets not found",
        } as CreateResponse<null>);
      return;
    }
    return reply.status(200).send({ status: 200, data: createdTarget });
  } catch (err) {
    return reply.status(500).send({
      status: 500,
      message: "Internal Server Error",
    } as CreateResponse<null>);
  }
};

const schema = {
  querystring: {
    type: "object",
    properties: {
      userId: { type: "string" },
      target: { type: "string" },
    },
    required: ["userId", "target"],
  },
  response: {
    200: {
      type: "object",
      properties: {
        status: { type: "number" },
        data: {
          type: "object",
          properties: {
            id: { type: "string" },
            targetName: { type: "string", enum: ["BASELINE"] },
            target: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            userId: { type: "string" },
          },
          required: ["id", "targetName", "target", "createdAt", "userId"],
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

export const createTargetRoute = {
  method: "POST" as HTTPMethods,
  url: "/api/v1/createTarget",
  onRequest: validateJWT, // auth validation
  schema,
  handler,
};
