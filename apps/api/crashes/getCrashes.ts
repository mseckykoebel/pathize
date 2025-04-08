import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import dayjs from "dayjs";

import { Crash, db } from "@pathize/db";
import { validateJWT } from "../lib/validateJwt";
import { GetResponse } from "../types";

type GetCrashesProps = {
  userId: string;
  day?: string;
};

const handler = async (
  request: FastifyRequest<{ Querystring: GetCrashesProps }>,
  reply: FastifyReply
) => {
  try {
    const { userId, day } = request.query;

    // get all of the crash records that are a part of the user's account
    const crashes = await db.crash.findMany({
      where: {
        userId: userId,
      },
    });

    // if the length is 0, then the user has no crash records, and return a 404
    if (crashes.length === 0) {
      return reply.code(404).send({
        status: 404,
        message: "No crash records found",
      } as GetResponse<null>);
    }

    if (!day) {
      return reply.code(200).send({
        status: 200,
        message: "OK",
        data: crashes,
      } as GetResponse<Crash>);
    }

    // only get the crashes for the current day
    const crashesForToday = crashes.filter((crash) => {
      return dayjs(crash.createdDay).format("YYYY-MM-DD") === day;
    });

    // if there are no crashes for today, then return, and set the crashes to null
    if (crashesForToday.length === 0) {
      return reply.code(404).send({
        status: 404,
        message: "No crash records found",
      } as GetResponse<null>);
    }

    return reply.status(200).send({
      status: 200,
      message: "OK",
      data: crashesForToday,
    } as GetResponse<Crash>);
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
              notes: { type: "string" },
              severity: { type: "number" },
              crashTotalTime: { type: "number" },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
            },
            required: ["id", "userId", "time", "createdAt"],
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

export const getAllCrashesRoute = {
  method: "GET" as HTTPMethods,
  url: "/api/v1/getAllCrashes",
  onRequest: validateJWT, // auth validation
  schema,
  handler,
};
