import { IFileEvictionsItems } from "./file-evictions.interface";

// Base interface for common properties in late notices
export interface ILateNoticesBase {
  id?: string;
  address?: string;
  city: string;
  unit: string;
  state: string;
  noticePeriod: number;
  property: string;
}

// Interface for late notices items with additional properties
export interface ILateNoticesItems extends ILateNoticesBase {
  isChecked: boolean;
  zip: string;
  rentDue: number;
  otherFees: string;
  deliveredBy: string;
  noticeDeliveredToName: string;
  deliveryDate: Date;
  serviceMethod: string;
  lateFeesDate: Date;
  lateFees: number;
  noticeAffiant: string;
  noticeDate?: Date;
  totalDue: number;
  noticePDFs?: string;
  documents?: Document[];
  tenantNames?: [{ firstName: string; lastName: string; middleName: string }];
  noticeTotalDue?:string,
  noticeDefaultStartDate?:Date,
  noticeDefaultEndDate?:Date,
  noticeLastPaidDate?:Date,
  noticeLastPaidAmount?:number,
  noticeCurrentRentDue?:number,
  noticePastRentDue?:number,
  noticeLateFees?:number,
  noticeDeliveryDate?:Date,
  noticeServerId?:string,
  monthlyRent?:number,
  county?:string,
  noticeConfirmationDate?:Date,
  noticeServerSignature?:string,
  status?:string,
}
export interface ITenant {
  firstName: string;
  lastName: string;
  middleName: string;
}
// Interface for creating a late notice
export interface ICreateLateNotice extends ILateNoticesBase {
  zip: string;
  rentDue: number;
  otherFees: string;
  lateFeesDate: Date;
  lateFees: number;
  noticeAffiantSignature: string;
  addAllOtherTenant: boolean;
  tenants?: ITenant[];
}

export interface IManualCreateLateNotice {
  tenant1LastName: string;
  tenant1FirstName: string;
  tenant1MiddleName: string;
  tenant2LastName: string;
  tenant2FirstName: string;
  tenant2MiddleName: string;
  tenant3LastName: string;
  tenant3FirstName: string;
  tenant3MiddleName: string;
  tenant4LastName: string;
  tenant4FirstName: string;
  tenant4MiddleName: string;
  tenant5LastName: string;
  tenant5FirstName: string;
  tenant5MiddleName: string;
}
export type DynamicTenantKeys = {
  [K in keyof IManualCreateLateNotice]: K extends
    | `tenant${number}FirstName`
    | `tenant${number}MiddleName`
    | `tenant${number}LastName`
    ? string
    : never;
};

export interface ILateNoticeImportCsv {
  firstName: string | null;
  lastName: string | null;
  street: string | null;
  address: string | null;
  city: string | null;
  unit: number;
  state: string | null;
  property: string | null;
  zip: string;
  rentDue: number;
  otherFees: number;
  lateFeesDate: Date;
  lateFees: number;
  noticePeriod: number;
  noticeAffiantSignature: string;
  totalDue: number;
  totalRent: number;
}
// Interface for late notices with pagination
export interface ILateNotices {
  items: ILateNoticesItems[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  isConfirmed:boolean;
  searchParam?: string;
  filingType?:boolean|null;
  status?:number;
}

// Interface for removing tenant notice
export interface IRemoveTenantNotice {
  tenantNoticeIDs: string[];
}

// Interface for late notice email
export interface ILateNoticeEmail {
  dispoIds: string[];
}

// Interface for late notice sign-in proofs
export interface ILateNoticeSignInProofs extends ILateNoticesItems {
  methodOfDelivery: string;
  notes: string;
  signature: string;
}

// Interface for row-level error messages
export interface IRowErrorMessages {
  rowIndex: string;
  [key: string]: string | undefined;
}

// Interface for late notice sign proof
export interface ILateNotice_SignProof {
  signature: string;
  signatureDate: Date;
  methodId: number;
  dispoIds: string[];
  deliveredTo: string;
}

// Interface for creating late notice email
export interface ILateNotice_CreateNoticeEmail {
  combinedPDFUrl: string;
}

// Interface for late notice buttons
export interface ILateNoticesButton {
  title: string;
  icon: string;
  classes: string;
}
export interface ISelectOptions {
  id: number | string;
  value: string;
  disabled?: boolean;
}
export interface ISearchSelectOptions {
  value: string;
  label: string;
}
export interface ISendNoticeEmail {
  combinedPdfUrl: string;
  unsignedNotice?:boolean;
  propertyNames?:string[];
  userEmails?: string[];  
}

export interface ISendNoticeExportEmail {
  // url: string;
  // propertyNames?:string[];
  userEmails?: string[];  
  allSelectedIDs: string[];
  tabName: string;
}
export interface INVEvictionExportEmail {
  allSelectedIDs: string[];
  isConfirmed: boolean;
}
export interface IResponse {
  data: string;
  errors: null;
  message: string;
  operationSuccess: boolean;
  statusCode: number;
}

export interface IConfirmDelinquenciesQueue {
  items: IFileEvictionsItems[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  isViewAll:boolean;
  searchParam?: string;
  methodName?: string;
  filingType?:boolean|null;
};

export interface IConfirmDelinquenciesImportItems {
  county: string;
  tenantNames: ITenant[];
  andAllOtherTenants: string;
  tenantAddress: string;
  TenantUnit: string;
  tenantCity: string;
  tenantState: string;
  TenantZip: string;
  reason: string;
  evictionTotalRentDue: string;
  MonthlyRent: number;
  allMonths: string;
  evictionOtherFees: string;
  ownerName: string;
  propertyName: string;
  PropertyPhone: string;
  propertyEmail: string;
  propertyAddress: string;
  propertyCity: string;
  propertyState: string;
  PropertyZip: string;
  attorneyName: string;
  AttorneyBarNo: string;
  attorneyEmail: string;
  filerBusinessName: string;
  evictionAffiantIs: string;
  FilerPhone: string;
  filerEmail: string;
  processServer: string;
  processServerEmail: string;
  expedited: string;
  stateCourt: string;
  ClientReferenceId: string;
  processServerCompany: string;
  // crmName?:string;
  // ownerId?:string;
  // propertyId?:string;
  unitId?:string;
  pullTime?:string;
  batchId?:string;
  companyName?:string;
  isSigned?:boolean;
  balanceDate?:string;
  currentBalance?:string;
  caseNo?:string;
  NoticeDeliveryDate?:string,
  NoticeTotalDue?:number,
  NoticeDefaultStartDate?:string,
  NoticeDefaultEndDate?:string,
  NoticeLastPaidDate?:string,
  NoticeLastPaidAmount?:number,
  NoticeCurrentRentDue?:number,
  NoticePastRentDue?:number,
  NoticeServerID?:string,
  NoticeLateFees?:number,
  ClientId: string;
  NoticeLateFeeDate?:string,
};

export interface ILateNotice_SignProofInfo { 
  methodId: number;
  dispoIds: string[];
  deliveredTo: string|null;
  deliveryDate:Date|null;
  signature:string;
}