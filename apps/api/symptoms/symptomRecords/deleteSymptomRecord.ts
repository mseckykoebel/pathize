import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { db } from "@pathize/db";
import { validateJWT } from "../../lib/validateJwt";
import { DeleteResponse } from "../../types";

type DeleteSymptomProps = {
  id: string;
};

const handler = async (
  request: FastifyRequest<{ Querystring: DeleteSymptomProps }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.query;

    await db.symptomRecord.delete({
      where: {
        id: id,
      },
    });

    return reply.status(204).send();
  } catch (err) {
    reply.code(500).send({
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

export const deleteSymptomRoute = {
  method: "DELETE" as HTTPMethods,
  url: "/api/v1/deleteSymptomRecord",
  onRequest: validateJWT,
  schema,
  handler,
};
