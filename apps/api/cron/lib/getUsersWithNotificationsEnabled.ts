import { db } from "@pathize/db";

export async function getUsersWithNotificationsEnabled() {
  const rawUsers = await db.user.findMany({
    where: {
      UserPreference: {
        some: {
          notificationsEnabled: true,
        },
      },
    },
    select: {
      id: true,
      UserPreference: {
        select: {
          notificationsEnabled: true,
        },
      },
    },
  });

  // Transform the result to ensure each user has only one preference
  const users = rawUsers.map((user) => ({
    id: user.id,
    preferences: user.UserPreference[0], // considering each user has exactly one UserPreference
  }));

  return users;
}
