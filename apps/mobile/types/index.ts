import {ActivityRecord, MedicationRecord, SymptomRecord} from '@pathize/db';
import {SymptomTrendsResponse, TrendsResponse} from '@pathize/api';
import {Categories} from '../contexts';

// SERVICES

/**
 * @description service response object
 */
export type ServiceObjectMessage<T = Record<string, unknown>> = {
  success: boolean;
  error?: string;
  data?: T;
};

export type ServiceArrayMessage<T = Record<string, unknown>> = {
  success: boolean;
  error?: string;
  data?: Array<T>;
};

// AUTH CONTEXT PAYLOAD TYPE
export type DispatchPayload = {
  type:
    | 'REFRESH_ACCESS_TOKEN'
    | 'SIGNED_OUT'
    | 'REGISTERED_NO_SUBSCRIPTION'
    | 'REGISTERED_RENEWING_SUBSCRIPTION'
    | 'REGISTERED_WITH_SUBSCRIPTION';
  accessToken?: string | undefined;
  userId?: string | undefined;
  refreshToken?: string | undefined;
};

// RECORDS
export type RecordType = 'activity' | 'medication' | 'symptom';

export type TypeOfRecord<T> = T extends 'activity'
  ? ActivityRecord
  : T extends 'medication'
    ? MedicationRecord
    : SymptomRecord;

// TRENDS
export type ChartConfig = {
  id: string;
  type: string;
  category: Omit<Categories, 'Crashes'>;
  name: string;
  getY: (point: TrendsResponse | SymptomTrendsResponse) => number;
  getX: (point: TrendsResponse | SymptomTrendsResponse) => string;
  maxValue: number;
  minValue: number;
  yAxisModifier: (value: number) => string;
  yAxisModifierNoUnit: (value: number) => string;
  nullCutoff: number;
};

// COMPONENTS

export type MultiSelectListItem = {
  id: string;
  name: string;
  displayName?: string;
};
