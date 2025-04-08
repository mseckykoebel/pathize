import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import dayjs from "dayjs";

import { CheckInComplete, db } from "@pathize/db";
import { validateJWT } from "../lib/validateJwt";
import { GetResponse } from "../types";

type Props = {
  userId: string;
  date: string;
};

const handler = async (
  request: FastifyRequest<{ Querystring: Props }>,
  reply: FastifyReply
) => {
  const { userId, date } = request.query;
  try {
    // get checkIns, medicationRecords, and symptomRecords
    // TODO: this is fast but uses a lot of memory, make more lean
    const [checkIns, medicationRecords, symptomRecords] = await Promise.all([
      db.checkIn.findMany({
        where: {
          userId: userId,
        },
        include: {
          medications: true,
          symptoms: true,
        },
      }),
      db.medicationRecord.findMany({
        where: {
          userId: userId,
        },
      }),
      db.symptomRecord.findMany({
        where: {
          userId: userId,
        },
      }),
    ]);

    const medicationsForDay = medicationRecords.filter((medication) => {
      return dayjs(medication.createdDay).format("YYYY-MM-DD") === date;
    });
    const symptomsForDay = symptomRecords.filter((symptom) => {
      return dayjs(symptom.createdDay).format("YYYY-MM-DD") === date;
    });

    const checkInIdsForDay = new Set([
      ...medicationsForDay.map((med) => med.checkInId),
      ...symptomsForDay.map((sym) => sym.checkInId),
    ]);
    const completedCheckIns = checkIns.filter((checkIn) =>
      checkInIdsForDay.has(checkIn.id)
    );

    if (completedCheckIns.length === 0) {
      return reply.code(404).send({
        status: 404,
        message: "No check in records found for the specified date",
      } as GetResponse<null>);
    }

    return reply.status(200).send({
      status: 200,
      message: "OK",
      data: completedCheckIns,
    } as GetResponse<CheckInComplete[]>);
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
      date: { type: "string" },
    },
    required: ["userId", "date"],
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

export const getCheckInsRecordedOnDayRoute = {
  method: "GET" as HTTPMethods,
  url: "/api/v1/getCheckInsRecordedOnDay",
  onRequest: validateJWT,
  handler,
  schema,
};
