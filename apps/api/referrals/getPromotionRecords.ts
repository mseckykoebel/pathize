import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { db, Promotion } from "@pathize/db";

import { validateJWT } from "../lib/validateJwt";
import { GetResponse } from "../types";

type Props = {
  userId: string;
}

const handler = async (
  request: FastifyRequest<{
    Querystring: Props;
  }>,
  reply: FastifyReply
) => {
  const { userId } = request.query;

  try {
    const promotionRecords = await db.promotion.findMany({
      where: {
        userId: userId,
      },
    });

    // if null, return a 404
    if (!promotionRecords) {
      return reply.status(404).send({
        status: 404,
        message: "Promotion record not found",
      } as GetResponse<Promotion>);
    }

    return reply.status(200).send({
      status: 200,
      message: "OK",
      data: promotionRecords,
    } as GetResponse<Promotion>);
  } catch (err) {
    reply.code(500).send({
      status: 500,
      message: "Internal Server Error",
    } as GetResponse<null>);
  }
};

const schema = {
  querystring: {
    type: "object",
    properties: {
      userId: { type: "string" },
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
            id: { type: "string" },
            userId: { type: "string" },
            promotionType: {
              type: "string",
              enum: ["OFFER_CODE", "PROMOTIONAL_OFFER"],
            },
            promotionIdentifier: {
              type: "string",
              enum: ["p_free_1m_v1", "p_free_3m_v1", "PH1M2023"],
            },
            applied: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
          required: [
            "id",
            "userId",
            "promotionType",
            "promotionIdentifier",
            "applied",
            "createdAt",
          ],
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
    },
  },
};

export const getPromotionRecordsRoute = {
  method: "GET" as HTTPMethods,
  url: "/api/v1/getPromotionRecords",
  handler,
  schema,
  onRequest: validateJWT,
};
