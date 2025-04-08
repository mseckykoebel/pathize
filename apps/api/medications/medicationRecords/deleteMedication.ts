import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { db } from "@pathize/db";
import { validateJWT } from "../../lib/validateJwt";
import { DeleteResponse } from "../../types";

type DeleteMedicationProps = {
  id: string;
};

const handler = async (
  request: FastifyRequest<{ Querystring: DeleteMedicationProps }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.query;

    await db.medicationRecord.delete({
      where: {
        id: id,
      },
    });

    return reply.status(204).send();
  } catch (err) {
    reply.status(500).send({
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
      properties: {},
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

export const deleteMedicationRecordRoute = {
  method: "DELETE" as HTTPMethods,
  url: "/api/v1/deleteMedicationRecord",
  onRequest: validateJWT,
  schema,
  handler,
};
