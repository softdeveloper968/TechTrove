import { string } from "yup";

export interface UnsignedDispoResource {
  id: string;
  validAddress: boolean | null;
  clientId: string | null;
  userId: string | null;
  clientRefNo: string | null;
  source: string | null;
  etag: string | null;
  crmInfoId: string | null;
  efileId: string | null;
  fieldsId: string | null;
  unsignedDisposRootobjectId: string | null;
  noticeCreated: boolean | null;
  crmInfo: UnsignedDisposCrmInfoResource | null;
  efile: UnsignedDisposEfileResource | null;
  fields: UnsignedDisposFieldResource | null;
}

export interface ExportAllNoticesResource {
  Status: string;
  PropertyName?: string;
  County?: string;
  TenantOne?: string;
  TenantAddressCombined?: string;
  NoticeConfirmationDate?: Date;
  NoticeDeliveryDate?: Date;
  NoticeDeliveryMethod?: string;
  NoticeServerSignature?: string;
  MonthlyRent?: number;
  NoticeTotalDue?: number;
  NoticeDefaultStartDate?: Date;
  NoticeDefaultEndDate?: Date;
  NoticeLastPaidDate?: Date;
  NoticeLastPaidAmount?: number;
  NoticeCurrentRentDue?: number;
  NoticePastRentDue?: number;
  NoticeServerId?: string;
  NoticeCount?: number;
  PreviousNotices: string;
  Company: string;
}

export interface ExportNVEvictionsResource {
  PropertyName?: string;
  County?: string;
  TenantOne?: string;
  TenantAddressCombined?: string;
  NoticeConfirmationDate?: Date;
  NoticeDeliveryDate?: Date;
  NoticeDeliveryMethod?: string;
  NoticeServerSignature?: string;
  MonthlyRent?: number;
  NoticeTotalDue?: number;
  NoticeDefaultStartDate?: Date;
  NoticeDefaultEndDate?: Date;
  NoticeLastPaidDate?: Date;
  NoticeLastPaidAmount?: number;
  NoticeCurrentRentDue?: number;
  NoticePastRentDue?: number;
  NoticeServerId?: string;
  NoticeCount?: number;
  PreviousNotices?: string;
}


export interface ExportAllCasesResource {
  Status: string;
  StatusDescription: string;
  CaseNo: string;
  PropertyName: string;
  County: string;
  TenantOne: string;
  TenantAddressCombined: string;
  AttorneyName: string;
  AttorneyBarNo: string;
  evictionDateFiled: Date ;
  evictionServiceDate: Date ;
  evictionLastDayToAnswer: Date;
  EvictionServiceMethod: string;
  Expedited: string;
  answerDate: Date ;
  courtDate: Date ;
  writFiledDate: Date ;
  dismissalFileDate: Date ;
  clientReferenceId: string;
  issueDate: Date;
  EvictionAffiantSignature: string;
  writApplicantDate: Date ;
  caseCreatedDate: Date ;
  NoticeCount: number;
  EvictionCount: number;
  EvictionAutomation: string;
}

export interface WritsExportResource{
 County: string;
  CaseNo: string;
  PropertyName_Vs_Tenants: string;
  TenantAddressCombined: string;
  PropertyName: string;
  WritLaborName: string;
  writFiledDate: Date | string | null;
  WritAffiantSignature:string;
}

export interface DismissalsExportResource{
  County: string;
   CaseNo: string;
   PropertyName_Vs_Tenants: string;
   TenantAddressCombined: string;
   PropertyName: string;
   dismissalFiledDate: Date | null;
  DismissalAffiantSignature: string;
EvictionAffiantSignature: string;
DismissalReason: string;
EvictionAutomation: string;
 }

 export interface DismissalsPendingExportResource{
   CaseNo: string;
   TenantOne: string;
   TenantAddressCombined: string;
   PropertyName: string;
   balanceDate?: string;
   EvictionTotalRentDue: string;
   CurrentBalance: string;
   CompanyName: string;

 }

 export interface ExportAmendmentsResponse {
  County: string;
  tenant1Last: string;
  tenant1First: string;
  tenant1MI: string;
  AndAllOtherOccupants: string;
  TenantAddress: string;
  TenantUnit: string;
  TenantCity: string;
  TenantState: string;
  TenantZip: string;
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
  EvictionReason: string;
  EvictionTotalRentDue: string;
  MonthlyRent: string;
  AllMonths: string;
  EvictionOtherFees: string;
  OwnerName: string;
  PropertyName: string;
  PropertyPhone: string;
  PropertyEmail: string;
  PropertyAddress: string;
  PropertyCity: string;
  PropertyState: string;
  PropertyZip: string;
  AttorneyName: string;
  AttorneyBarNo: string;
  AttorneyEmail: string;
  FilerBusinessName: string;
  EvictionAffiantIs: string;
  EvictionFilerPhone: string;
  EvictionFilerEmail: string;
  Expedited: string;
  StateCourt: string;
  CaseNo: string;
  PropertyName_Vs_Tenants: string;
  TenantAddressCombined: string;
  amendmentFiledDate: Date | null;
  AmendmentAffiantSignature: string;
  EvictionAffiantSignature: string;
}


interface UnsignedDisposCrmInfoResource {
  id: string;
  crmName: string | null;
  ownerId: string | null;
  propertyId: string | null;
  unitId: string | null;
  pullTime: string | null;
  batchId: string | null;
}

interface UnsignedDisposEfileResource {
  id: string;
  courtId: string | null;
  county: string | null;
  courtType: string | null;
  courtTypeName: string | null;
  envelopeId: number | null;
  submitDate: string | null;
  caseNumber: string | null;
  issueDate: string | null;
}

interface UnsignedDisposFieldResource {
  id: string;
  timeStamp: string;
  propertyInfoId: string | null;
  tenantInfoId: string | null;
  filingId: string | null;
  filerId: string | null;
  serviceRequestId: string | null;
  approvalId: string | null;
  signingId: string | null;
  noticeId: string | null;
  answerId: string | null;
  evictionId: string | null;
  createdById: string | null;
  modifiedById: string | null;
  answer: UnsignedDisposAnswerResource | null;
  approval: UnsignedDisposApprovalResource | null;
  changeTrackings: ChangeTrackingResource[];
  createdBy: ChangeTrackingResource | null;
  eviction: UnsignedDisposEvictionResource | null;
  filer: UnsignedDisposFilerResource | null;
  filing: UnsignedDisposFilingResource | null;
  modifiedBy: ChangeTrackingResource | null;
  notice: UnsignedDisposNoticeResource | null;
  propertyInfo: UnsignedDisposPropertyInfoResource | null;
  serviceRequest: UnsignedDisposServicerequestResource | null;
  signing: UnsignedDisposSigningResource | null;
  tenantInfo: UnsignedDisposTenantinfoResource | null;
}

interface UnsignedDisposRootobjectResource {
  id: string;
  odatacontext: string | null;
  unsignedDispos: UnsignedDispoResource[];
}

interface UnsignedDisposAnswerResource {
  id: string;
  name: string | null;
  email: string | null;
  signature: string | null;
  date: string | null;
}

interface UnsignedDisposApprovalResource {
  id: string;
  approvalDate: string | null;
  userId: string | null;
  name: string | null;
}

interface ChangeTrackingResource {
  id: string;
  userId: string | null;
  userName: string | null;
  clientId: string | null;
  dateSaved: string | null;
  version: string | null;
  unsignedDisposFieldsId: string | null;
  unsignedDisposFieldCreatedBies: UnsignedDisposFieldResource[];
  unsignedDisposFieldModifiedBies: UnsignedDisposFieldResource[];
}

interface UnsignedDisposEvictionResource {
  id: string;
  scheduled: string | null;
  dateJudgeSignedWrit: string | null;
}

interface UnsignedDisposFilerResource {
  id: string;
  filerId: string | null;
  filerBusinessName: string | null;
  filerEmail: string | null;
  filerPhone: string | null;
}

interface UnsignedDisposFilingResource {
  id: string;
  addtlFees: string | null;
  allMonths: string | null;
  reason: string | null;
  monthlyRent: number | null;
  totalRent: number | null;
  clientId: string | null;
  clientRefNo: string | null;
}

interface UnsignedDisposNoticeResource {
  id: string;
  created: string | null;
  delivered: string | null;
  method: string | null;
  required: boolean | null;
  signatureId: string | null;
  answerId: string | null;
  noticePeriod: number | null;
  lateFeeDate: string | null;
  lateFees: number | null;
  answer: UnsignedDisposAnswerResource | null;
  signature: UnsignedDispoSignatureResource | null;
}

interface UnsignedDisposPropertyInfoResource {
  id: string;
  propertyId: string | null;
  propertyName: string | null;
  propertyPhone: string | null;
  propertyEmail: string | null;
  addressId: string | null;
  attorneyId: string | null;
  address: UnsignedDisposAddressResource | null;
  attorney: UnsignedDisposAttorneyResource | null;
  unsignedDisposOwners: UnsignedDisposOwnerResource[];
}

interface UnsignedDisposServicerequestResource {
  id: string;
  expedited: string | null;
  personalService: boolean | null;
  personalServiceNotes: string | null;
  specialInstructions: string | null;
}

interface UnsignedDisposOwnerResource {
  id: string;
  isEntity: boolean;
  entityName: string | null;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  suffix: string | null;
  email: string | null;
  phone: string | null;
  unsignedDisposPropertyInfoId: string | null;
  unsignedDisposPropertyInfo: UnsignedDisposPropertyInfoResource | null;
}

interface UnsignedDisposSigningResource {
  id: string;
  affiantIs: string | null;
  affiantSignature: string | null;
  affiantSignDate: string | null;
  signature: string | null;
  name: string | null;
  userId: string | null;
  pdfTemplateId: string | null;
}

interface UnsignedDisposTenantinfoResource {
  id: string;
  unitId: string | null;
  andAllOthers: boolean | null;
  andAllOthersText: string | null;
  addressId: string | null;
  address: UnsignedDisposTenantAddressResource | null;
  unsignedDisposTenantnames: UnsignedDisposTenantnameResource[];
}

interface UnsignedDisposTenantnameResource {
  id: string;
  isEntity: boolean | null;
  entityName: string | null;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  suffix: string | null;
  email: string | null;
  phone: string | null;
  activeDuty: boolean | null;
  unsignedDisposTenantinfoId: string | null;
}

interface UnsignedDispoSignatureResource {
  id: string;
  date: string | null;
  name: string | null;
  signature: string | null;
  userId: string | null;
  pdfTemplateId: string | null;
}

interface UnsignedDisposAddressResource {
  id: string;
  propertyStreet1: string | null;
  propertyStreet2: string | null;
  propertyCity: string | null;
  propertyState: string | null;
  propertyZipCode: string | null;
}

interface UnsignedDisposAttorneyResource {
  id: string;
  attorneyBarNo: string | null;
  attorneyName: string | null;
  attorneyEmail: string | null;
}

interface UnsignedDisposTenantAddressResource {
  id: string;
  tenantStreet: string | null;
  tenantUnit: string | null;
  tenantCity: string | null;
  tenantState: string | null;
  tenantZipCode: string | null;
  uspsverified: boolean | null;
}
