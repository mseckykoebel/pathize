import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";

import { Prisma, db } from "@pathize/db";
import { validateJWT } from "../lib/validateJwt";
import { DeleteResponse } from "../types";

type Props = {
  id: string;
};

const handler = async (
  request: FastifyRequest<{ Querystring: Props }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.query;

    // first, delete all join table entries
    await db.checkInMedication.deleteMany({ where: { checkInId: id } });
    await db.checkInSymptom.deleteMany({ where: { checkInId: id } });

    // delete the check-in record
    await db.checkIn.delete({ where: { id: id } });

    return reply.status(204).send();
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return reply.code(404).send({
        status: 404,
        message: "Check in record not found",
      } as DeleteResponse);
    }

    return reply.code(500).send({
      status: 500,
      message: "Internal Server Error",
    } as DeleteResponse);
  }
};

const schema = {
  query: {
    type: "object",
    properties: {
      id: { type: "string" },
    },
    required: ["id"],
  },
  response: {
    204: {
      type: "object",
      properties: {
        status: { type: "number" },
        message: { type: "string" },
      },
    },
    404: {
      type: "object",
      properties: {
        status: { type: "number" },
        message: { type: "string" },
      },
    },
    500: {
      type: "object",
      properties: {
        status: { type: "number" },
        message: { type: "string" },
      },
    },
  },
};

export const deleteCheckInRoute = {
  method: "DELETE" as HTTPMethods,
  url: "/api/v1/deleteCheckIn",
  onRequest: validateJWT,
  handler,
  schema,
};
