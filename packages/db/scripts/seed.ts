import { ActivityDb, MedicationDb, SymptomDb, db } from "../index";

// data
import { medicationsDb } from "../snapshots/medicationsDb";
import { symptomsDb } from "../snapshots/symptomsDb";
import { activityDb } from "../snapshots/activitiesDb";

async function seed() {
  // seed medications
  for (const medication of medicationsDb) {
    await db.medicationDb.upsert({
      where: { medicationId: medication.id },
      update: {},
      create: {
        medicationId: medication.id,
        medicationName: medication.name,
      } as MedicationDb,
    });
  }

  // seed symptoms
  for (const symptom of symptomsDb) {
    await db.symptomDb.upsert({
      where: { symptomId: symptom.id },
      update: {},
      create: {
        symptomId: symptom.id,
        symptomName: symptom.name,
        symptomCategory: symptom.category,
        symptomDescription: symptom.description,
      } as SymptomDb,
    });
  }

  // seed activities
  for (const activity of activityDb) {
    await db.activityDb.upsert({
      where: { activityId: activity.id },
      update: {},
      create: {
        activityId: activity.id,
        activityName: activity.name,
        activityCategory: activity.category,
      } as ActivityDb,
    });
  }
}

seed()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
