export type EnergyGuidanceDetailsStatsListProps = {
  id: string;
  name: string;
  stat?: number | undefined; // if the stat is available
  minValue?: number | undefined;
  maxValue?: number | undefined;
  percentage?: number | undefined; // percentage of the historical value -> how close to the historical average
  // option flags
  convertMinutes?: boolean;
  useZeroAsMin?: boolean;
  // header
  statSubheader?: string;
  statHeader?: string;
};
