import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";

import { db, UserSymptom } from "@pathize/db";
import { validateJWT } from "../../lib/validateJwt";
import { GetResponse } from "../../types";

type Props = {
  userId: string;
};

const handler = async (
  request: FastifyRequest<{ Querystring: Props }>,
  reply: FastifyReply
) => {
  const { userId } = request.query;

  try {
    const userSymptoms = await db.userSymptom.findMany({
      where: {
        userId: userId,
      },
    });

    if (userSymptoms.length === 0) {
      return reply.code(404).send({
        status: 404,
        message: "No user symptom records found",
      } as GetResponse<null>);
    }

    return reply.status(200).send({
      status: 200,
      message: "OK",
      data: userSymptoms,
    } as GetResponse<UserSymptom>);
  } catch (err) {
    console.log(err);
    reply.code(500).send({
      status: 500,
      message: "Internal Server Error",
    } as GetResponse<null>);
  }
};

const schema = {
  query: {
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
              symptomId: { type: "string" },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
              name: { type: "string" },
              category: { type: "string" },
              description: { type: "string" },
              notes: { type: "string" },
            },
            required: ["id", "userId", "name", "category", "createdAt"],
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

export const getUserSymptomsRoute = {
  method: "GET" as HTTPMethods,
  url: "/api/v1/getUserSymptoms",
  onRequest: validateJWT,
  handler,
  schema,
};
