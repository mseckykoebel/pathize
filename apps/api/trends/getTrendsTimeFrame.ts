/* eslint-disable indent */
import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { HeartRateDataSample } from "terra-api/lib/cjs/models/samples/HeartRateDataSample";
import dayjs from "dayjs";

import { DailyData, db, DeviceResource, SleepData } from "@pathize/db";
import { getTimeAboveLimit } from "@pathize/lib";
import { GetResponse, TrendsResponse } from "../types";
import { trendsMap, trendsCategoryMap } from "./";
import { validateJWT } from "../lib";

type Props = {
  endDate: string;
  daysToFetch: number;
  userId: string;
  resource: DeviceResource;
  limit: number;
};

const handler = async (
  request: FastifyRequest<{ Querystring: Props }>,
  reply: FastifyReply
) => {
  const { endDate, daysToFetch, userId, resource, limit } = request.query;

  try {
    const dailyDataDbResponse: { date: string; data: DailyData | null }[] = [];
    const sleepDataDbResponse: { date: string; data: SleepData | null }[] = [];
    const dateArray = endDate.split("-");
    const year = parseInt(dateArray[0]);
    const month = parseInt(dateArray[1]);
    const day = parseInt(dateArray[2]);
    let currentDate = dayjs(`${year}-${month}-${day}`);

    for (let i = 0; i < daysToFetch; i++) {
      const date = currentDate.format("YYYY-MM-DD");
      const dailyData: DailyData | null = await db.dailyData.findFirst({
        where: {
          userId: userId,
          date: date,
          resource: resource,
        },
      });
      const sleepData: SleepData | null = await db.sleepData.findFirst({
        where: {
          userId: userId,
          date: date,
          resource: resource,
        },
      });

      dailyDataDbResponse.push({
        date: date,
        data: dailyData || null,
      });

      sleepDataDbResponse.push({
        date: date,
        data: sleepData || null,
      });

      currentDate = currentDate.subtract(1, "day");
    }

    // if either the dailyDataDbResponse or sleepDataDbResponse is less than daysToFetch, return a 404
    if (
      dailyDataDbResponse.length < daysToFetch ||
      sleepDataDbResponse.length < daysToFetch
    ) {
      return reply.status(404).send({
        status: 404,
        message: "Data not found for all dates...",
      } as GetResponse<null>);
    }

    // sort the arrays
    dailyDataDbResponse.sort((a, b) =>
      dayjs(a.date).isBefore(dayjs(b.date)) ? -1 : 1
    ),
      sleepDataDbResponse.sort((a, b) =>
        dayjs(a.date).isBefore(dayjs(b.date)) ? -1 : 1
      );

    // loop through both dailyDataDbResponse and sleepDataDbResponse, and extract the unique keys that are present
    // only add the key if in at least one of the arrays the value is not null/undefined
    const trendNames: string[] = [];
    Object.keys(trendsMap).forEach((key) => {
      const isNotNullInDailyData = dailyDataDbResponse.some(
        (record) =>
          record.data &&
          record.data[key as keyof typeof record.data] !== null &&
          record.data[key as keyof typeof record.data] !== undefined
      );
      const isNotNullInSleepData = sleepDataDbResponse.some(
        (record) =>
          record.data &&
          record.data[key as keyof typeof record.data] !== null &&
          record.data[key as keyof typeof record.data] !== undefined
      );
      if (isNotNullInDailyData || isNotNullInSleepData) {
        trendNames.push(trendsMap[key as keyof typeof trendsMap]);
      }
    });

    const trendsDataArray: TrendsResponse[] = [];
    for (let i = 0; i < daysToFetch; i++) {
      const dailyDataEntry = dailyDataDbResponse[i].data || null;
      const sleepDataEntry = sleepDataDbResponse[i].data || null;

      // first, get our custom data processing out of the way
      let timeAboveLimit = 0;
      const heartSamples =
        dailyDataEntry?.heartRateSamples &&
        JSON.stringify(dailyDataEntry?.heartRateSamples).length >= 0
          ? (JSON.parse(
              dailyDataEntry?.heartRateSamples as string
            ) as HeartRateDataSample[])
          : null;
      if (heartSamples) {
        timeAboveLimit = Math.trunc(getTimeAboveLimit(heartSamples, limit));
      }

      const trendsResponse: TrendsResponse = {} as TrendsResponse;
      // add the timeAboveLimit property always
      trendsResponse.timeAboveLimit = {
        value: timeAboveLimit,
        category: "Activity",
      };
      trendNames.forEach((trendName) => {
        trendsResponse["date"] = dailyDataDbResponse[i].date;
        const key = Object.keys(trendsMap).find(
          (key) => trendsMap[key as keyof typeof trendsMap] === trendName
        );
        if (key) {
          trendsResponse[trendName] = {
            value:
              Number(dailyDataEntry?.[key as keyof typeof dailyDataEntry]) ||
              Number(sleepDataEntry?.[key as keyof typeof sleepDataEntry]) ||
              null,
            category: trendsCategoryMap[
              trendName as keyof typeof trendsCategoryMap
            ] as "Activity" | "Heart" | "Sleep",
          };
        }
      });

      trendsDataArray.push(trendsResponse);
    }

    return reply.status(200).send({
      status: 200,
      message: "OK",
      data: trendsDataArray,
    } as GetResponse<TrendsResponse>);
  } catch (err) {
    return reply.status(500).send({
      status: 400,
      message: "Internal server error",
    } as GetResponse<null>);
  }
};

const TrendsResponseSchema = {
  type: "object",
  properties: {
    date: { type: "string" },
  },
  additionalProperties: {
    type: "object",
    properties: {
      value: { type: ["number", "null"] },
      category: { type: "string", enum: ["Sleep", "Activity", "Heart"] },
    },
    required: ["value", "category"],
  },
  required: ["date"],
};

const schema = {
  querystring: {
    type: "object",
    properties: {
      endDate: { type: "string" },
      daysToFetch: { type: "number" },
      userId: { type: "string" },
      resource: { type: "string" },
      limit: { type: "number" },
    },
    required: ["endDate", "daysToFetch", "userId", "resource", "limit"],
  },
  response: {
    200: {
      type: "object",
      properties: {
        status: { type: "number" },
        message: { type: "string" },
        data: {
          type: "array",
          items: TrendsResponseSchema,
        },
      },
      required: ["status"],
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
        status: { type: "string" },
        message: { type: "string" },
      },
      required: ["status", "message"],
    },
  },
};

export const getTrendsTimeFrameRoute = {
  method: "GET" as HTTPMethods,
  url: "/api/v1/getTrendsTimeFrame",
  onRequest: validateJWT,
  schema,
  handler,
};
