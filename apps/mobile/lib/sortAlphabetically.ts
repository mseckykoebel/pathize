import {
  CheckInComplete,
  UserActivity,
  UserMedication,
  UserSymptom,
} from '@pathize/db';

export function sortAlphabetically(
  items: (UserActivity | UserMedication | UserSymptom | CheckInComplete)[],
): (UserActivity | UserMedication | UserSymptom | CheckInComplete)[] {
  // sort alphabetically by activityName or medicationName. medicationName will exist.
  const sorted = items.sort((a, b) => {
    const aName =
      'activityName' in a
        ? a.activityName
        : 'symptomId' in a
          ? a.name
          : 'medicationName' in a
            ? a.medicationName!
            : a.name; // check-in is fallback here
    const bName =
      'activityName' in b
        ? b.activityName
        : 'symptomId' in b
          ? b.name
          : 'medicationName' in b
            ? b.medicationName!
            : b.name; // check-in is fallback here
    return aName!.toLowerCase().localeCompare(bName!.toLowerCase());
  });

  return sorted;
}
