import {
  CheckInComplete,
  UserActivity,
  UserMedication,
  UserSymptom,
} from '@pathize/db';
import {DropdownItem} from '../components/elements';
import {sortAlphabetically, sortByCreatedAt, sortByDateModified} from '.';

export function getSortedItems(
  items: (UserActivity | UserMedication | UserSymptom | CheckInComplete)[],
  selectedDropdownItem: DropdownItem | null,
) {
  if (!selectedDropdownItem) return items;
  switch (selectedDropdownItem.id) {
    case '1':
      return sortByCreatedAt(items, 'newToOld');
    case '2':
      return sortByCreatedAt(items, 'oldToNew');
    case '3':
      return sortByDateModified(items);
    case '4':
      return sortAlphabetically(items);
    default:
      return sortByCreatedAt(items, 'newToOld');
  }
}
