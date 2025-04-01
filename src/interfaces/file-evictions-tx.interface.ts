import { IFileEvictionsBase, ITenant } from "./file-evictions.interface";

export interface IFileEvictionTXImportCsv {
  id?: string;
  County: string;
  Court: string;
  Tenant1Last: string;
  Tenant1First: string;
  Tenant1MI: string;
  Tenant1Phone:string;
  Tenant1Email:string;
  AndAllOtherOccupants: string;
  TenantAddress: string;
  TenantUnit: string;
  TenantCity: string;
  TenantState?: string;
  TenantZip: string;
  Tenant2Last: string;
  Tenant2First: string;
  Tenant2MI: string;
  Tenant2Phone:string;
  Tenant2Email:string;
  Tenant3Last: string;
  Tenant3First: string;
  Tenant3MI: string;
  Tenant3Phone:string;
  Tenant3Email:string;
  Tenant4Last: string;
  Tenant4First: string;
  Tenant4MI: string;
  Tenant4Phone:string;
  Tenant4Email:string;
  Tenant5Last: string;
  Tenant5First: string;
  Tenant5MI: string;
  Tenant5Phone:string;
  Tenant5Email:string;
  PropertyName: string;
  PropertyPhone: string;
  PropertyEmail: string;
  PropertyAddress: string;
  PropertyCity: string;
  PropertyState: string;
  PropertyZip: string;
  AttorneyName: string;
  AttorneyBarNo:string;
  FilerBusinessName: string;
  EvictionFilerEMail: string;
  ClientReferenceId: string;
  CourtesyCopies: string;
  ClientId?: string;
  Attachments: UploadedDocuments[],
}

export interface UploadedDocuments {
  uri?: string;
  pdfData?: string;
  id?: string;
  fileName?: string;
  type?:string;
}

export interface IFileEvictionsTXItems {
  isChecked?: boolean;
  id?: string;
  county: string;
  court:string;
  stateCourt: string;
  tenantNames: ITenant[];
  andAllOtherTenants: string;
  tenantAddress: string;
  tenantUnit: string;
  tenantCity: string;
  tenantState: string;
  tenantZip: string;
  propertyName: string;
  propertyPhone: string;
  propertyEmail: string;
  propertyAddress: string;
  propertyCity: string;
  propertyState: string;
  propertyZip: string;
  attorneyName: string;
  attorneyBarNo: string;
  filerBusinessName: string;
  filerEmail: string;
  clientReferenceId: string;
  clientId: string;
  caseNo?: string;
  courtesyCopies: string;
  attachments: UploadedDocuments[],
  tenant1Phone?:string;
  tenant1Email?:string;
  tenant2Phone:string;
  tenant2Email:string;
  tenant3Phone:string;
  tenant3Email:string;
  tenant4Phone:string;
  tenant4Email:string;
  tenant5Phone:string;
  tenant5Email:string;
  crmName?:string;
  ownerId?:string;
  propertyId?:string;
  unitId?:string;
  pullTime?:string;
  batchId?:string;
  companyName?:string;
}
export interface IFileEvictionsTX {
  items: IFileEvictionsTXItems[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  isViewAll?: boolean;
  searchParam?: string;
  evictionPdfLink: string;
  clientId?: string;
}
export interface IFileEvictionTXButtons {
  title: string;
  icon: string;
  classes: string;
};
