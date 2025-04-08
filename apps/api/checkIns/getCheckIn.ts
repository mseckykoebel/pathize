import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";

import { CheckInComplete, db } from "@pathize/db";
import { validateJWT } from "../lib/validateJwt";
import { GetResponse } from "../types";

type Props = {
  id: string;
};

const handler = async (
  request: FastifyRequest<{ Querystring: Props }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.query;

    const checkIn = await db.checkIn.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        userId: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        notificationsEnabled: true,
        time: true,
        medications: {
          select: {
            checkInId: true,
            userMedicationId: true,
          },
        },
        symptoms: {
          select: {
            checkInId: true,
            userSymptomId: true,
          },
        },
      },
    });

    if (!checkIn) {
      return reply.code(404).send({
        status: 404,
        message: "No check in record found",
      } as GetResponse<null>);
    }

    return reply.status(200).send({
      status: 200,
      message: "OK",
      data: checkIn,
    } as GetResponse<CheckInComplete>);
  } catch (err) {
    reply.code(500).send({
      status: 500,
      message: "Internal Server Error",
    } as GetResponse<null>);
  }
};

const schema = {
  querystring: {
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
            name: { type: "string" },
            createdAt: { type: "string" },
            updatedAt: { type: "string" },
            notificationsEnabled: { type: "boolean" },
            time: { type: "string" },
            medications: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  checkInId: { type: "string" },
                  userMedicationId: { type: "string" },
                },
              },
            },
            symptoms: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  checkInId: { type: "string" },
                  userSymptomId: { type: "string" },
                },
              },
            },
          },
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

export const getCheckInRoute = {
  method: "GET" as HTTPMethods,
  url: "/api/v1/getCheckIn",
  onRequest: validateJWT,
  handler,
  schema,
};
