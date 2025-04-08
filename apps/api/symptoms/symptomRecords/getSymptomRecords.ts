import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import dayjs from "dayjs";

import { SymptomRecord, db } from "@pathize/db";
import { validateJWT } from "../../lib/validateJwt";
import { GetResponse } from "../../types";

type Props = {
  userId: string;
  day?: string;
  checkInId: string;
};

const handler = async (
  request: FastifyRequest<{ Querystring: Props }>,
  reply: FastifyReply
) => {
  try {
    const { userId, day, checkInId } = request.query;

    // get all of the symptom records as part of this users account
    const symptoms = await db.symptomRecord.findMany({
      where: {
        userId: userId,
        ...(checkInId ? { checkInId: checkInId } : {}),
      },
    });

    // if the length is 0, then the user has no symptom records, and return a 404
    if (symptoms.length === 0) {
      return reply.code(404).send({
        status: 404,
        message: "No symptom records found",
      } as GetResponse<null>);
    }

    // only get the symptoms for the current day
    let symptomsForDay = symptoms;
    if (day) {
      symptomsForDay = symptoms.filter((symptom) => {
        return dayjs(symptom.createdDay).format("YYYY-MM-DD") === day;
      });
    }

    // if there are no symptoms for today, then return, and set the symptoms to null
    if (symptomsForDay.length === 0) {
      return reply.code(404).send({
        status: 404,
        message: "No symptom records found",
      } as GetResponse<null>);
    }

    return reply.status(200).send({
      status: 200,
      message: "OK",
      data: symptomsForDay,
    } as GetResponse<SymptomRecord>);
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
              createdDay: { type: "string", format: "date" },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
              time: { type: "string" },
              symptomId: { type: "string" },
              userSymptomId: { type: "string" },
              severity: { type: "number" },
              userId: { type: "string" },
              name: { type: "string" },
              description: { type: "string" },
              category: { type: "string" },
              checkInId: { type: "string" },
            },
            required: [
              "id",
              "userId",
              "time",
              "userSymptomId",
              "createdAt",
              "name",
              "category",
            ],
          },
        },
      },
      required: ["status", "message"],
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

export const getSymptomsRoute = {
  method: "GET" as HTTPMethods,
  url: "/api/v1/getSymptomRecords",
  onRequest: validateJWT,
  schema,
  handler,
};
