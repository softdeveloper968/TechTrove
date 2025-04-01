import { string } from "yup";
import { SortingOption } from "./common.interface";

export interface IEvictionQueueButton {
  title: string;
  icon: string;
  classes: string;
}

export interface IEvictionQueuesItem {
  id: number
  name: string;
  status: boolean;
}

export interface IEvictionQueues {
  items: IEvictionQueuesItem[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  searchParam?: string;
}

export interface IEvictionQueueTaskItem {
  id: string
  dispoId: string;
  name: string;
  status: string;
  disabled: boolean;
  address:string;
  zip:string;
  state:string;
  city:string;
  unit:string;
  tenantNames: ITenant[];
  envelopeID?:string;
  envelopeIdHistory?:string;
  caseNumber:string;
  evictionPaymentMethod:string;
  paymentAccount?:string
  methodName:string;
  eFileMethod?:string;
  evictionDateFiled: Date | string|null;
  evictionAffiantSignDate: Date | string|null;
  evictionCourtAmount:string;
  isTransactionFeeChanged:boolean;
  actionType?:number;
  county: string;
  dateFiled: Date | string | null;
  evictionServiceDate: Date | string  | null;
  answerBy: Date | string  | null;
  answerDate: Date | string  | null;
  courtDate: Date | string  | null;
  adminNotes: string | null;
  createdDate?:Date|null;
  timeStamp?:Date|null;
  attorneyBarNo: string;
}

export interface IEvictionQueueTasks {
  items: IEvictionQueueTaskItem[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  actiontype:number;
  status:number;
  searchParam?: string;
  county?:string;
  company?:string;
  sortings: SortingOption[];
}
export interface ITenant {
  id: string;
  firstName: string;
  lastName: string;
  middleName: string;
  isMilitaryStatusUploaded: boolean;
  militaryStatusDocURL: string;
};

export interface IManualFilingCaseExportModel {
   actionType: string;
   caseNo: string;
   caseReferenceId: string;
   processServerEmail: string;
   expedited: string;
   county: string;
   stateCourt: string;
   tenant1Last: string;
   tenant1First: string;
   tenant1MI: string;
   andAllOtherOccupants: string;
   tenantAddress: string;
   tenantUnit: string;
   tenantCity: string;
   tenantState: string;
   tenantZip: string;
   tenant2Last: string;
   tenant2First: string;
   tenant2MI: string;
   tenant3Last: string;
   tenant3First: string;
   tenant3MI: string;
   tenant4Last: string;
   tenant4First: string;
   tenant4MI: string;
   tenant5Last: string;
   tenant5First: string;
   tenant5MI: string;
   evictionReason: string;
   evictionTotalRentDue: string;
   monthlyRent: string;
   allMonths: string;
   evictionOtherFees: string;
   ownerName: string;
   propertyName: string;
   propertyPhone: string;
   propertyEmail: string;
   propertyAddress: string;
   propertyCity: string;
   propertyState: string;
   propertyZip: string;
   attorneyName: string;
   attorneyBarNo: string;
   attorneyEmail: string;
   evictionAffiantSignature: string;
   evictionAffiantSignDate: string;
   evictionAffiantIs: string;
   evictionFilerEmail: string;
   paymentMethod: string;
   dateFiled: string;
   eFileMethod: string;
   courtTransAmt: string;
   adminNotes: string;
   createdDate: string;
}

export interface IDeleteTaskCase {
   taskIds: string[],
   deleteFromAllCases: boolean;
}