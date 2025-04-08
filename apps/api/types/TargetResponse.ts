import { Target } from "@pathize/db";

export type TargetResponse = {
  status: number;
  message?: string;
  data?: Target | Target[];
};
