import {
  CheckInComplete,
  UserActivity,
  UserMedication,
  UserSymptom,
} from '@pathize/db';
import dayjs from 'dayjs';

export function sortByDateModified(
  items: (UserActivity | UserMedication | UserSymptom | CheckInComplete)[],
): (UserActivity | UserMedication | UserSymptom | CheckInComplete)[] {
  // Filter out items with non-null updatedAt and sort them
  const nonNullItems = items
    .filter(item => item.updatedAt !== null)
    .sort((a, b) => (dayjs(b.updatedAt).isAfter(dayjs(a.updatedAt)) ? 1 : -1));

  // Filter out items with null updatedAt
  const nullItems = items.filter(item => item.updatedAt === null);

  // Append null items at the end
  return [...nonNullItems, ...nullItems];
}
