import { db } from "@pathize/db";

export async function getValueAndTokens(
  userId: string,
  option: "MAXHR" | "MINHR",
) {
  const [notifications, tokens] = await Promise.all([
    db.notification.findMany({ where: { userId: userId } }),
    db.fcmToken.findMany({ where: { userId: userId } }),
  ]);

  if (notifications.length === 0 || tokens.length === 0) return null;

  // Extract necessary values
  const hrValue = notifications.find((n) => n.option === option);
  if (!hrValue || !hrValue.value || !hrValue.enabled) return null;

  const extractedTokens = tokens.map((token) => token.token);

  return {
    hrValue: hrValue.value,
    extractedTokens,
  };
}
