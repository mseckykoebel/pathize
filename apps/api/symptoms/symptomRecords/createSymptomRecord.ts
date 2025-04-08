import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { SymptomRecord, db } from "@pathize/db";

import { validateJWT } from "../../lib/validateJwt";
import { CreateResponse } from "../../types";

type Props = {
  userId: string;
  time: string;
  createdDay: string;
  symptomId: string;
  userSymptomId: string;
  symptomName: string;
  symptomDescription: string;
  symptomCategory: string;
  symptomSeverity?: number;
  checkInId?: string;
};

const handler = async (
  request: FastifyRequest<{
    Body: Props;
  }>,
  reply: FastifyReply
) => {
  const {
    userId,
    time,
    createdDay,
    symptomId,
    userSymptomId,
    symptomSeverity,
    symptomName,
    symptomDescription,
    symptomCategory,
    checkInId,
  } = request.body;

  try {
    const createdSymptom = await db.symptomRecord.create({
      data: {
        userId: userId,
        time: time,
        createdDay: createdDay,
        symptomId: symptomId,
        userSymptomId: userSymptomId,
        severity: symptomSeverity,
        name: symptomName,
        description: symptomDescription,
        category: symptomCategory,
        checkInId: checkInId,
      },
    });

    return reply.status(200).send({
      status: 200,
      message: "OK",
      data: createdSymptom,
    } as CreateResponse<SymptomRecord>);
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
      symptomId: { type: "string" },
      userSymptomId: { type: "string" },
      symptomSeverity: { type: "number" },
      symptomName: { type: "string" },
      symptomDescription: { type: "string" },
      symptomCategory: { type: "string" },
      checkInId: { type: "string" },
    },
    required: [
      "userId",
      "time",
      "createdDay",
      "symptomId",
      "userSymptomId",
      "symptomName",
      "symptomDescription",
      "symptomCategory",
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
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            symptomId: { type: "string" },
            userSymptomId: { type: "string" },
            severity: { type: "number" },
            name: { type: "string" },
            description: { type: "string" },
            category: { type: "string" },
            checkInId: { type: "string" },
          },
          required: [
            "id",
            "userId",
            "time",
            "createdAt",
            "symptomId",
            "userSymptomId",
            "name",
            "description",
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

export const createSymptomRoute = {
  method: "POST" as HTTPMethods,
  url: "/api/v1/createSymptomRecord",
  onRequest: validateJWT,
  schema,
  handler,
};
