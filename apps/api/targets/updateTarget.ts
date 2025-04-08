import { db, UserTarget } from "@pathize/db";
import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { validateJWT } from "../lib/validateJwt";
import { PatchResponse } from "../types";

type UpdateUserRequest = {
  targetId: string;
  target: string;
};

const handler = async (
  request: FastifyRequest<{ Querystring: UpdateUserRequest }>,
  reply: FastifyReply
) => {
  try {
    const { target, targetId } = request.query;
    const updateTarget: UserTarget = await db.userTarget.update({
      where: { id: targetId },
      data: {
        target: target,
        updatedAt: new Date(),
        targetName: "BASELINE",
      },
    });
    if (!updateTarget) {
      reply
        .status(404)
        .send({
          status: 404,
          message: "Target not found",
        } as PatchResponse<null>);
      return;
    }
    // if the limit change was successful, then add it to the target log
    await db.targetLog.create({
      data: {
        userId: targetId,
        value: Number(target),
        targetName: "BASELINE",
        createdAt: new Date(),
      },
    });

    return reply.status(200).send(updateTarget);
  } catch (err) {
    console.error(err);
    return reply.status(500).send({
      status: 500,
      message: "Internal Server Error",
    } as PatchResponse<null>);
  }
};

const schema = {
  querystring: {
    type: "object",
    properties: {
      targetId: { type: "string" },
      target: { type: "string" },
    },
    required: ["target", "targetId"],
  },
  response: {
    200: {
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
    404: {
      type: "object",
      properties: { status: { type: "number" }, message: { type: "string" } },
      required: ["status", "message"],
    },
    500: {
      type: "object",
      properties: { status: { type: "number" }, message: { type: "string" } },
      required: ["status", "message"],
    },
  },
};

export const updateTargetRoute = {
  method: "PATCH" as HTTPMethods,
  url: "/api/v1/updateTarget",
  onRequest: validateJWT, // auth validation
  schema,
  handler,
};
