// Base interface for common properties
export interface IFileEvictionsBase {
  isChecked?: boolean;
  id?: string;
}

// Interface for items displayed in the file evictions screen
export interface IFileEvictionsItems extends IFileEvictionsBase {
  county: string;
  tenantNames: ITenant[];
  andAllOtherTenants: string;
  tenantAddress: string;
  tenantUnit: string;
  tenantCity: string;
  tenantState: string;
  tenantZip: string;
  reason: string;
  evictionTotalRentDue: string;
  monthlyRent: number;
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
  filerBusinessName: string;
  evictionAffiantIs: string;
  filerPhone: string;
  filerEmail: string;
  processServer: string;
  processServerEmail: string;
  expedited: string;
  stateCourt: string;
  clientReferenceId: string;
  clientId: string;
  processServerCompany: string;
  crmName?:string;
  ownerId?:string;
  propertyId?:string;
  unitId?:string;
  pullTime?:string;
  batchId?:string;
  companyName?:string;
  isSigned?:boolean;
  balanceDate?:string;
  currentBalance?:string;
  caseNo?:string;
  noticeDeliveryDate?:string,
  noticeTotalDue?:number,
  noticeDefaultStartDate?:string,
  noticeDefaultEndDate?:string,
  noticeLastPaidDate?:string,
  noticeLastPaidAmount?:number,
  noticeCurrentRentDue?:number,
  noticePastRentDue?:number,
  noticeLateFees?:number,
  noticeServerID?:string,
};

export interface ITenant {
  firstName: string;
  lastName: string;
  middleName: string;
  phone?:string;
  email?:string;
}
// Interface for creating a file eviction
export interface ICreateFileEviction extends IFileEvictionsItems {
  // Additional properties specific to creating a file eviction

  tenants?: ITenant[];
}
export interface IManualCreateFileEviction {
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
  [K in keyof IManualCreateFileEviction]: K extends
    | `tenant${number}FirstName`
    | `tenant${number}MiddleName`
    | `tenant${number}LastName`
    ? string
    : never;
};

// Interface for removing tenant file evictions
export interface IRemoveTenantFileEviction {
  tenantFileEvictionIDs: string[];
}

// Interface for a button related to file evictions
export interface IFileEvictionsButton {
  title: string;
  icon: string;
  classes: string;
}

// Interface for file evictions along with pagination
export interface IFileEvictions extends IFileEvictionsBase {
  items: IFileEvictionsItems[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  isViewAll?:boolean;
  searchParam?: string;
  evictionPdfLink: string;
  clientId?:string;
  companyId?:string;
}

export interface IFileEvictionImportCsv {
  id?: string;
  County: string;
  Tenant1Last: string;
  Tenant1First: string;
  Tenant1MI: string;
  Tenant2Last: string;
  Tenant2First: string;
  Tenant2MI: string;
  Tenant3Last: string;
  Tenant3First: string;
  Tenant3MI: string;
  Tenant4Last: string;
  Tenant4First: string;
  Tenant4MI: string;
  Tenant5Last: string;
  Tenant5First: string;
  Tenant5MI: string;
  AndAllOtherOccupants: string;
  TenantAddress: string;
  TenantUnit: string;
  TenantCity: string;
  TenantState?: string;
  TenantZip: string;
  EvictionReason: string;
  EvictionTotalRentDue: string;
  MonthlyRent: number;
  AllMonths: string;
  EvictionOtherFees: string;
  OwnerName: string;
  PropertyCode:string;
  PropertyName: string;
  PropertyPhone: string;
  PropertyEmail: string;
  PropertyAddress: string;
  PropertyCity: string;
  PropertyState: string;
  PropertyZip: string;
  AttorneyName: string;
  // BarNo: string;
  AttorneyBarNo: string;
  AttorneyEmail: string;
  FilerBusinessName: string;
  EvictionAffiantIs: string;
  EvictionFilerPhone: string;
  EvictionFilerEMail: string;
  ProcessServer: string;
  ProcessServerEmail: string;
  Expedited: string;
  StateCourt: string;
  ClientReferenceId: string;
  ProcessServerCompany: string;
  ClientId: string;
}
export interface IFileEvictionSign {
  sign: string;
  evictionIds: string[];
}

// // Interface for creating late notice email
// export interface IFileEvictionPdfLink {
//   combinedPDFUrl: string;
// }

// Interface for File Eviction email
export interface IFileEvictionEmail {
  dispoIds: string[];
}

// Interface for creating file eviction email
export interface IFileEviction_CreateFileEvcitionEmail {
  combinedPDFUrl: string;
}

export interface ISendFileEvictionEmail {
  combinedPdfUrl: string;
  dispoIds?: string[];
  userEmails?: string[];
}

export interface IResponse {
  data: string;
  errors: null;
  message: string;
  operationSuccess: boolean;
  statusCode: number;
}

export interface ITenant{
  firstName: string;
  lastName: string;
  middleName: string;
}