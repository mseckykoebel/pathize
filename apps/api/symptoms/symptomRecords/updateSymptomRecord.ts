import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { db, SymptomRecord } from "@pathize/db";
import { validateJWT } from "../../lib/validateJwt";
import { PatchResponse } from "../../types";

const handler = async (
  request: FastifyRequest<{
    Body: {
      id: string;
      time: string;
      severity: number;
    };
  }>,
  reply: FastifyReply
) => {
  try {
    const { id, time, severity } = request.body;

    const updatedSymptom = await db.symptomRecord.update({
      where: { id: id },
      data: {
        time: time,
        severity: severity,
        updatedAt: new Date(),
      },
    });

    return reply.status(200).send({
      status: 200,
      message: "OK",
      data: updatedSymptom,
    } as PatchResponse<SymptomRecord>);
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
      time: { type: "string" },
      symptomSeverity: { type: "number" },
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
            symptomId: { type: "string" },
            userSymptomId: { type: "string" },
            createdDay: { type: "string" },
            name: { type: "string" },
            time: { type: "string" },
            category: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            severity: { type: "number" },
            description: { type: "string" },
            checkInId: { type: "string" },
          },
          required: [
            "id",
            "userId",
            "userSymptomId",
            "time",
            "createdDay",
            "createdAt",
            "name",
            "category",
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

export const updateSymptomRecordRoute = {
  method: "PATCH" as HTTPMethods,
  url: "/api/v1/updateSymptomRecord",
  onRequest: validateJWT,
  schema,
  handler,
};
