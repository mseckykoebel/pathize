import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import dayjs from "dayjs";

import { SymptomRecord, db } from "@pathize/db";
import { validateJWT } from "../../lib";
import { GetResponse } from "../../types";

type Props = {
  endDate: string;
  daysToFetch: number;
  userId: string;
};

const handler = async (
  request: FastifyRequest<{
    Querystring: Props;
  }>,
  reply: FastifyReply,
) => {
  const { endDate, daysToFetch, userId } = request.query;

  try {
    const symptomDataDbResponse: {
      date: string;
      data: SymptomRecord | null;
    }[] = [];
    const dateArray = endDate.split("-");
    const year = parseInt(dateArray[0]);
    const month = parseInt(dateArray[1]);
    const day = parseInt(dateArray[2]);
    let currentDate = dayjs(`${year}-${month}-${day}`);

    for (let i = 0; i < daysToFetch; i++) {
      const symptomRecord: SymptomRecord | null =
        await db.symptomRecord.findFirst({
          where: {
            userId: userId,
            createdDay: currentDate.format("YYYY-MM-DD"),
          },
        });
      // if dailyData for this date is null
      if (!symptomRecord) {
        symptomDataDbResponse.push({
          date: currentDate.format("YYYY-MM-DD"),
          data: null,
        });
      } else {
        symptomDataDbResponse.push({
          date: currentDate.format("YYYY-MM-DD"),
          data: symptomRecord,
        });
      }

      currentDate = currentDate.subtract(1, "day");
    }

    // if the length of symptomDataDbResponse is less than daysToFetch, return a 404
    if (symptomDataDbResponse.length < daysToFetch) {
      return reply.status(404).send({
        status: 404,
        message: "Not Found",
      } as GetResponse<null>);
    }

    // sort the array
    symptomDataDbResponse.sort((a, b) => {
      return dayjs(a.date).isBefore(dayjs(b.date)) ? -1 : 1;
    });

    return reply.status(200).send({
      status: 200,
      message: "OK",
      data: symptomDataDbResponse,
    } as GetResponse<
      {
        date: string;
        data: SymptomRecord | null;
      }[]
    >);
  } catch (err) {
    reply.status(500).send({
      status: 500,
      message: `There was an error: ${err}`,
    } as GetResponse<null>);
  }
};

const schema = {
  querystring: {
    type: "object",
    properties: {
      endDate: { type: "string" },
      daysToFetch: { type: "number" },
      userId: { type: "string" },
    },
    required: ["endDate", "daysToFetch", "userId"],
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
        status: { type: "number" },
        message: { type: "string" },
      },
      required: ["status", "message"],
    },
  },
};

export const getSymptomRecordsTimeFrameRoute = {
  method: "GET" as HTTPMethods,
  url: "/api/v1/getSymptomRecordsTimeFrame",
  onRequest: validateJWT,
  handler,
  schema,
};
