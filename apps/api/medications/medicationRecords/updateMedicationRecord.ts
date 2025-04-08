import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { db, MedicationRecord } from "@pathize/db";
import { validateJWT } from "../../lib/validateJwt";
import { PostResponse } from "../../types";

type UpdateMedicationProps = {
  id: string;
  time: string;
  notes?: string | null;
};

const handler = async (
  request: FastifyRequest<{
    Body: UpdateMedicationProps;
  }>,
  reply: FastifyReply
) => {
  try {
    const { id, time, notes } = request.body;

    const updatedMedication = await db.medicationRecord.update({
      where: { id: id },
      data: {
        time: time,
        notes: notes,
        updatedAt: new Date(),
      },
    });

    return reply.status(200).send({
      status: 200,
      message: "OK",
      data: updatedMedication,
    } as PostResponse<MedicationRecord>);
  } catch (err) {
    reply.code(500).send({
      status: 500,
      message: "Internal Server Error",
    } as PostResponse<null>);
  }
};

const schema = {
  body: {
    type: "object",
    properties: {
      id: { type: "string" },
      time: { type: "string" },
      notes: { type: "string" },
    },
    required: ["id", "time"],
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

export const updateMedicationRecordRoute = {
  method: "PATCH" as HTTPMethods,
  url: "/api/v1/updateMedicationRecord",
  onRequest: validateJWT,
  schema,
  handler,
};
