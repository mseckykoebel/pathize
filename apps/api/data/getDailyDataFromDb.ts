import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { validateJWT } from "../lib";
import { DailyData, DailyDataResponse, db, DeviceResource } from "@pathize/db";
import { GetResponse } from "../types";

type TerraUserId = {
  date: string;
  userId: string;
  resource: DeviceResource;
};

const handler = async (
  request: FastifyRequest<{ Querystring: TerraUserId }>,
  reply: FastifyReply
) => {
  const { date, userId, resource } = request.query;

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

    const hrd = JSON.parse(dailyData.heartRateSamples as string);

    return reply.status(200).send({
      heartRateData: hrd,
      updatedAt: dailyData.updatedAt,
    } as DailyDataResponse);
  } catch (err) {
    console.error(err);
    reply.status(500).send({ error: err });
  }
};

export const getDailyDataRoute = {
  method: "GET" as HTTPMethods,
  url: "/api/v1/getDailyData",
  onRequest: validateJWT,
  handler,
};
