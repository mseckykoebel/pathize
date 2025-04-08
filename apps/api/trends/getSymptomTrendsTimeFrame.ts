import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import dayjs from "dayjs";

import { SymptomRecord, db } from "@pathize/db";
import { GetResponse, SymptomTrendsResponse } from "../types";
import { toCamelCase } from "../lib";

type Props = {
  endDate: string;
  daysToFetch: number;
  userId: string;
};

const handler = async (
  request: FastifyRequest<{
    Querystring: Props;
  }>,
  reply: FastifyReply
) => {
  const { endDate, daysToFetch, userId } = request.query;

  try {
    const symptomDataDbResponse: {
      date: string;
      data: SymptomRecord[] | null;
    }[] = [];
    const dateArray = endDate.split("-");
    const year = parseInt(dateArray[0]);
    const month = parseInt(dateArray[1]);
    const day = parseInt(dateArray[2]);
    let currentDate = dayjs(`${year}-${month}-${day}`);

    for (let i = 0; i < daysToFetch; i++) {
      const symptomRecord: SymptomRecord[] | null =
        await db.symptomRecord.findMany({
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

    // extract the unique names from the past 30 days of symptoms
    const symptomNames: string[] = [];
    symptomDataDbResponse.forEach((record) => {
      if (record.data) {
        record.data.forEach((symptom) => {
          const name = toCamelCase(symptom.name);
          if (!symptomNames.includes(name)) symptomNames.push(name);
        });
      }
    });

    // create symptomTrendsResponse for each date
    const symptomTrendsResponse: SymptomTrendsResponse[] =
      symptomDataDbResponse.map((record) => {
        const response: SymptomTrendsResponse = { date: record.date };
        symptomNames.forEach((name) => (response[name] = null));
        return response;
      });

    symptomDataDbResponse.forEach((record) => {
      if (record.data && record.data.length > 0) {
        // Create a mapping of userSymptomId to its severities
        const userSymptomIdToSeverities: { [userSymptomId: string]: number[] } =
          {};

        // Create a mapping from userSymptomId to symptom name in camel case
        const idToName: { [userSymptomId: string]: string } = {};

        record.data.forEach((symptom) => {
          const id = symptom.userSymptomId as string;
          const camelCaseName = toCamelCase(symptom.name);
          idToName[id] = camelCaseName;

          if (!userSymptomIdToSeverities[id]) {
            userSymptomIdToSeverities[id] = [];
          }
          if (symptom.severity !== undefined) {
            userSymptomIdToSeverities[id].push(symptom.severity ?? 0);
          }
        });

        // Compute average for each userSymptomId and store it in the result
        const dateResponse = symptomTrendsResponse.find(
          (response) => response.date === record.date
        );

        if (dateResponse) {
          for (const id in userSymptomIdToSeverities) {
            const severities = userSymptomIdToSeverities[id];
            const averageSeverity =
              severities.reduce((acc, curr) => acc + curr, 0) /
              severities.length;
            dateResponse[idToName[id]] = Number(averageSeverity.toFixed(2)); // format to two decimal places
          }
        }
      } else {
        const dateResponse = symptomTrendsResponse.find(
          (response) => response.date === record.date
        );
        if (dateResponse) {
          symptomNames.forEach((name) => (dateResponse[name] = null));
        }
      }
    });

    return reply.status(200).send({
      status: 200,
      message: "OK",
      data: symptomTrendsResponse,
    } as GetResponse<SymptomTrendsResponse>);
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

export const getSymptomTrendsTimeFrame = {
  method: "GET" as HTTPMethods,
  url: "/api/v1/getSymptomTrendsTimeFrame",
  // onRequest: validateJWT,
  handler,
  schema,
};
