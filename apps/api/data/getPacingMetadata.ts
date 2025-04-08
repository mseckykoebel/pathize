/* eslint-disable indent */
import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { validateJWT } from "../lib";
import {
  DailyData,
  db,
  DeviceResource,
  PacingMetadataResponse,
} from "@pathize/db";
import { GetResponse } from "../types";

type PacingMetadataProps = {
  date: string;
  userId: string;
  resource: DeviceResource;
};

const handler = async (
  request: FastifyRequest<{ Querystring: PacingMetadataProps }>,
  reply: FastifyReply,
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

    return reply.status(200).send({
      status: 200,
      message: "OK",
      data: {
        heartRateVariance: dailyData.avgHrvSDNN
          ? dailyData.avgHrvSDNN
          : dailyData.avgHrvRMSSD
          ? dailyData.avgHrvRMSSD
          : null,
        restingHeartRate: dailyData.restingHrBpm
          ? dailyData.restingHrBpm
          : null,
      },
    } as GetResponse<PacingMetadataResponse>);
  } catch (err) {
    reply.status(500).send({ status: 500, message: "Internal server error" });
  }
};

export const getPacingMetadataRoute = {
  method: "GET" as HTTPMethods,
  url: "/api/v1/getPacingMetadata",
  onRequest: validateJWT,
  handler,
};
