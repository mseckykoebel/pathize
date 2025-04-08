import { FunctionDefinition } from "openai/resources";

import { db } from "@pathize/db";
import { createDailySleepQueryFunction } from "./functionBuilders";
import { QueryFunction } from "../types";

export async function getSleepFunctions(): Promise<{
  functions: Record<string, QueryFunction>;
  definitions: Record<string, FunctionDefinition>;
}> {
  // TIME IN BED

  const { queryFunction: getTimeInBed, definition: getTimeInBedDefinition } =
    await createDailySleepQueryFunction(
      "getTimeInBed",
      "Get the total time the patient spent in bed, both asleep and not sleeping, for any given day.",
      "time in bed",
      async ({ userId, endDate }) => {
        try {
          const response = await db.sleepData.findFirst({
            where: {
              userId: userId,
              date: endDate,
              durationInBedSeconds: {
                not: null,
              },
            },
            select: {
              durationInBedSeconds: true,
            },
          });

          if (!response?.durationInBedSeconds) return null;

          return Math.round(response.durationInBedSeconds / 60);
        } catch (err) {
          return `Unable to get the time in bed for the given date, please call with different parameters.`;
        }
      }
    );

  // SLEEP EFFICIENCY

  const {
    queryFunction: getSleepEfficiency,
    definition: getSleepEfficiencyDefinition,
  } = await createDailySleepQueryFunction(
    "getSleepEfficiency",
    "Get the sleep efficiency of the patient for any given day.",
    "sleep efficiency",
    async ({ userId, endDate }) => {
      try {
        const response = await db.sleepData.findFirst({
          where: {
            userId: userId,
            date: endDate,
            sleepEfficiency: {
              not: null,
            },
          },
          select: {
            sleepEfficiency: true,
          },
        });

        return response;
      } catch (err) {
        return `Unable to get the sleep efficiency for the given date, please call with different parameters.`;
      }
    }
  );

  // TOTAL TIME ASLEEP

  const {
    queryFunction: getTotalTimeAsleep,
    definition: getTotalTimeAsleepDefinition,
  } = await createDailySleepQueryFunction(
    "getTotalTimeAsleep",
    "Get the total time the patient spent asleep for any given day.",
    "total time asleep",
    async ({ userId, endDate }) => {
      try {
        const response = await db.sleepData.findFirst({
          where: {
            userId: userId,
            date: endDate,
            durationAsleepStateSeconds: {
              not: null,
            },
          },
          select: {
            durationAsleepStateSeconds: true,
          },
        });

        if (!response?.durationAsleepStateSeconds) return null;

        return Math.round(response.durationAsleepStateSeconds / 60);
      } catch (err) {
        return `Unable to get the total time asleep for the given date, please call with different parameters.`;
      }
    }
  );

  // NUMBER OF REM EVENTS WHILE SLEEPING

  const {
    queryFunction: getNumberOfRemEventsWhileSleeping,
    definition: getNumberOfRemEventsWhileSleepingDefinition,
  } = await createDailySleepQueryFunction(
    "getNumberOfRemEventsWhileSleeping",
    "Get the number of REM events the patient had while sleeping for any given day.",
    "number of rem events while sleeping",
    async ({ userId, endDate }) => {
      try {
        const response = await db.sleepData.findFirst({
          where: {
            userId: userId,
            date: endDate,
            numRemEvents: {
              not: null,
            },
          },
          select: {
            numRemEvents: true,
          },
        });

        if (!response?.numRemEvents) return null;

        return response.numRemEvents;
      } catch (err) {
        return `Unable to get the number of REM events for the given date, please call with different parameters.`;
      }
    }
  );

  // DURATION IN DEEP SLEEP

  const {
    queryFunction: getDurationInDeepSleep,
    definition: getDurationInDeepSleepDefinition,
  } = await createDailySleepQueryFunction(
    "getDurationInDeepSleep",
    "Get the total time the patient spent in deep sleep for any given day.",
    "duration in deep sleep",
    async ({ userId, endDate }) => {
      try {
        const response = await db.sleepData.findFirst({
          where: {
            userId: userId,
            date: endDate,
            durationDeepSleepStateSeconds: {
              not: null,
            },
          },
          select: {
            durationDeepSleepStateSeconds: true,
          },
        });

        if (!response?.durationDeepSleepStateSeconds) return null;

        return Math.round(response.durationDeepSleepStateSeconds / 60);
      } catch (err) {
        return `Unable to get the duration in deep sleep for the given date, please call with different parameters.`;
      }
    }
  );

  // NIGHT TIME HRV

  const {
    queryFunction: getNightTimeHrv,
    definition: getNightTimeHrvDefinition,
  } = await createDailySleepQueryFunction(
    "getNightTimeHrv",
    "Get the average HRV of the patient while sleeping for any given day. This is an important data point, and might be used to substitute for the user asking for their average HRV, when appropriate.",
    "night time hrv",
    async ({ userId, endDate }) => {
      try {
        const rmssdResponse = await db.sleepData.findFirst({
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

        if (rmssdResponse?.avgHrvRMSSD) {
          return rmssdResponse;
        }

        const sdnnResponse = await db.sleepData.findFirst({
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
      } catch (err) {
        return `Unable to get the night time HRV for the given date, please call with different parameters.`;
      }
    }
  );

  // NIGHT TIME MAX HR

  const {
    queryFunction: getNightTimeMaxHr,
    definition: getNightTimeMaxHrDefinition,
  } = await createDailySleepQueryFunction(
    "getNightTimeMaxHr",
    "Get the maximum heart rate of the patient while sleeping for any given day. This is important when asking questions related to sleep and sleep quality.",
    "night time max hr",
    async ({ userId, endDate }) => {
      try {
        const response = await db.sleepData.findFirst({
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

        if (!response?.maxHrBpm) return null;

        return response;
      } catch (err) {
        return `Unable to get the night time max heart rate for the given date, please call with different parameters.`;
      }
    }
  );

  // NIGHT TIME AVERAGE HEART RATE

  const {
    queryFunction: getNightTimeAverageHeartRate,
    definition: getNightTimeAverageHeartRateDefinition,
  } = await createDailySleepQueryFunction(
    "getNightTimeAverageHeartRate",
    "Get the average heart rate of the patient while sleeping for any given day. This is important when asking questions related to sleep and sleep quality.",
    "night time rhr",
    async ({ userId, endDate }) => {
      try {
        const response = await db.sleepData.findFirst({
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
      } catch (err) {
        return `Unable to get the night time resting heart rate for the given date, please call with different parameters.`;
      }
    }
  );

  return {
    functions: {
      getTimeInBed,
      getSleepEfficiency,
      getTotalTimeAsleep,
      getNumberOfRemEventsWhileSleeping,
      getDurationInDeepSleep,
      getNightTimeHrv,
      getNightTimeMaxHr,
      getNightTimeAverageHeartRate,
    },
    definitions: {
      getTimeInBedDefinition,
      getSleepEfficiencyDefinition,
      getTotalTimeAsleepDefinition,
      getNumberOfRemEventsWhileSleepingDefinition,
      getDurationInDeepSleepDefinition,
      getNightTimeHrvDefinition,
      getNightTimeMaxHrDefinition,
      getNightTimeAverageHeartRateDefinition,
    },
  };
}
