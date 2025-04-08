import { $Enums, db } from "@pathize/db";

export async function getNotifications(
  userIdsEnabled: string[],
  options: { option: $Enums.NotificationOption }[],
  timezone?: boolean
) {
  const rawNotifications = await db.notification.findMany({
    where: {
      OR: options,
      enabled: true,
      userId: {
        in: userIdsEnabled,
      },
    },
    select: {
      user: {
        select: {
          id: true,
          ...(timezone && { timezone: true }),
        },
      },
      option: true,
      time: true,
    },
  });

  return rawNotifications;
}
