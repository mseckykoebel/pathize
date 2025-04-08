import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { Crash, db } from "@pathize/db";
import { validateJWT } from "../lib/validateJwt";
import dayjs from "dayjs";
import { GetResponse } from "../types";

type Props = {
  userId: string;
  date: string;
  daysToFetch: number;
};

const handler = async (
  request: FastifyRequest<{ Querystring: Props }>,
  reply: FastifyReply,
) => {
  try {
    const { userId, date, daysToFetch } = request.query;

    const crashesArray: Crash[] = [];
    const dateArray = date.split("-");
    const year = parseInt(dateArray[0]);
    const month = parseInt(dateArray[1]);
    const day = parseInt(dateArray[2]);
    let currentDate = dayjs(`${year}-${month}-${day}`);

    for (let i = 0; i < daysToFetch; i++) {
      const crashes = await db.crash.findMany({
        where: {
          userId: userId,
          createdDay: currentDate.format("YYYY-MM-DD"),
        },
      });

      // add all of these crashes to the array
      crashesArray.push(...crashes);
      currentDate = currentDate.subtract(1, "day");
    }

    // if length is 0, return 404
    if (crashesArray.length === 0) {
      return reply
        .status(404)
        .send({ status: 404, message: "No data found" } as GetResponse<null>);
    }

    // return crashes array
    return reply.status(200).send({
      status: 200,
      message: "OK",
      data: crashesArray,
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
      date: { type: "string" },
      daysToFetch: { type: "number" },
    },
    required: ["userId", "date", "daysToFetch"],
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
            id: { type: "string" },
            userId: { type: "string" },
            createdDay: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            severity: { type: "number" },
            crashTotalTime: { type: "number" },
            updatedAt: { type: "string", format: "date-time" },
            time: { type: "string" },
            notes: { type: "string" },
          },
          required: ["id", "userId", "createdDay", "createdAt", "time"],
        },
      },
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

export const getCrashesTimeFrameRoute = {
  method: "GET" as HTTPMethods,
  url: "/api/v1/getCrashesTimeFrame",
  onRequest: validateJWT,
  schema,
  handler,
};
