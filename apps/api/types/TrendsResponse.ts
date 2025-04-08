export type TrendsResponse = Record<
  string,
  {
    value: number | null;
    category: "Sleep" | "Activity" | "Heart";
  }
> & {
  date: string;
};
