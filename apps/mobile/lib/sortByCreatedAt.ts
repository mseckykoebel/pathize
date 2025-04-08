import {
  CheckInComplete,
  UserActivity,
  UserMedication,
  UserSymptom,
} from '@pathize/db';
import dayjs from 'dayjs';

export function sortByCreatedAt(
  items: (UserActivity | UserMedication | UserSymptom | CheckInComplete)[],
  order: 'oldToNew' | 'newToOld',
): (UserActivity | UserMedication | UserSymptom | CheckInComplete)[] {
  const sorted = items.sort((a, b) => {
    if (order === 'newToOld') {
      return dayjs(a.createdAt).isBefore(dayjs(b.createdAt)) ? 1 : -1;
    } else {
      return dayjs(a.createdAt).isBefore(dayjs(b.createdAt)) ? -1 : 1;
    }
  });
  return sorted;
}
