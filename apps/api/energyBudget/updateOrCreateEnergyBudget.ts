import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { UserTarget, db } from "@pathize/db";
import { validateJWT } from "../lib/validateJwt";
import { PatchResponse } from "../types";

const handler = async (
  request: FastifyRequest<{
    Body: {
      userId: string;
      energyBudget: number;
    };
  }>,
  reply: FastifyReply
) => {
  // either update or create the energy budget for the user with prisma
  const { userId, energyBudget } = request.body;

  try {
    const newTarget = await db.userTarget.upsert({
      where: {
        userId_targetName: {
          userId: userId,
          targetName: "ENERGY_BUDGET",
        },
      },
      update: {
        target: String(energyBudget),
        updatedAt: new Date(),
      },
      create: {
        userId: userId,
        targetName: "ENERGY_BUDGET",
        target: String(energyBudget),
      },
    });

    return reply.status(200).send({
      status: 200,
      message: "OK",
      data: newTarget,
    } as PatchResponse<UserTarget>);
  } catch (err) {
    console.error(err);

    reply.code(500).send({
      status: 500,
      message: "Internal Server Error",
    } as PatchResponse<null>);
  }
};

const schema = {
  body: {
    type: "object",
    properties: {
      userId: { type: "string" },
      energyBudget: { type: "number" },
    },
    required: ["userId", "energyBudget"],
  },
  response: {
    200: {
      type: "object",
      properties: {
        status: { type: "number" },
        message: { type: "string" },
        data: {
          type: "object",
          properties: {
            id: { type: "string" },
            userId: { type: "string" },
            target: { type: "string" },
            targetName: { type: "string", enum: ["ENERGY_BUDGET"] },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
          required: ["id", "userId", "target", "targetName", "createdAt"],
        },
      },
      required: ["status", "data"],
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

export const updateOrCreateEnergyBudget = {
  method: "PATCH" as HTTPMethods,
  url: "/api/v1/updateOrCreateEnergyBudget",
  onRequest: validateJWT,
  schema,
  handler,
};
