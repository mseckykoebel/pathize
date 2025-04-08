import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { db, Promotion } from "@pathize/db";

import { validateJWT } from "../lib/validateJwt";
import { GetResponse, PatchResponse } from "../types";

type Props = {
  id: string;
  applied: boolean;
}

const handler = async (
  request: FastifyRequest<{
    Body: Props;
  }>,
  reply: FastifyReply
) => {
  const { id, applied } = request.body;

  try {
    const promotionRecord = await db.promotion.update({
      where: {
        id: id,
      },
      data: {
        applied: applied,
        updatedAt: new Date(),
      },
    });

    // if null, return a 404
    if (!promotionRecord) {
      return reply.status(404).send({
        status: 404,
        message: "Promotion record not found",
      } as PatchResponse<Promotion>);
    }

    return reply.status(200).send({
      status: 200,
      message: "OK",
      data: promotionRecord,
    } as GetResponse<Promotion>);
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
      applied: { type: "boolean" },
    },
    required: ["id", "applied"],
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
            "updatedAt",
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

export const updatePromotionRecordRoute = {
  method: "PATCH" as HTTPMethods,
  url: "/api/v1/updatePromotionRecord",
  handler,
  schema,
  onRequest: validateJWT,
};
