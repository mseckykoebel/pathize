import dayjs from "dayjs";
import { db, Crash } from "@pathize/db";
import { removeDuplicateCrashes } from "@pathize/lib";

/**
 * @description - can the user get energy notifications based on the number of crashes they have recorded?
 */
export async function userCanReceiveEnergyNotifications(userId: string) {
  // get all of the crashes the user has ever recorded
  try {
    const allCrashes = await db.crash.findMany({
      where: {
        userId,
      },
    });

    if (allCrashes.length === 0) return false;
    const filteredCrashes = removeDuplicateCrashes(allCrashes as Crash[]);
    // return false if over the last 30 days there are less than 3 recorded crashes. use dayjs to determine this.
    const thirtyDaysAgo = dayjs().subtract(30, "day");
    const crashesInLastThirtyDays = filteredCrashes.filter((crash) => {
      return dayjs(crash.createdAt).isAfter(thirtyDaysAgo);
    });

    if (crashesInLastThirtyDays.length < 3) return false;

    // now get the user's energy guidance number
    const energyBudget = await db.userTarget.findFirst({
      where: {
        userId,
        targetName: "ENERGY_BUDGET",
      },
    });

    if (!energyBudget || Number(energyBudget?.target) === 0) {
      console.log("User has no energy budget!!!!");
      return false;
    }
    return true;
  } catch (err) {
    console.log("Error getting crashes for user: ", err);
    return false;
  }
}
