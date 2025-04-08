import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";

import { db, UserMedication } from "@pathize/db";
import { validateJWT } from "../../lib/validateJwt";
import { GetResponse } from "../../types";

type Props = {
  id: string;
};

/**
 * @description Get a single user medication (a medication someone has set as something they track) by ID
 */
const handler = async (
  request: FastifyRequest<{ Querystring: Props }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.query;

    const userMedication = await db.userMedication.findUnique({
      where: {
        id: id,
      },
    });

    if (!userMedication) {
      return reply.code(404).send({
        status: 404,
        message: "No user medication record found",
      } as GetResponse<null>);
    }

    return reply.status(200).send({
      status: 200,
      message: "OK",
      data: userMedication,
    } as GetResponse<UserMedication>);
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
            medicationName: { type: "string" },
            medicationId: { type: "string" },
            type: { type: "string" },
            unit: { type: "string" },
            strength: { type: "number" },
            notes: { type: "string" },
            name: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
          required: ["id", "userId", "type", "medicationName", "createdAt"],
        },
      },
      required: ["status", "data"],
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
  500: {
    type: "object",
    properties: {
      status: { type: "number" },
      message: { type: "string" },
    },
    required: ["status", "message"],
  },
};

export const getUserMedicationRoute = {
  method: "GET" as HTTPMethods,
  url: "/api/v1/getUserMedication",
  onRequest: validateJWT,
  handler,
  schema,
};
