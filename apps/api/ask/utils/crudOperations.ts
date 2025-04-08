import { Prisma, db } from "@pathize/db";

export async function getLimit(userId: string) {
  try {
    const limitResponse = await db.userTarget.findMany({
      where: {
        userId: userId,
      },
      select: {
        target: true,
        targetName: true,
      },
    });

    // Assume it exists
    const limit = Number(limitResponse[0].target);
    return limit;
  } catch (err) {
    return null;
  }
}

export async function getSymptomRecords(userId: string) {
  try {
    const response = await db.symptomRecord.findMany({
      where: {
        userId: userId,
      },
    });

    return response;
  } catch (err) {
    return null;
  }
}

export async function getActivityRecords(userId: string) {
  try {
    const response = await db.activityRecord.findMany({
      where: {
        userId: userId,
      },
    });

    return response;
  } catch (err) {
    return null;
  }
}

export async function getCrashRecords(userId: string) {
  try {
    const response = await db.crash.findMany({
      where: {
        userId: userId,
      },
    });

    return response;
  } catch (err) {
    return null;
  }
}

export async function getDailyData(userId: string) {
  try {
    const response = await db.dailyData.findMany({
      where: {
        userId: userId,
      },
      select: {
        heartRateSamples: true,
        date: true,
      },
    });

    return response;
  } catch (err) {
    return null;
  }
}

export async function getMedicationRecords(userId: string) {
  try {
    const response = await db.medicationRecord.findMany({
      where: {
        userId: userId,
      },
    });

    return response;
  } catch (err) {
    return null;
  }
}

export function removeDailyDataDuplicates(
  dailyData: {
    date: string;
    heartRateSamples: Prisma.JsonValue;
  }[]
): { date: string; heartRateSamples: Prisma.JsonValue }[] {
  return Array.from(
    dailyData
      .reduce((map, obj) => {
        const existingObj = map.get(obj.date);
        if (!existingObj) {
          map.set(obj.date, obj);
        } else {
          if (
            obj.heartRateSamples &&
            (!existingObj.heartRateSamples ||
              JSON.parse(obj.heartRateSamples as string).length >
                existingObj.heartRateSamples.length)
          ) {
            map.set(obj.date, obj);
          }
        }
        return map;
      }, new Map())
      .values()
  ).sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
}
