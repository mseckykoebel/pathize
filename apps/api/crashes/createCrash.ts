import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { db, Crash } from "@pathize/db";
import { validateJWT } from "../lib/validateJwt";
import { PostResponse } from "../types";

const handler = async (
  request: FastifyRequest<{
    Body: {
      userId: string;
      time: string;
      notes: string | null;
      createdDay: string;
      severity: number | null;
      crashTotalTime: number | null;
    };
  }>,
  reply: FastifyReply,
) => {
  try {
    const { userId, time, notes, createdDay, severity, crashTotalTime } =
      request.body;

    const createdCrash = await db.crash.create({
      data: {
        userId: userId,
        time: time,
        notes: notes,
        createdDay: createdDay,
        severity: severity,
        crashTotalTime: crashTotalTime,
      },
    });

    return reply.status(200).send({
      status: 200,
      message: "OK",
      data: createdCrash,
    } as PostResponse<Crash>);
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
      time: { type: "string" },
      notes: { type: "string" },
      createdDay: { type: "string" },
      severity: { type: "number" },
      crashTotalTime: { type: "number" },
    },
    required: ["userId", "time", "notes"],
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
            notes: { type: "string" },
            severity: { type: "number" },
            crashTotalTime: { type: "number" },
            createdDay: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
          required: ["id", "userId", "time", "notes", "createdAt"],
        },
      },
      required: ["status"],
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

export const createCrashRoute = {
  method: "POST" as HTTPMethods,
  url: "/api/v1/createCrash",
  onRequest: validateJWT,
  schema,
  handler,
};
