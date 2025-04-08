import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";

import { db, UserSymptom } from "@pathize/db";
import { validateJWT } from "../../lib/validateJwt";
import { GetResponse } from "../../types";

type Props = {
  id: string;
};

/**
 * @description Get a single user symptom (a symptom someone has set as something they track) by ID
 */
const handler = async (
  request: FastifyRequest<{ Querystring: Props }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.query;

    const userSymptom = await db.userSymptom.findUnique({
      where: {
        id: id,
      },
    });

    if (!userSymptom) {
      return reply.code(404).send({
        status: 404,
        message: "No user symptom record found",
      } as GetResponse<null>);
    }

    return reply.status(200).send({
      status: 200,
      message: "OK",
      data: userSymptom,
    } as GetResponse<UserSymptom>);
  } catch (err) {
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
      id: { type: "string" },
    },
    required: ["id"],
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
    404: {
      type: "object",
      properties: {
        status: { type: "number" },
        message: { type: "string" },
      },
    },
    500: {
      type: "object",
      properties: {
        status: { type: "number" },
        message: { type: "string" },
      },
    },
  },
};

export const getUserSymptomRoute = {
  method: "GET" as HTTPMethods,
  url: "/api/v1/getUserSymptom",
  onRequest: validateJWT,
  handler,
  schema,
};
