import { db } from "@pathize/db";

export async function getLimitAndTokens(userId: string, option: "HR_LIMIT") {
  try {
    const [notifications, targets, tokens] = await Promise.all([
      db.notification.findMany({ where: { userId: userId } }),
      db.userTarget.findMany({ where: { userId: userId } }),
      db.fcmToken.findMany({ where: { userId: userId } }),
    ]);
    if (
      notifications.length === 0 ||
      targets.length === 0 ||
      tokens.length === 0
    )
      return null;

    // Extract necessary values
    const target = targets.find((target) => target.targetName === "BASELINE");
    if (!target || !target.target) return null;
    const isAvailableAndEnabled = notifications.find(
      (n) => n.option === option,
    );
    if (!isAvailableAndEnabled || !isAvailableAndEnabled.enabled) return null;

    const extractedTokens = tokens.map((token) => token.token);

    return {
      limit: Number(target.target),
      extractedTokens,
    };
  } catch (error) {
    console.log(error);
    return null;
  }
}
