export type Illness =
  | "Long COVID"
  | "ME/CFS"
  | "POTS"
  | "None/Prefer not to say";

export type IllnessWithDate = {
  name: Illness;
  dateOfOnset: string | null;
};

export type Gender = "Man" | "Woman" | "Non-binary" | "Prefer not to say";

export type ClinicalSurvey = {
  medicalProblemsHavePreventedMeFromAccomplishingGoals: number;
  completelyOverwhelmedByMedicalProblems: number;
  levelOfPain: number;
  levelOfEnergy: number;
  qualityOfSleep: number;
  levelOfMemoryProblems: number;
};

export type OnboardingInformation = {
  firstName: string;
  // clinicalSurveyResponse: ClinicalSurvey;
  emailNotifications: boolean;
  termsAndConditions: boolean;
  dateOfBirth: string;
  // gender: Gender | null;
  illness: IllnessWithDate[] | null;
  phoneNumber: string | null;
  // dateOfInfection: Date | null;
};
