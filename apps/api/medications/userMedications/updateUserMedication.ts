import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { db, UserMedication } from "@pathize/db";
import { validateJWT } from "../../lib/validateJwt";
import { PatchResponse } from "../../types";

type Props = {
  id: string;
  type: string;
  medicationName: string;
  unit?: string | null;
  strength?: number | null;
  notes?: string | null;
}

const handler = async (
  request: FastifyRequest<{
    Body: Props;
  }>,
  reply: FastifyReply,
) => {
  try {
    const { id, type, medicationName, unit, strength, notes } = request.body;

    const updatedUserMedication = await db.userMedication.update({
      where: { id: id },
      data: {
        type: type,
        unit: unit,
        medicationName: medicationName,
        strength: strength,
        notes: notes,
        updatedAt: new Date(),
      },
    });

    // NOW WE NEED TO UPDATE ALL THE MEDICATION RECORDS THAT HAVE THIS USER MEDICATION ID
    // GET ALL THE RECORDS AND UPDATE THEM

    const medicationRecords = await db.medicationRecord.findMany({
      where: {
        userMedicationId: id,
      },
    });

    // UPDATE THEM ALL IN PARALLEL
    medicationRecords.forEach(async (record) => {
      await db.medicationRecord.update({
        where: { id: record.id },
        data: {
          ...record,
          medicationName: medicationName,
          unit: unit,
          strength: strength,
          notes: notes,
          updatedAt: new Date(),
        },
      });
    });

    return reply.status(200).send({
      status: 200,
      message: "OK",
      data: updatedUserMedication,
    } as PatchResponse<UserMedication>);
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
      type: { type: "string" },
      medicationName: { type: "string" },
      unit: { type: "string" },
      strength: { type: "number" },
      notes: { type: "string" },
    },
    required: ["id", "type", "medicationName"],
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
            type: { type: "string" },
            medicationName: { type: "string" },
            unit: { type: "string" },
            strength: { type: "number" },
            notes: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
          required: [
            "id",
            "type",
            "medicationName",
            "unit",
            "strength",
            "notes",
            "createdAt",
            "updatedAt",
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

export const updateUserMedicationRoute = {
  method: "PATCH" as HTTPMethods,
  url: "/api/v1/updateUserMedication",
  onRequest: validateJWT,
  schema: schema,
  handler: handler,
};
