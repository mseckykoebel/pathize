export function getPriorityFromNumber(priority: number): string {
  switch (priority) {
    case 0:
      return 'Lowest priority';
    case 1:
      return 'Low priority';
    case 2:
      return 'Medium-low priority';
    case 3:
      return 'Medium priority';
    case 4:
      return 'High priority';
    case 5:
      return 'Highest priority';
    default:
      return 'Unknown' as never;
  }
}
