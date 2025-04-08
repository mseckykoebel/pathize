import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { db, Promotion, PromotionType, PromotionIdentifier } from "@pathize/db";

import { validateJWT } from "../lib/validateJwt";
import { PostResponse } from "../types";

type Props = {
  userId: string;
  promotionType: PromotionType;
  promotionIdentifier: PromotionIdentifier;
  applied: boolean;
}

const handler = async (
  request: FastifyRequest<{
    Querystring: Props;
  }>,
  reply: FastifyReply
) => {
  const { userId, promotionType, promotionIdentifier, applied } = request.query;

  try {
    const createdPromotionRecord = await db.promotion.create({
      data: {
        userId: userId,
        promotionType: promotionType,
        promotionIdentifier: promotionIdentifier,
        applied: applied,
        createdAt: new Date(),
      },
    });

    return reply.status(200).send({
      status: 200,
      message: "OK",
      data: createdPromotionRecord,
    } as PostResponse<Promotion>);
  } catch (err) {
    reply.code(500).send({
      status: 500,
      message: "Internal Server Error",
    } as PostResponse<null>);
  }
};

const schema = {
  querystring: {
    type: "object",
    properties: {
      userId: { type: "string" },
      promotionType: { type: "string" },
      promotionIdentifier: { type: "string" },
      applied: { type: "boolean" },
    },
    required: ["userId", "promotionType", "promotionIdentifier", "applied"],
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
            promotionType: { type: "string" },
            promotionIdentifier: { type: "string" },
            applied: { type: "boolean" },
            createdAt: { type: "string" },
          },
        },
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

export const createPromotionRecordRoute = {
  method: "POST" as HTTPMethods,
  url: "/api/v1/createPromotionRecord",
  handler,
  schema,
  onRequest: validateJWT,
};
