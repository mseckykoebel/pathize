import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { db, MedicationRecord } from "@pathize/db";
import { validateJWT } from "../../lib/validateJwt";
import { CreateResponse } from "../../types";

type Props = {
  userId: string;
  time: string;
  createdDay: string;
  medicationId: string;
  medicationName: string;
  userMedicationId: string;
  notes: string | null;
  type: string;
  unit: string | null;
  strength: number | null;
  checkInId?: string;
};

const handler = async (
  request: FastifyRequest<{
    Body: Props;
  }>,
  reply: FastifyReply
) => {
  try {
    const {
      userId,
      time,
      createdDay,
      medicationId,
      medicationName,
      userMedicationId,
      notes,
      type,
      unit,
      strength,
      checkInId,
    } = request.body;

    const createdMedication = await db.medicationRecord.create({
      data: {
        userId: userId,
        time: time,
        createdDay: createdDay,
        medicationId: medicationId,
        medicationName: medicationName,
        userMedicationId: userMedicationId,
        notes: notes,
        type: type,
        unit: unit,
        strength: strength,
        checkInId: checkInId,
      },
    });

    return reply.status(200).send({
      status: 200,
      message: "OK",
      data: createdMedication,
    } as CreateResponse<MedicationRecord>);
  } catch (err) {
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
      time: { type: "string" },
      createdDay: { type: "string" },
      medicationId: { type: "string" },
      medicationName: { type: "string" },
      userMedicationId: { type: "string" },
      notes: { type: "string" },
      type: { type: "string" },
      unit: { type: "string" },
      strength: { type: "number" },
      checkInId: { type: "string" },
    },
    required: [
      "userId",
      "time",
      "createdDay",
      "medicationId",
      "medicationName",
      "userMedicationId",
      "type",
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
            userId: { type: "string" },
            time: { type: "string" },
            createdDay: { type: "string" },
            medicationId: { type: "string" },
            medicationName: { type: "string" },
            userMedicationId: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            notes: { type: "string" },
            type: { type: "string" },
            unit: { type: "string" },
            strength: { type: "number" },
            checkInId: { type: "string" },
          },
          required: [
            "id",
            "userId",
            "time",
            "createdDay",
            "userMedicationId",
            "createdAt",
            "type",
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

export const createMedicationRoute = {
  method: "POST" as HTTPMethods,
  url: "/api/v1/createMedicationRecord",
  onRequest: validateJWT,
  schema,
  handler,
};
