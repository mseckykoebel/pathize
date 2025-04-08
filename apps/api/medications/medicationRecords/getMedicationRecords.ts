import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import dayjs from "dayjs";

import { MedicationRecord, db } from "@pathize/db";
import { validateJWT } from "../../lib/validateJwt";
import { GetResponse } from "../../types";

type GetMedicationsProps = {
  userId: string;
  day?: string;
  checkInId?: string;
};

const handler = async (
  request: FastifyRequest<{ Querystring: GetMedicationsProps }>,
  reply: FastifyReply
) => {
  try {
    const { userId, day, checkInId } = request.query;

    // get all of the medication records as part of this users account
    const medicationRecords = await db.medicationRecord.findMany({
      where: {
        userId: userId,
        ...(checkInId ? { checkInId: checkInId } : {}),
      },
    });

    // if the length is 0, then the user has no medication records, and return a 404
    if (medicationRecords.length === 0) {
      return reply.code(404).send({
        status: 404,
        message: "No medication records found",
      } as GetResponse<null>);
    }

    // only get the medications for the current day (if day is defined)
    let medicationsForDay = medicationRecords;
    if (day) {
      medicationsForDay = medicationRecords.filter((medication) => {
        return dayjs(medication.createdDay).format("YYYY-MM-DD") === day;
      });
    }

    // if there are no medications for today, then return, and set the medications to null
    if (medicationsForDay.length === 0) {
      return reply.code(404).send({
        status: 404,
        message: "No medication records found",
      } as GetResponse<null>);
    }

    return reply.status(200).send({
      status: 200,
      message: "OK",
      data: medicationsForDay,
    } as GetResponse<MedicationRecord>);
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
      day: { type: "string" },
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

export const getMedicationRecordsRoute = {
  method: "GET" as HTTPMethods,
  url: "/api/v1/getMedicationRecords",
  onRequest: validateJWT,
  schema,
  handler,
};
