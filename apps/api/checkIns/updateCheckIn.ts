import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";

// CheckInComplete
import { CheckInComplete, db } from "@pathize/db";
import { validateJWT } from "../lib/validateJwt";
import { PatchResponse } from "../types";

type Props = {
  id: string;
  name?: string;
  time?: string;
  notificationsEnabled?: boolean;
  userMedicationIds: string[];
  userSymptomIds: string[];
};

const handler = async (
  request: FastifyRequest<{ Body: Props }>,
  reply: FastifyReply
) => {
  try {
    const {
      id,
      name,
      time,
      notificationsEnabled,
      userMedicationIds,
      userSymptomIds,
    } = request.body;

    // first delete all existing entries in the join tables
    await db.checkInMedication.deleteMany({ where: { checkInId: id } });
    await db.checkInSymptom.deleteMany({ where: { checkInId: id } });

    // define the update data, defining the new join table entries
    const updateData = {
      name: name,
      time: time,
      updatedAt: new Date(),
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

    // update the check in record + join tables
    const checkIn = await db.checkIn.update({
      where: { id: id },
      data: updateData,
      include: {
        medications: { select: { userMedicationId: true, checkInId: true } },
        symptoms: { select: { userSymptomId: true, checkInId: true } },
      },
    });

    if (!checkIn) {
      return reply.code(404).send({
        status: 404,
        message: "Check in record not found",
      } as PatchResponse<null>);
    }

    return reply.status(200).send({
      status: 200,
      message: "OK",
      data: checkIn,
      //TODO: fix this
    } as PatchResponse<CheckInComplete>);
  } catch (err) {
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
      id: { type: "string" },
      name: { type: "string" },
      time: { type: "string", format: "date-time" },
      notificationsEnabled: { type: "boolean" },
      userMedicationIds: { type: "array", items: { type: "string" } },
      userSymptomIds: { type: "array", items: { type: "string" } },
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
            name: { type: "string" },
            time: { type: "string", format: "date-time" },
            notificationsEnabled: { type: "boolean" },
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

export const updateCheckInRoute = {
  method: "PATCH" as HTTPMethods,
  url: "/api/v1/updateCheckIn",
  onRequest: validateJWT,
  handler,
  schema,
};
