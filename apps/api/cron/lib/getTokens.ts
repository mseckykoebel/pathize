import admin from "firebase-admin";
import { FcmToken, db } from "@pathize/db";

async function deleteToken(token: FcmToken) {
  try {
    const response = await db.fcmToken.deleteMany({
      where: {
        id: token.id,
      },
    });

    console.log("DELETE TOKEN RESPONSE: ", response);
  } catch (err) {
    console.log(err);
  }
}

async function isTokenValid(token: FcmToken): Promise<boolean> {
  const message = {
    token: token.token,
    data: {
      test: "test",
    },
  };

  try {
    await admin.messaging().send(message);
    return true; // If it reaches here, the token is valid
  } catch (err) {
    if (
      err instanceof Error &&
      "code" in err &&
      err.code === "messaging/registration-token-not-registered"
    ) {
      console.log("token not registered, deleting");
      await deleteToken(token); // bonus logic that deletes this token if it is not valid
      return false;
    }

    return false; // something else happened but do not delete
  }
}

export async function getTokens(userId: string) {
  try {
    const tokens = await db.fcmToken.findMany({ where: { userId: userId } });

    if (tokens.length === 0) return null;

    const validTokens = await Promise.all(
      tokens.map(async (t) => ({
        ...t,
        isValid: await isTokenValid(t),
      }))
    );

    const validTokenList = validTokens
      .filter((t) => t.isValid)
      .map((t) => t.token);

    return validTokenList.length > 0 ? validTokenList : null;
  } catch (error) {
    console.log(error);
    return null;
  }
}
