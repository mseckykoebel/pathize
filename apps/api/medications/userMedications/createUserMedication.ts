import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { UserMedication, db } from "@pathize/db";
import { validateJWT } from "../../lib/validateJwt";
import { PostResponse } from "../../types";

type CreateUserMedicationProps = {
  userId: string;
  medicationId: string;
  medicationName: string;
  type: string;
  unit: string | null;
  strength: number | null;
  notes: string | null;
};

const handler = async (
  request: FastifyRequest<{
    Body: CreateUserMedicationProps;
  }>,
  reply: FastifyReply,
) => {
  const { userId, medicationId, medicationName, notes, type, unit, strength } =
    request.body;

  try {
    // check to see if there is a userMedication in the DB that has this medicationName
    const userMedicationWithSameName = await db.userMedication.findFirst({
      where: {
        userId: userId,
        medicationName: medicationName,
      },
    });

    if (userMedicationWithSameName) {
      return reply.status(400).send({
        status: 400,
        message: "Medication with this name exists already.",
      } as PostResponse<null>);
    }

    const createdUserMedication = await db.userMedication.create({
      data: {
        userId: userId,
        medicationId: medicationId,
        medicationName: medicationName,
        type: type,
        notes: notes,
        unit: unit,
        strength: strength ? Number(strength) : null,
      },
    });

    return reply.status(200).send({
      status: 200,
      message: "OK",
      data: createdUserMedication,
    } as PostResponse<UserMedication>);
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
      userId: { type: "string" },
      medicationName: { type: "string" },
      medicationId: { type: "string" },
      type: { type: "string" },
      unit: { type: "string" },
      strength: { type: "number" },
      notes: { type: "string" },
    },
    required: ["userId", "medicationName", "type"],
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
            medicationId: { type: "string" },
            medicationName: { type: "string" },
            type: { type: "string" },
            unit: { type: "string" },
            strength: { type: "number" },
            notes: { type: "string" },
          },
          required: [
            "id",
            "userId",
            "medicationName",
            "type",
            "unit",
            "strength",
            "notes",
          ],
        },
      },
      required: ["status", "data"],
    },
    400: {
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

export const createUserMedicationRoute = {
  method: "POST" as HTTPMethods,
  url: "/api/v1/createUserMedication",
  onRequest: validateJWT,
  handler,
  schema,
};
