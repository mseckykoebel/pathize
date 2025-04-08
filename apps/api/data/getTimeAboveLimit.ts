import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { HeartRateDataSample } from "terra-api/lib/cjs/models/samples/HeartRateDataSample";

import { DailyData, db, DeviceResource } from "@pathize/db";
import { getTimeAboveLimit } from "@pathize/lib";
import { validateJWT } from "../lib";
import { GetResponse } from "../types";

type TerraUserId = {
  date: string;
  userId: string;
  resource: DeviceResource;
  baseline: number;
};

const handler = async (
  request: FastifyRequest<{ Querystring: TerraUserId }>,
  reply: FastifyReply
) => {
  const { date, userId, resource, baseline } = request.query;

  try {
    const dailyData: DailyData | null = await db.dailyData.findFirst({
      where: {
        userId: userId,
        date: date,
        resource: resource,
      },
    });

    if (!dailyData) {
      return reply
        .status(404)
        .send({ status: 404, message: "No data found" } as GetResponse<null>);
    }

    // if heartRateSamples is null, or the JSON.stringify'ed length is zero, return a 404
    if (
      !dailyData.heartRateSamples ||
      JSON.stringify(dailyData.heartRateSamples).length === 0
    ) {
      return reply
        .status(404)
        .send({ status: 404, message: "No data found" } as GetResponse<null>);
    }

    const heartSamples = JSON.parse(
      dailyData.heartRateSamples as string
    ) as HeartRateDataSample[];

    const timeAboveLimit = getTimeAboveLimit(heartSamples, baseline);

    return reply.status(200).send({
      timeAboveLimit: timeAboveLimit,
    });
  } catch (err) {
    console.error(err);
    reply.status(500).send({ error: err });
  }
};

export const getTimeAboveLimitRoute = {
  method: "GET" as HTTPMethods,
  url: "/api/v1/getTimeAboveLimit",
  onRequest: validateJWT,
  handler,
};
