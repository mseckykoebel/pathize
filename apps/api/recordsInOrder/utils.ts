/* eslint-disable indent */
import {
  SymptomRecord,
  ActivityRecord,
  MedicationRecord,
  db,
  Prisma,
  UserActivity,
  UserMedication,
  UserSymptom,
} from "@pathize/db";

type RecordType = "activity" | "medication" | "symptom";

// FOR RECORDS
type FindRecordsSearchProps<T> = T extends "activity"
  ? Prisma.ActivityRecordFindManyArgs
  : T extends "medication"
  ? Prisma.MedicationRecordFindManyArgs
  : Prisma.SymptomRecordFindManyArgs;

type TypeOfRecord<T> = T extends "activity"
  ? ActivityRecord
  : T extends "medication"
  ? MedicationRecord
  : SymptomRecord;

// FOR USER RECORDS
type FindUserRecordsSearchProps<T> = T extends "activity"
  ? Prisma.UserActivityFindManyArgs
  : T extends "medication"
  ? Prisma.UserMedicationFindManyArgs
  : Prisma.UserSymptomFindManyArgs;

type TypeOfUserRecord<T> = T extends "activity"
  ? UserActivity
  : T extends "medication"
  ? UserMedication
  : UserSymptom;

function getUniqueRecordId<T extends RecordType>(
  record: TypeOfRecord<T>,
  type: T
): string {
  switch (type) {
    case "activity":
      return (record as ActivityRecord).userActivityId as string;
    case "medication":
      return (record as MedicationRecord).userMedicationId as string;
    case "symptom":
      return (record as SymptomRecord).userSymptomId as string;
    default:
      throw new Error("Invalid record type provided");
  }
}

async function findRecords(
  recordType: RecordType,
  findOptions?: FindRecordsSearchProps<typeof recordType>
): Promise<ActivityRecord[] | MedicationRecord[] | SymptomRecord[]> {
  switch (recordType) {
    case "activity":
      return await db.activityRecord.findMany(
        findOptions as Prisma.ActivityRecordFindManyArgs
      );
    case "medication":
      return await db.medicationRecord.findMany(
        findOptions as Prisma.MedicationRecordFindManyArgs
      );
    case "symptom":
      return await db.symptomRecord.findMany(
        findOptions as Prisma.SymptomRecordFindManyArgs
      );
    default:
      throw new Error("Invalid record type provided");
  }
}

async function findUserRecords(
  recordType: RecordType,
  findOptions?: FindUserRecordsSearchProps<typeof recordType>
): Promise<UserActivity[] | UserMedication[] | UserSymptom[]> {
  switch (recordType) {
    case "activity":
      return await db.userActivity.findMany(
        findOptions as Prisma.UserActivityFindManyArgs
      );
    case "medication":
      return await db.userMedication.findMany(
        findOptions as Prisma.UserMedicationFindManyArgs
      );
    case "symptom":
      return await db.userSymptom.findMany(
        findOptions as Prisma.UserSymptomFindManyArgs
      );
    default:
      throw new Error("Invalid record type provided");
  }
}

export type {
  RecordType,
  TypeOfRecord,
  FindRecordsSearchProps,
  TypeOfUserRecord,
  FindUserRecordsSearchProps,
};
export { getUniqueRecordId, findRecords, findUserRecords };
