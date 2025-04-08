import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";

// CheckInComplete
import { CheckInComplete, db } from "@pathize/db";
import { validateJWT } from "../lib/validateJwt";
import { CreateResponse } from "../types";

type Props = {
  userId: string;
  name: string;
  time: string;
  notificationsEnabled: boolean;
  userMedicationIds: string[];
  userSymptomIds: string[];
}

const handler = async (
  request: FastifyRequest<{ Body: Props }>,
  reply: FastifyReply
) => {
  try {
    const {
      userId,
      name,
      time,
      notificationsEnabled,
      userMedicationIds,
      userSymptomIds,
    } = request.body;

    // define insert shape
    const createData = {
      userId: userId,
      name: name,
      time: time,
      notificationsEnabled: notificationsEnabled,
      medications: {
        create: userMedicationIds.map((medicationId) => ({
          userMedicationId: medicationId,
        })),
      },
      symptoms: {
        create: userSymptomIds.map((symptomId) => ({
          userSymptomId: symptomId,
        })),
      },
    };

    // create check in and join table entries
    const checkIn = await db.checkIn.create({
      data: createData,
      include: {
        medications: { select: { userMedicationId: true, checkInId: true } },
        symptoms: { select: { userSymptomId: true, checkInId: true } },
      },
    });

    return reply.status(200).send({
      status: 200,
      message: "OK",
      data: checkIn,
      // TODO: fix this
    } as CreateResponse<CheckInComplete>);
  } catch (err) {
    console.log(err);
    reply.code(500).send({
      status: 500,
      message: "Internal Server Error",
    } as CreateResponse<null>);
  }
};

const schema = {
  body: {
    type: "object",
    properties: {
      userId: { type: "string" },
      name: { type: "string" },
      time: { type: "string", format: "date-time" },
      notificationsEnabled: { type: "boolean" },
      userMedicationIds: { type: "array", items: { type: "string" } },
      userSymptomIds: { type: "array", items: { type: "string" } },
    },
    required: [
      "userId",
      "name",
      "time",
      "notificationsEnabled",
      "userMedicationIds",
      "userSymptomIds",
    ],
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
            name: { type: "string" },
            time: { type: "string", format: "date-time" },
            notificationsEnabled: { type: "boolean" },
            medications: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  userMedicationId: { type: "string" },
                  checkInId: { type: "string" },
                },
                required: ["userMedicationId", "checkInId"],
              },
            },
            symptoms: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  userSymptomId: { type: "string" },
                  checkInId: { type: "string" },
                },
                required: ["userSymptomId", "checkInId"],
              },
            },
          },
          required: [
            "id",
            "name",
            "time",
            "notificationsEnabled",
            "medications",
            "symptoms",
          ],
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

export const createCheckInRoute = {
  method: "POST" as HTTPMethods,
  url: "/api/v1/createCheckIn",
  onRequest: validateJWT,
  handler,
  schema,
};
