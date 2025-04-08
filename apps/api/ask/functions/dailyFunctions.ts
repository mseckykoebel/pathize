/* eslint-disable indent */
import { FunctionDefinition } from "openai/resources";
import { HeartRateDataSample } from "terra-api/lib/cjs/models/samples/HeartRateDataSample";

import { db } from "@pathize/db";
import { createDailySleepQueryFunction } from "./functionBuilders";
import { QueryFunction } from "../types";
import { getTimeAboveLimit } from "@pathize/lib";
import { convertMinutesToHoursAndMinutes, getLimit } from "../utils";

export async function getDailyFunctions(): Promise<{
  functions: Record<string, QueryFunction>;
  definitions: Record<string, FunctionDefinition>;
}> {
  // OXYGEN SATURATION AVERAGE

  const {
    queryFunction: getOxygenSaturationAverage,
    definition: getOxygenSaturationAverageDefinition,
  } = await createDailySleepQueryFunction(
    "getOxygenSaturationAverage",
    "Get the average oxygen saturation for a given day.",
    "average oxygen saturation",
    async ({ userId, endDate }) => {
      const response = await db.dailyData.findFirst({
        where: {
          userId: userId,
          date: endDate,
          averageSaturationPercentage: {
            not: null,
          },
        },
        select: {
          averageSaturationPercentage: true,
        },
      });

      return response;
    }
  );

  // VO2 MAX AVERAGE

  const {
    queryFunction: getVo2MaxAverage,
    definition: getVo2MaxAverageDefinition,
  } = await createDailySleepQueryFunction(
    "getVo2MaxAverage",
    "Get the average VO2 max for a given day.",
    "average VO2 max",
    async ({ userId, endDate }) => {
      const response = await db.dailyData.findFirst({
        where: {
          userId: userId,
          date: endDate,
          vo2MaxMlPerMinPerKg: {
            not: null,
          },
        },
        select: {
          vo2MaxMlPerMinPerKg: true,
        },
      });

      return response;
    }
  );

  // DEVICE NAME

  const { queryFunction: getDeviceName, definition: getDeviceNameDefinition } =
    await createDailySleepQueryFunction(
      "getDeviceName",
      "Get the name of the device that the data is from.",
      "device name",
      async ({ userId, endDate }) => {
        const response = await db.dailyData.findFirst({
          where: {
            userId: userId,
            date: endDate,
          },
          select: {
            deviceName: true,
          },
        });

        return response;
      }
    );

  // TOTAL CALORIES

  const {
    queryFunction: getTotalCalories,
    definition: getTotalCaloriesDefinition,
  } = await createDailySleepQueryFunction(
    "getTotalCalories",
    "Get the total calories the patient has burned for a given day.",
    "total calories",
    async ({ userId, endDate }) => {
      const response = await db.dailyData.findFirst({
        where: {
          userId: userId,
          date: endDate,
          totalCalories: {
            not: null,
          },
        },
        select: {
          totalCalories: true,
        },
      });

      return response;
    }
  );

  // TOTAL STEPS

  const { queryFunction: getTotalSteps, definition: getTotalStepsDefinition } =
    await createDailySleepQueryFunction(
      "getTotalSteps",
      "Get the total steps for a given day.",
      "total steps",
      async ({ userId, endDate }) => {
        const response = await db.dailyData.findFirst({
          where: {
            userId: userId,
            date: endDate,
            steps: {
              not: null,
            },
          },
          select: {
            steps: true,
          },
        });

        return response;
      }
    );

  // MAX HR

  const { queryFunction: getMaxHr, definition: getMaxHrDefinition } =
    await createDailySleepQueryFunction(
      "getMaxHr",
      "Get the max HR for a given day",
      "max HR",
      async ({ userId, endDate }) => {
        const response = await db.dailyData.findFirst({
          where: {
            userId: userId,
            date: endDate,
            maxHrBpm: {
              not: null,
            },
          },
          select: {
            maxHrBpm: true,
          },
        });

        return response;
      }
    );

  // RESTING HR

  const { queryFunction: getRestingHr, definition: getRestingHrDefinition } =
    await createDailySleepQueryFunction(
      "getRestingHr",
      "Get the resting HR for a given day",
      "resting HR",
      async ({ userId, endDate }) => {
        const response = await db.dailyData.findFirst({
          where: {
            userId: userId,
            date: endDate,
            restingHrBpm: {
              not: null,
            },
          },
          select: {
            restingHrBpm: true,
          },
        });

        return response;
      }
    );

  // AVG HR

  const { queryFunction: getAvgHr, definition: getAvgHrDefinition } =
    await createDailySleepQueryFunction(
      "getAvgHr",
      "Get the average HR for a given day",
      "average HR",
      async ({ userId, endDate }) => {
        const response = await db.dailyData.findFirst({
          where: {
            userId: userId,
            date: endDate,
            avgHrBpm: {
              not: null,
            },
          },
          select: {
            avgHrBpm: true,
          },
        });

        return response;
      }
    );

  // MIN HR

  const { queryFunction: getMinHr, definition: getMinHrDefinition } =
    await createDailySleepQueryFunction(
      "getMinHr",
      "Get the min HR for a given day",
      "min HR",
      async ({ userId, endDate }) => {
        const response = await db.dailyData.findFirst({
          where: {
            userId: userId,
            date: endDate,
            minHrBpm: {
              not: null,
            },
          },
          select: {
            minHrBpm: true,
          },
        });

        return response;
      }
    );

  // HRV TOTAL

  const { queryFunction: getHrvTotal, definition: getHrvTotalDefinition } =
    await createDailySleepQueryFunction(
      "getHrvTotal",
      "Get the HRV total for a given day.",
      "HRV total",
      async ({ userId, endDate }) => {
        const rmssdResponse = await db.dailyData.findFirst({
          where: {
            userId: userId,
            date: endDate,
            avgHrvRMSSD: {
              not: null,
            },
          },
          select: {
            avgHrvRMSSD: true,
          },
        });

        if (rmssdResponse) return rmssdResponse;

        const sdnnResponse = await db.dailyData.findMany({
          where: {
            userId: userId,
            date: endDate,
            avgHrvSDNN: {
              not: null,
            },
          },
          select: {
            avgHrvSDNN: true,
          },
        });

        return sdnnResponse;
      }
    );

  // TIME ABOVE LIMIT TOTAL

  const {
    queryFunction: getTimeAboveLimitTotal,
    definition: getTimeAboveLimitTotalDefinition,
  } = await createDailySleepQueryFunction(
    "getTimeAboveLimitTotal",
    "Get the time above limit total for a given day.",
    "time above limit total",
    async ({ userId, endDate }) => {
      const limit = await getLimit(userId);
      if (!limit) return "No heart rate limit set";

      const samplesResponse = await db.dailyData.findFirst({
        where: {
          userId: userId,
          date: endDate,
          heartRateSamples: {
            not: {
              equals: null,
            },
          },
        },
      });

      if (!samplesResponse) return null;

      const samples = JSON.parse(
        samplesResponse.heartRateSamples as string
      ) as HeartRateDataSample[];

      const timeAboveLimit = getTimeAboveLimit(samples, limit);
      const timeAboveLimitMinsHours =
        convertMinutesToHoursAndMinutes(timeAboveLimit);

      return timeAboveLimitMinsHours;
    }
  );

  ////
  // EXPORT FUNCTIONS AND DEFINITIONS
  ////

  return {
    functions: {
      // oxygen saturation
      getOxygenSaturationAverage,
      // VO2 max
      getVo2MaxAverage,
      // device name
      getDeviceName,
      // steps
      getTotalSteps,
      // total calories
      getTotalCalories,
      // heart rate
      getMaxHr,
      getRestingHr,
      getAvgHr,
      getMinHr,
      // HRV
      getHrvTotal,
      // time above limit
      getTimeAboveLimitTotal,
    },
    definitions: {
      // oxygen saturation
      getOxygenSaturationAverageDefinition,
      // VO2 max
      getVo2MaxAverageDefinition,
      // device name
      getDeviceNameDefinition,
      // steps
      getTotalStepsDefinition,
      // total calories
      getTotalCaloriesDefinition,
      // heart rate
      getMaxHrDefinition,
      getRestingHrDefinition,
      getAvgHrDefinition,
      getMinHrDefinition,
      // HRV
      getHrvTotalDefinition,
      // time above limit
      getTimeAboveLimitTotalDefinition,
    },
  };
}
