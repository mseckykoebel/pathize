export type SearchResponse<T> = {
  status: number;
  message?: string;
  data?: T[];
};

export type SymptomCategory =
  | "Sleep"
  | "Respiratory"
  | "Gastrointestinal"
  | "Physical"
  | "Pain"
  | "Orthostatic"
  | "Neurological"
  | "Immune"
  | "Endocrine"
  | "Other";

export type Symptom = {
  id: string;
  name: string;
  category: SymptomCategory; // same as icon
  description: string;
};

export type Activity = {
  id: string;
  name: string;
  icon: string;
};

// medications all use the same icon, so not specifying it here
export type Medication = {
  medicationId: string;
  medicationName: string;
};
