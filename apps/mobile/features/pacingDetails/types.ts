export type PacingStatsListProps = {
  id: string;
  name: string;
  stat?: number;
  percentage?: number;
  convertMinutes?: boolean;
};

export type PacingDetailsStatsListProps = {
  id: string;
  name: string;
  stat?: number;
  percentage?: number;
  convertMinutes?: boolean;
  // header and subheader
  statHeader?: string;
  statSubheader?: string;
};
