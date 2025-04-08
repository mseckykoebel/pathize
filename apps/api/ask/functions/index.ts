// functions
import { getDailyFunctions } from "./dailyFunctions";
import { getInsightFunctions } from "./insightFunctions";
import { getRecordFunctions } from "./recordFunctions";
import { getSleepFunctions } from "./sleepFunctions";

export async function getFunctions() {
  const { functions: dailyFunctions } = await getDailyFunctions();
  const { functions: insightFunctions } = await getInsightFunctions();
  const { functions: recordFunctions } = await getRecordFunctions();
  const { functions: sleepFunctions } = await getSleepFunctions();

  return {
    functions: {
      ...dailyFunctions,
      ...insightFunctions,
      ...recordFunctions,
      ...sleepFunctions,
    },
  };
}

export async function getDefinitions() {
  const { definitions: dailyDefinitions } = await getDailyFunctions();
  const { definitions: insightDefinitions } = await getInsightFunctions();
  const { definitions: recordDefinitions } = await getRecordFunctions();
  const { definitions: sleepDefinitions } = await getSleepFunctions();

  return {
    definitions: {
      ...dailyDefinitions,
      ...insightDefinitions,
      ...recordDefinitions,
      ...sleepDefinitions,
    },
  };
}
