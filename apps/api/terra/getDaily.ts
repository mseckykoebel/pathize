import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { Daily } from "terra-api";
import { validateJWT } from "../lib/validateJwt";
import dayjs from "dayjs";

import { HeartRateDataSample } from "terra-api/lib/cjs/models/samples/HeartRateDataSample";
import { saveDailyDataToDb } from "../data";
import { DeviceResource } from "@pathize/db";
import { getTerraEnv } from "./utils";

type Props = {
  userId: string;
  terraUserId: string;
  startDate: string;
  endDate: string;
  resource: string;
  toWebhook: boolean;
};

const handler = async (
  request: FastifyRequest<{ Querystring: Props }>,
  reply: FastifyReply
) => {
  const terra = getTerraEnv();
  const { userId, terraUserId, startDate, endDate, resource, toWebhook } =
    request.query;

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
        status: dailyData.status,
        message: "Data sent to webhook",
      });
    }

    if (dailyData.data === undefined || dailyData.data.length === 0) {
      return reply
        .status(404)
        .send({ status: 404, message: "No daily data found" });
    }

    if (dailyData.status === "error") {
      return reply.status(500).send({
        status: 500,
        message:
          "There was an issue fetching this data, either from the provider or from us",
      });
    }

    // get the data where dayjs formatted start time is equal to the start time of the data
    // this is because the data returned from the API is not always in the correct order
    const findData: Daily | undefined = dailyData.data.find(
      (d) =>
        dayjs(d.metadata.start_time).format("YYYY-MM-DD") ===
        dayjs(start).format("YYYY-MM-DD")
    );

    if (findData === undefined) {
      return reply
        .status(404)
        .send({ status: 404, message: "No daily data found" });
    }

    if (findData.heart_rate_data.detailed.hr_samples.length === 0) {
      return reply
        .status(404)
        .send({ status: 404, message: "No heart rate data found" });
    }

    const heartRateData = findData.heart_rate_data.detailed
      .hr_samples as HeartRateDataSample[];

    // replace findData.heart_rate_data.detailed.hr_samples with heartRateData
    findData.heart_rate_data.detailed.hr_samples = heartRateData;

    // save this data to the DB
    const saveResult = await saveDailyDataToDb(
      userId,
      terraUserId,
      resource as DeviceResource,
      findData
    );

    if (saveResult === "error") {
      return reply.status(500).send({
        status: 500,
        message:
          "There was an issue saving this data, either from the provider or from us",
      });
    }

    return reply.status(200).send(heartRateData);
  } catch (err) {
    console.error(err);
    reply
      .status(500)
      .send({ status: 500, message: "Error fetching daily data" });
  }
};

export const getDailyActivityRoute = {
  method: "GET" as HTTPMethods,
  url: "/api/v1/daily",
  onRequest: validateJWT,
  handler,
};
