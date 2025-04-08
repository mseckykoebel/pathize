import { Prisma, PrismaClient } from "@prisma/client";
import { encryptMiddleware } from "./middleware/encryption";

import type { JWTError, JWTExpiredError } from "./types/error";
import type { AccessToken, AccessTokenAndRefreshToken } from "./types/tokens";
import type { DeleteAction } from "./types/delete";
import type {
  OnboardingInformation,
  Illness,
  Gender,
} from "./types/onboardingInformation";
import type { DailyDataResponse } from "./types/dailyDataResponse";
import type { PacingMetadataResponse } from "./types/pacingMetadataResponse";
import type { SymptomCategory } from "./types/symptomCategory";
import type { MedicationFromDb } from "types/medicationFromDb";
import type { ClinicalSurvey } from "./types/onboardingInformation";
import type { IllnessWithDate } from "./types/onboardingInformation";
import type { CheckInComplete } from "./types/checkIns";

const db = new PrismaClient();

(async () => {
  db.$use(await encryptMiddleware());
})();

// Named export of the PrismaClient instance, db, and all types
export {
  db,
  Prisma,
  JWTError,
  JWTExpiredError,
  AccessToken,
  AccessTokenAndRefreshToken,
  DeleteAction,
  OnboardingInformation,
  Illness,
  Gender,
  DailyDataResponse,
  PacingMetadataResponse,
  SymptomCategory,
  MedicationFromDb,
  ClinicalSurvey,
  IllnessWithDate,
  CheckInComplete,
};

// Everything else
export * from "@prisma/client";
