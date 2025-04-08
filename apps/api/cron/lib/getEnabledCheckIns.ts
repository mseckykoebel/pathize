import { db } from "@pathize/db";

export async function getEnabledCheckIns(timezone?: boolean) {
  const rawCheckIns = await db.checkIn.findMany({
    where: {
      notificationsEnabled: true,
    },
    select: {
      time: true, // time field from the checkIn
      name: true,
      id: true,
      user: {
        select: {
          id: true,
          ...(timezone && { timezone: true }),
        },
      },
    },
  });

  return rawCheckIns;
}
