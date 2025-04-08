import { FunctionDefinition } from "openai/resources";

import { db } from "@pathize/db";
import { createRecordQueryFunction } from "./functionBuilders";
import {
  getEnergyBudgetTimeAboveLimit,
  removeDuplicateCrashes,
} from "@pathize/lib";
import { getDailyData, getLimit, removeDailyDataDuplicates } from "../utils";
import type { QueryFunction } from "../types";

async function getCrashes(userId: string, endDate: string) {
  try {
    const response = await db.crash.findMany({
      where: {
        userId: userId,
        createdDay: {
          lte: endDate,
        },
      },
      select: {
        createdDay: true,
        severity: true,
      },
    });

    return response;
  } catch (err) {
    return null;
  }
}

export async function getInsightFunctions(): Promise<{
  functions: Record<string, QueryFunction>;
  definitions: Record<string, FunctionDefinition>;
}> {
  // GET THE AVERAGE TIME ABOVE LIMIT WHERE CRASHES TAKE PLACE
  const {
    queryFunction: getAverageTimeAboveLimitWhenCrashesOccur,
    definition: getAverageTimeAboveLimitWhenCrashesOccurDefinition,
  } = await createRecordQueryFunction(
    "getAverageTimeAboveLimitWhenCrashesOccur",
    "Get the average time this patient spends above their limit, in minutes, that coincides with crashes that they have recorded. This function is useful if the patient is asking questions about the time they spend above their limit, and crashing, and if there is some kind of connection between them.",
    "average time above limit in which crashes take place",
    async ({ userId, endDate }) => {
      try {
        // get all crash records
        const crashResponse = await getCrashes(userId, endDate);
        if (!crashResponse || crashResponse.length === 0) {
          return "No crashes have been recorded inside Pathize.";
        }
        const filteredCrashes = removeDuplicateCrashes(crashResponse);

        // get the last 29 days of daily data
        const allDailyData = await getDailyData(userId);
        if (!allDailyData || allDailyData.length === 0) {
          return "No daily data has been recorded inside Pathize.";
        }
        const dailyData = allDailyData
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          )
          .slice(-29);
        const dailyDataUnique = removeDailyDataDuplicates(dailyData);

        // get limit
        const limit = await getLimit(userId);
        if (!limit) return "No limit has been set inside Pathize.";

        return getEnergyBudgetTimeAboveLimit(
          limit,
          filteredCrashes,
          dailyDataUnique,
          true
        );
      } catch (err) {
        console.log(
          "ERROR WITH GETTING THE AVERAGE TIME ABOVE LIMIT WHEN CRASHES OCCUR: ",
          err
        );
        return "There was an error getting the average time above limit when crashes occur.";
      }
    }
  );

  // GET METADATA FOR ACTIVITIES ON A SPECIFIC DAY
  // const {
  //   queryFunction: getMetadataForActivitiesOnSpecificDay,
  //   definition: getMetadataForActivitiesOnSpecificDayDefinition,
  // } = await createRecordQueryFunction(
  //   "getMetadataForActivitiesOnSpecificDay",
  //   "Get the metadata for activities on a specific day. This function is useful if the patient is asking questions about biometric data for a set of activities, such as time spent above limit, max HR, or min HR for a specific set of activities.",
  //   "metadata for activities on a specific day, including activity name, max HR, min HR, and time spent above limit",
  //   async ({ userId, endDate }) => {
  //     try {
  //       const response = await getActivityRecords(userId);
  //       if (!response) return null;
  //       const activityRecords = response.filter((record) => {
  //         const recordDate = dayjs(record.createdAt).format("YYYY-MM-DD");
  //         return recordDate === endDate;
  //       });

  //       TODO: get the daily data associated with the activities (findFirst)
  //       TODO: for each activity, get the samples for that activity, and then get the metadata
  //       TODO: return the metadata for each activity in a data structure
  //     } catch (err) {
  //       console.log(
  //         "ERROR WITH GETTING THE METADATA FOR ACTIVITIES ON A SPECIFIC DAY: ",
  //         err
  //       );
  //       return "There was an error getting the metadata for activities on a specific day.";
  //     }
  //   }
  // );

  ////
  // EXPORT FUNCTIONS AND DEFINITIONS
  ////

  return {
    functions: {
      getAverageTimeAboveLimitWhenCrashesOccur,
    },
    definitions: {
      getAverageTimeAboveLimitWhenCrashesOccurDefinition,
    },
  };
}
