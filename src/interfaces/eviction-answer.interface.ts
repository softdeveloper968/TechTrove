
export interface IEvictionAnswerItems {
   isDefendant: boolean;
   isNotDefendant: boolean;
   noRelationship: boolean;
   noNotice: boolean;
   wrongTermination: boolean;
   noRent: boolean;
   refusedRent: boolean;
   refusedRentCost: boolean;
   failedRepair: boolean;
   noEntitled: boolean;
   noMoney: boolean;
   otherAnswer: boolean;
   otherAnswerText: string;
   counterclaim: boolean;
   counterclaimAmount: number;
   counterclaimReason: string;
   failedRepairProperty: boolean;
   repairValueReduction: number;
   reductionMonths: number;
   repairCostCheck: boolean;
   repairCost: number;
   damageAmountCheck: boolean;
   damageAmount: number;
   otherCounterclaim: boolean;
   otherCounterclaimText: string;
   signature: string;
   email: string;
   phone: string;
   defendantName: string;
   caseNo: string;
   pdfUrl: string;
   disposId?: string;
};

export interface IEvictionAnswerCaseInfo {
   county: string;
}
