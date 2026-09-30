// src/features/utilities/types/utility.types.ts

export type UtilityType = 'WATER' | 'ELECTRICITY' | 'GAS' | 'PARKING';
export type UtilityRateStatus = 'ACTIVE' | 'INACTIVE';

export interface UtilityRate {
  id: number;
  utilityType: UtilityType;
  ratePerUnit: number;
  unitOfMeasure: string; // e.g. "m3", "kWh"
  status: UtilityRateStatus;
  effectiveDate: string;
}

export interface CreateUtilityRateRequest {
  utilityType: UtilityType;
  ratePerUnit: number;
  unitOfMeasure: string;
}

export interface UtilityCharge {
  id: number;
  unitId: string;
  utilityType: UtilityType;
  billingYear: number;
  billingMonth: number;
  usageValue: number;
  ratePerUnit: number;
  calculatedAmount: number;
  recordedAt: string;
  recordedBy: string;
}

export interface CreateUtilityChargeRequest {
  unitId: string;
  utilityType: UtilityType;
  billingYear: number;
  billingMonth: number;
  usageValue: number;
}