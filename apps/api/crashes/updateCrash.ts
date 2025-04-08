import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { Crash, db } from "@pathize/db";
import { validateJWT } from "../lib/validateJwt";
import { PatchResponse } from "../types";

const handler = async (
  request: FastifyRequest<{
    Body: {
      id: string;
      time: string;
      notes: string | null;
      severity: number | null;
      crashTotalTime: number | null;
    };
  }>,
  reply: FastifyReply,
) => {
  try {
    const { id, time, notes, severity, crashTotalTime } = request.body;

    console.log(crashTotalTime);

    const updatedCrash = await db.crash.update({
      where: { id: id },
      data: {
        time: time,
        notes: notes,
        severity: severity,
        crashTotalTime: crashTotalTime,
        updatedAt: new Date(),
      },
    });

    return reply.status(200).send({
      status: 200,
      message: "OK",
      data: updatedCrash,
    } as PatchResponse<Crash>);
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
      notes: { type: "string" },
      severity: { type: "number" },
    },
    required: ["id", "time"],
  },
  response: {
    200: {
      type: "object",
      properties: {
        status: { type: "number" },
        data: {
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

export const updateCrashRoute = {
  method: "PATCH" as HTTPMethods,
  url: "/api/v1/updateCrash",
  onRequest: validateJWT,
  schema,
  handler,
};
