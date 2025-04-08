import { FunctionDefinition } from "openai/resources";
import dayjs from "dayjs";

import { QueryFunction } from "../types";
import { createRecordQueryFunction } from "./functionBuilders";
import {
  convertMinutesToHoursAndMinutes,
  getActivityRecords,
  getCrashRecords,
  getDailyData,
  getLimit,
  getMedicationRecords,
  getSymptomRecords,
  removeDailyDataDuplicates,
} from "../utils";
import { HeartRateDataSample } from "terra-api/lib/cjs/models/samples/HeartRateDataSample";
import { getTimeAboveLimit } from "@pathize/lib";

export async function getRecordFunctions(): Promise<{
  functions: Record<string, QueryFunction>;
  definitions: Record<string, FunctionDefinition>;
}> {
  // GET SYMPTOM RECORDS BY DAY
  const {
    queryFunction: getSymptomRecordsByDay,
    definition: getSymptomRecordsByDayDefinition,
  } = await createRecordQueryFunction(
    "getSymptomRecordsByDay",
    "Get the list of symptoms recorded by a patient on a given day. ",
    "symptom records",
    async ({ userId, endDate }) => {
      try {
        const response = await getSymptomRecords(userId);
        if (!response) return null;
        const symptomRecords = response.filter((record) => {
          const recordDate = dayjs(record.createdAt).format("YYYY-MM-DD");
          return recordDate === endDate;
        });

        return symptomRecords;
      } catch (err) {
        return `Unable to get the patients' symptom records for the given date, please call with different parameters.`;
      }
    }
  );

  // GET ALL OF THE SYMPTOM RECORDS THAT A PATIENT HAS EVER RECORDED
  const {
    queryFunction: getAllSymptomRecords,
    definition: getAllSymptomRecordsDefinition,
  } = await createRecordQueryFunction(
    "getAllSymptomRecords",
    "Get the list of all symptoms recorded by a patient. This function is only useful if the patient is looking for historical records, or symptoms recorded over a long period of time. If they are looking for individual days, then getSymptomRecordsByDay is more useful.",
    "symptom records",
    async ({ userId }) => {
      try {
        const response = await getSymptomRecords(userId);
        return response;
      } catch (err) {
        return `Unable to get the patients' symptom records, please call with different parameters.`;
      }
    }
  );

  // GET MOST POPULAR SYMPTOMS RECORDED
  const {
    queryFunction: getMostFrequentlyRecordedSymptoms,
    definition: getMostFrequentlyRecordedSymptomsDefinition,
  } = await createRecordQueryFunction(
    "getMostFrequentlyRecordedSymptoms",
    "Get the most recorded symptoms by a patient. These are all of the symptoms that the patient has recorded throughout their time using Pathize.",
    "most popular symptoms",
    async ({ userId }) => {
      try {
        const response = await getSymptomRecords(userId);
        if (!response) return null;
        const symptomCounts: Record<string, number> = response.reduce(
          (acc: Record<string, number>, record) => {
            if (acc[record.name]) {
              acc[record.name]++;
            } else {
              acc[record.name] = 1;
            }
            return acc;
          },
          {}
        );

        const result = Object.entries(symptomCounts).map(
          ([symptom, timesRecorded]) => ({
            symptom,
            timesRecorded,
          })
        );

        return result;
      } catch (err) {
        return `Unable to get the patients' most recorded symptoms, please call with different parameters.`;
      }
    }
  );

  // GET THE SYMPTOM BURDEN FOR ANY GIVEN DAY
  const {
    queryFunction: getSymptomBurdenForDay,
    definition: getSymptomBurdenForDayDefinition,
  } = await createRecordQueryFunction(
    "getSymptomBurdenForDay",
    "Get the symptom burden for a given day. This function returns the sum of the severities of all symptoms recorded on a given day. This is useful if the patient is asking about their symptom burden, or how bad their symptoms have been, for a given day.",
    "symptom burden",
    async ({ userId, endDate }) => {
      try {
        const response = await getSymptomRecords(userId);
        if (!response) return null;
        const symptomBurden = response.reduce((acc, record) => {
          const recordDate = dayjs(record.createdAt).format("YYYY-MM-DD");
          if (recordDate === endDate) {
            acc += record.severity ? record.severity : 0;
          }
          return acc;
        }, 0);

        return symptomBurden;
      } catch (err) {
        return `Unable to get the patients' symptom burden for the given date, please call with different parameters.`;
      }
    }
  );

  // GET MOST POPULAR SYMPTOMS BY OVERALL BURDEN
  const {
    queryFunction: getMostPopularSymptomsByOverallBurden,
    definition: getMostPopularSymptomsByOverallBurdenDefinition,
  } = await createRecordQueryFunction(
    "getMostPopularSymptomsByOverallBurden",
    "Get the most recorded symptoms by a patient by overall burden. These are all of the symptoms that the patient has recorded throughout their time using Pathize. Specifically, these are the symptoms that the patient has cumulatively said are the most severe.",
    "most popular symptoms",
    async ({ userId }) => {
      try {
        const response = await getSymptomRecords(userId);
        if (!response) return null;
        const symptomCounts: Record<string, number> = response.reduce(
          (acc: Record<string, number>, record) => {
            if (acc[record.name]) {
              acc[record.name] += record.severity ? record.severity : 0;
            } else {
              acc[record.name] = record.severity ? record.severity : 0;
            }
            return acc;
          },
          {}
        );

        const result = Object.entries(symptomCounts).map(
          ([symptom, burden]) => ({
            symptom,
            burden,
          })
        );

        return result;
      } catch (err) {
        return `Unable to get the patients' most burdensome symptoms, please call with different parameters.`;
      }
    }
  );

  ////
  // ACTIVITIES
  ////

  // GET ACTIVITY RECORDS BY DAY
  const {
    queryFunction: getActivityRecordsByDay,
    definition: getActivityRecordsByDayDefinition,
  } = await createRecordQueryFunction(
    "getActivityRecordsByDay",
    "Get the list of activities recorded by a patient on a given day. ",
    "activity records",
    async ({ userId, endDate }) => {
      try {
        const response = await getActivityRecords(userId);
        if (!response) return null;
        const activityRecords = response.filter((record) => {
          const recordDate = dayjs(record.createdAt).format("YYYY-MM-DD");
          return recordDate === endDate;
        });

        return activityRecords;
      } catch (err) {
        return `Unable to get the patients' activity records for the given date, please call with different parameters.`;
      }
    }
  );

  // GET ALL TIME ACTIVITY RECORDS
  const {
    queryFunction: getAllActivityRecords,
    definition: getAllActivityRecordsDefinition,
  } = await createRecordQueryFunction(
    "getAllActivityRecords",
    "Get the list of all activities recorded by a patient. This function is only useful if the patient is looking for historical records, or activities recorded over a long period of time. If they are looking for individual days, then getActivityRecordsByDay is more useful.",
    "activity records",
    async ({ userId }) => {
      try {
        const response = await getActivityRecords(userId);
        return response;
      } catch (err) {
        return `Unable to get the patients' activity records, please call with different parameters.`;
      }
    }
  );

  // GET MOST POPULAR ACTIVITIES RECORDED
  const {
    queryFunction: getMostPopularActivities,
    definition: getMostPopularActivitiesDefinition,
  } = await createRecordQueryFunction(
    "getMostPopularActivities",
    "Get the list of the top recorded activities by a patient. These are all of the activities that the patient has recorded throughout their time using Pathize.",
    "most popular activities",
    async ({ userId }) => {
      try {
        const response = await getActivityRecords(userId);
        if (!response) return null;
        const activityCounts: Record<string, number> = response.reduce(
          (acc: Record<string, number>, record) => {
            if (acc[record.activityName]) {
              acc[record.activityName]++;
            } else {
              acc[record.activityName] = 1;
            }
            return acc;
          },
          {}
        );

        const result = Object.entries(activityCounts).map(
          ([activity, timesRecorded]) => ({
            activity,
            timesRecorded,
          })
        );

        return result;
      } catch (err) {
        return `Unable to get the patients' most popular activities, please call with different parameters.`;
      }
    }
  );

  // GET THE ACTIVITIES THAT ACCOUNT FOR THE MOST TIME ABOVE LIMIT
  // this function returns the top five activities that account for the most time above someone's heart rate limit
  const {
    queryFunction: getActivitiesThatAccountForMostTimeAboveLimit,
    definition: getActivitiesThatAccountForMostTimeAboveLimitDefinition,
  } = await createRecordQueryFunction(
    "getActivitiesThatAccountForMostTimeAboveLimit",
    "Get the activities that have accounted for the most time above limit. This function returns the activities that have led to the most physical exertion based on being recorded.",
    "activities that account for most time above limit",
    async ({ userId }) => {
      try {
        const activitiesResponse = await getActivityRecords(userId);
        const dailyDataResponse = await getDailyData(userId);
        const limit = await getLimit(userId);
        if (!activitiesResponse) return null;
        if (!dailyDataResponse) return null;
        if (!limit) return null;
        // if there are duplicate daily data entries for a single day, remove them
        const dailyData = removeDailyDataDuplicates(dailyDataResponse);

        // now, for each daily data entry, see if we have activities that were recorded on the same day
        // if we did, we can determine the startTime of the activity by createdAt, and the endTime by adding the "time" field, which is in minutes
        // we then take the subset of dailyData that is between the startTime and endTime, and calculate timeAboveLimit
        // we then add that to the growing Record<string, number> that we are using to track the time above limit for each activity
        // we then sort the Record<string, number> by value, and return the top five
        const timeAboveLimitForActivities: Record<string, number> = {};
        const timeABoveLimitForActivitiesString: Record<string, string> = {};
        const activityCounts: Record<string, number> = {};
        for (const activity of activitiesResponse) {
          const endTime = dayjs(activity.createdAt);
          const startTime = endTime.subtract(
            Number(activity.activityTotalTime),
            "minute"
          );

          const dailyDataForActivity = dailyData.filter((data) => {
            const entryTime = dayjs(data.date);
            const activityCreatedAt = dayjs(activity.createdAt).startOf("day");
            return entryTime.isSame(activityCreatedAt);
          });

          for (const entry of dailyDataForActivity) {
            if (entry.heartRateSamples) {
              // get the samples that cover this activity only
              const samplesSubset = (
                JSON.parse(
                  entry.heartRateSamples as string
                ) as HeartRateDataSample[]
              ).filter((sample) => {
                const sampleTime = dayjs(sample.timestamp);
                return (
                  sampleTime.isAfter(startTime) && sampleTime.isBefore(endTime)
                );
              });

              // get the time above limit for that activity
              const timeAboveLimitOfActivity = getTimeAboveLimit(
                samplesSubset,
                limit
              );

              // either add or accumulate the time above limit for this activity
              if (timeAboveLimitForActivities[activity.activityName]) {
                timeAboveLimitForActivities[activity.activityName] +=
                  timeAboveLimitOfActivity;
                activityCounts[activity.activityName]++;
              } else {
                timeAboveLimitForActivities[activity.activityName] =
                  timeAboveLimitOfActivity;
                activityCounts[activity.activityName] = 1;
              }
            }
          }
        }

        // Calculate the average time above limit for each activity
        for (const activity in timeAboveLimitForActivities) {
          timeAboveLimitForActivities[activity] = Math.trunc(
            timeAboveLimitForActivities[activity] / activityCounts[activity]
          );
        }

        // Sort by timeAboveLimit and get the top five
        const result = Object.entries(timeAboveLimitForActivities)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([activity, timeAboveLimit]) => ({
            activity,
            timeAboveLimit,
          }));

        // map to strings
        for (const activity of result) {
          timeABoveLimitForActivitiesString[activity.activity] =
            convertMinutesToHoursAndMinutes(activity.timeAboveLimit);
        }

        const finalResult = Object.entries(
          timeABoveLimitForActivitiesString
        ).map(([activity, timeAboveLimit]) => ({
          activity,
          timeAboveLimit,
        }));

        return finalResult;
      } catch (err) {
        return `Unable to get the patients' most popular activities, please call with different parameters.`;
      }
    }
  );

  ////
  // MEDICATIONS
  ////

  // GET MEDICATIONS TAKEN ON A GIVEN DAY
  const {
    queryFunction: getMedicationsTakenOnDay,
    definition: getMedicationsTakenOnDayDefinition,
  } = await createRecordQueryFunction(
    "getMedicationsTakenOnDay",
    "Get the list of medications taken by a patient on a given day. ",
    "medication records",
    async ({ userId, endDate }) => {
      try {
        const response = await getMedicationRecords(userId);
        if (!response) return null;
        const medicationRecords = response.filter((record) => {
          const recordDate = dayjs(record.createdAt).format("YYYY-MM-DD");
          return recordDate === endDate;
        });

        return medicationRecords;
      } catch (err) {
        return `Unable to get the patients' medication records for the given date, please call with different parameters.`;
      }
    }
  );

  // GET ALL OF THE MEDICATION RECORDS A USER HAS TAKEN

  const {
    queryFunction: getAllMedicationRecords,
    definition: getAllMedicationRecordsDefinition,
  } = await createRecordQueryFunction(
    "getAllMedicationRecords",
    "Get the list of all medications taken by a patient. This function is only useful if the patient is looking for historical records, or medications recorded over a long period of time. If they are looking for individual days, then getMedicationsTakenOnDay is more useful.",
    "medication records",
    async ({ userId }) => {
      try {
        const response = await getMedicationRecords(userId);
        return response;
      } catch (err) {
        return `Unable to get the patients' medication records, please call with different parameters.`;
      }
    }
  );

  ////
  // CRASH RECORDS
  ////

  // GET THE TOTAL NUMBER OF CRASH RECORDS FOR A GIVEN DAY
  const {
    queryFunction: getTotalNumberOfCrashesForDay,
    definition: getTotalNumberOfCrashesForDayDefinition,
  } = await createRecordQueryFunction(
    "getTotalNumberOfCrashesForDay",
    "Get the total number of crashes recorded for a given day. This function is useful if the patient is asking about the number of crashes they have had on a given day.",
    "total number of crashes",
    async ({ userId, endDate }) => {
      try {
        const response = await getCrashRecords(userId);
        if (!response) return null;
        const crashes = response.filter((record) => {
          const recordDate = dayjs(record.createdAt).format("YYYY-MM-DD");
          return recordDate === endDate;
        });

        return crashes;
      } catch (err) {
        return `Unable to get the patients' total number of crashes for the given date, please call with different parameters.`;
      }
    }
  );

  // GET ALL OF THE CRASH RECORDS RECORDED BY THE PATIENT
  const {
    queryFunction: getAllCrashRecords,
    definition: getAllCrashRecordsDefinition,
  } = await createRecordQueryFunction(
    "getAllCrashRecords",
    "Get the total number of crashes recorded by a patient. This function is useful if the patient is asking about the number of crashes they have had overall.",
    "total number of crashes",
    async ({ userId }) => {
      try {
        const response = await getCrashRecords(userId);
        return response;
      } catch (err) {
        return `Unable to get the patients' total number of crashes, please call with different parameters.`;
      }
    }
  );

  // GET THE CUMULATIVE CRASH SEVERITY/BURDEN FOR A GIVEN DAY
  const {
    queryFunction: getCrashBurdenForDay,
    definition: getCrashBurdenForDayDefinition,
  } = await createRecordQueryFunction(
    "getCrashBurdenForDay",
    "Get the total crash burden/severity for a given day. This function is useful if the patient is asking about the total severity or burden of their crashes on a given day.",
    "cumulative crash severity",
    async ({ userId, endDate }) => {
      try {
        const response = await getCrashRecords(userId);
        if (!response) return null;
        const crashes = response.filter((record) => {
          const recordDate = dayjs(record.createdAt).format("YYYY-MM-DD");
          return recordDate === endDate;
        });

        const severity = crashes.reduce((acc, crash) => {
          acc += crash.severity ? crash.severity : 0;
          return acc;
        }, 0);

        return severity;
      } catch (err) {
        return `Unable to get the patients' cumulative crash severity for the given date, please call with different parameters.`;
      }
    }
  );

  ////
  // EXPORT FUNCTIONS AND DEFINITIONS
  ////

  return {
    functions: {
      // symptoms
      getSymptomRecordsByDay,
      getAllSymptomRecords,
      getSymptomBurdenForDay,
      getMostFrequentlyRecordedSymptoms,
      getMostPopularSymptomsByOverallBurden,
      // activities
      getActivityRecordsByDay,
      getAllActivityRecords,
      getMostPopularActivities,
      getActivitiesThatAccountForMostTimeAboveLimit,
      // medications
      getMedicationsTakenOnDay,
      getAllMedicationRecords,
      // crashes
      getTotalNumberOfCrashesForDay,
      getAllCrashRecords,
      getCrashBurdenForDay,
    },
    definitions: {
      // symptoms
      getSymptomRecordsByDayDefinition,
      getAllSymptomRecordsDefinition,
      getSymptomBurdenForDayDefinition,
      getMostFrequentlyRecordedSymptomsDefinition,
      getMostPopularSymptomsByOverallBurdenDefinition,
      // activities
      getActivityRecordsByDayDefinition,
      getAllActivityRecordsDefinition,
      getMostPopularActivitiesDefinition,
      getActivitiesThatAccountForMostTimeAboveLimitDefinition,
      // medications
      getMedicationsTakenOnDayDefinition,
      getAllMedicationRecordsDefinition,
      // crashes
      getTotalNumberOfCrashesForDayDefinition,
      getAllCrashRecordsDefinition,
      getCrashBurdenForDayDefinition,
    },
  };
}
