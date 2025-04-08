import { db } from "@pathize/db";

export async function generateCode() {
  try {
    const referralCodeRecords = await db.referralCode.findMany();
    const allCodes: string[] = referralCodeRecords.map(
      (referralCodeRecord) => referralCodeRecord.code
    );

    let newCode = generateRandomCode();

    // Check if the generated code already exists, and regenerate if it does
    while (allCodes.includes(newCode)) {
      newCode = generateRandomCode();
    }

    return newCode;
  } catch (err) {
    throw new Error("Issue getting current codes");
  }
}

function generateRandomCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
