import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";

import { CheckInComplete, db } from "@pathize/db";
import { validateJWT } from "../lib/validateJwt";
import { GetResponse } from "../types";

type Props = {
  userId: string;
};

const handler = async (
  request: FastifyRequest<{ Querystring: Props }>,
  reply: FastifyReply
) => {
  try {
    const { userId } = request.query;

    const checkIns = await db.checkIn.findMany({
      where: {
        userId: userId,
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

    if (checkIns.length === 0) {
      return reply.code(404).send({
        status: 404,
        message: "No check in records found",
      } as GetResponse<null>);
    }

    return reply.status(200).send({
      status: 200,
      message: "OK",
      data: checkIns,
    } as GetResponse<CheckInComplete>);
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
              name: { type: "string" },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
              notificationsEnabled: { type: "boolean" },
              time: { type: "string", format: "date-time" },
              medications: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    checkInId: { type: "string" },
                    userMedicationId: { type: "string" },
                  },
                  required: ["checkInId", "userMedicationId"],
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
                  required: ["checkInId", "userSymptomId"],
                },
              },
            },
            required: [
              "id",
              "userId",
              "name",
              "createdAt",
              "notificationsEnabled",
              "time",
              "medications",
              "symptoms",
            ],
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

export const getCheckInsRoute = {
  method: "GET" as HTTPMethods,
  url: "/api/v1/getCheckIns",
  onRequest: validateJWT,
  handler,
  schema,
};
