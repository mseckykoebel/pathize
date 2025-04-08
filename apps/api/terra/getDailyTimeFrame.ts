import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { validateJWT } from "../lib/validateJwt";
import dayjs from "dayjs";
import { getTerraEnv } from "./utils";

type GetDailyTimeFrameProps = {
  terraUserId: string;
  startDate: string;
  endDate: string | null;
  samples: boolean | undefined;
  toWebhook: boolean | undefined;
};

const handler = async (
  request: FastifyRequest<{ Querystring: GetDailyTimeFrameProps }>,
  reply: FastifyReply,
) => {
  const terra = getTerraEnv();
  const { terraUserId, startDate, endDate, toWebhook } = request.query;

  const start = dayjs(startDate).toDate();
  const end = dayjs(endDate).toDate();

  try {
    const dailyData = await terra.getDaily({
      userId: terraUserId,
      startDate: start,
      endDate: end,
      toWebhook: toWebhook,
    });

    // if toWebhook is true, the data will be returned in the webhook, so just return dailyData
    if (toWebhook === true) {
      return reply.status(200).send({
        status: 200,
        message: "Data sent to webhook",
        data: [],
      });
    }

    // if toWebhook is false, the data will be returned in the response
    // just return it
    return reply.status(200).send({
      status: 200,
      message: "Data fetched successfully",
      data: dailyData.data,
    });
  } catch (err) {
    return reply.status(500).send({
      status: 500,
      message:
        "There was an issue fetching this data, either from the provider or from us",
    });
  }
};

const schema = {
  querystring: {
    type: "object",
    properties: {
      terraUserId: { type: "string" },
      startDate: { type: "string" },
      endDate: { type: "string" },
      samples: { type: "boolean" },
      toWebhook: { type: "boolean" },
    },
    required: ["terraUserId", "startDate"],
  },
  response: {
    200: {
      type: "object",
      properties: {
        status: { type: "number" },
        message: { type: "string" },
        data: {
          type: "array",
        },
      },
      required: ["status", "message", "data"],
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

export const getDailyTimeFrameRoute = {
  method: "GET" as HTTPMethods,
  url: "/api/v1/getDailyTimeFrame",
  onRequest: validateJWT,
  schema,
  handler,
};
