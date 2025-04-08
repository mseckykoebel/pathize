import { CheckIn, CheckInMedication, CheckInSymptom } from "@prisma/client";

export type CheckInComplete = CheckIn & {
  medications: CheckInMedication[];
  symptoms: CheckInSymptom[];
};
