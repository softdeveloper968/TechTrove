import { ICrmInfo } from "./all-cases.interface";

// Root Object Interface
export interface IRootCaseInfo {
   id: string;
   dispoId: string;
   validAddress: string | null;
   clientId: string;
   userId: string;
   clientRefNo: string | null;
   source: string;
   etag: string | null;
   crmInfoId: string;
   efileId: string;
   fieldsId: string;
   unsignedDisposRootobjectId: string | null;
   noticeCreated: string | null;
   crmInfo: ICRMInfo;
   efile: IEFile;
   fields: IFields;
   attachments: IAttachment[];
   _etag: string | null;
   isDismissal: boolean | null;
   isAmendment: boolean | null;
   amendmentId: string | null;
   unsignedDismissalId: string | null;
   unsignedDismissal: IUnsignedDismissal;
   amendment: IAmendment;
   isWrit: boolean | null;
   unsignedWritId: string | null;
   unsignedWrit: IUnsignedWrit;
   status: string;
   client: IClient;
   isSendEmail: boolean;
   serverEmail: string | null;
   processServerCompany: any | null;
   serviceDateHistory: string;
}

export interface IAttachment {
   id: string;
   filingId: string | null;
   attachmentId: string | null;
   url: string;
   type: string;
   filename: string;
   unsignedDisposId: string;
   filedDate?: string;
   createdDate?: Date | string | null;
}

export interface ICRMInfo {
   id: string;
   crmName: string | null;
   ownerId: string | null;
   propertyId: string | null;
   unitId: string | null;
   pullTime: string | null;
   batchId: string | null;
   isCrmRecord: boolean;
}

export interface IEFile {
   id: string;
   courtId: string | null;
   county: string;
   courtType: string | null;
   courtTypeName: string | null;
   envelopeId: string | null;
   submitDate: string | null;
   caseNumber: string;
   courtName: string;
   caseReferenceId: number;
   transactionFee: string | null;
   issueDate: string | null;
}

export interface IFields {
   id: string;
   timeStamp: string;
   propertyInfoId: string;
   tenantInfoId: string;
   filingId: string;
   filerId: string;
   serviceRequestId: string;
   approvalId: string | null;
   signingId: string;
   noticeId: string | null;
   answerId: string | null;
   evictionId: string;
   createdById: string | null;
   modifiedById: string | null;
   answer: any | null;
   approval: any | null;
   changeTrackings: any[];
   createdBy: any | null;
   eviction: IEviction;
   filer: IFiler;
   filing: IFiling;
   modifiedBy: any | null;
   notice: any | null;
   propertyInfo: IPropertyInfo;
   serviceRequest: IServiceRequest;
   signing: ISigning;
   tenantInfo: ITenantInfo;
}

export interface IEviction {
   id: string;
   scheduled: string | null;
   dateJudgeSignedWrit: string | null;
   dateFiled: string | null;
   serviceDate: string | null;
   lastDayToAnswer: string | null;
   serviceMethod: string | null;
   affiantSignature: string | null;
   courtDate: string | null;
   dismissalFileDate: string | null;
   writFileDate: string | null;
   totalRentDue: string;
   evictionServerName: string | null;
   evictionServedToName: string | null;
   evictionServedToHeight: string | null;
   evictionServedToWeight: string | null;
   evictionServedToAge: string | null;
   serverNote: string | null;
   evictionDateScanned: string | null;
   serverIssuesRemarks: string | null;
   serverSignDate: string | null;
   aOSDateFiled: string | null;
   // aOSApplicantDate: string | null;
   
aosApplicantDate: string | null;
}

export interface IFiler {
   id: string;
   filerId: string | null;
   filerBusinessName: string;
   filerEmail: string;
   filerPhone: string;
}

export interface IFiling {
   id: string;
   addtlFees: string | null;
   allMonths: string;
   reason: string;
   monthlyRent: number;
   totalRent: string | null;
   otherFee: string;
   clientId: string | null;
   clientReferenceId: string | null;
}

export interface IPropertyInfo {
   id: string;
   propertyId: string | null;
   propertyName: string;
   propertyPhone: string;
   propertyEmail: string;
   addressId: string;
   attorneyId: string;
   ownerName: string;
   address: IAddress;
   attorney: IAttorney;
}

export interface IAddress {
   id: string;
   street1: string;
   propertyStreet2: string | null;
   city: string;
   state: string;
   propertyZipCode: string;
}
export interface ITenantAddress {
   id: string;
   tenantStreet: string;
   tenantUnit: string,
   tenantCity: string;
   tenantState: string;
   tenantZipCode: string;
}

export interface IAttorney {
   id: string;
   attorneyBarNo: string;
   attorneyName: string;
   attorneyEmail: string;
}

export interface IServiceRequest {
   id: string;
   expedited: string;
   personalService: string | null;
   personalServiceNotes: string | null;
   specialInstructions: string | null;
}

export interface ISigning {
   id: string;
   affiantIs: string;
   affiantSignature: string;
   affiantSignDate: string;
   signature: string | null;
   name: string | null;
   userId: string;
   pdfTemplateId: string | null;
}

export interface ITenantInfo {
   id: string;
   unitId: string | null;
   andAllOthers: boolean;
   andAllOthersText: string;
   addressId: string;
   address: ITenantAddress;
   unsignedDisposTenantNames: ITenantName[];
   unsignedDisposTenantnames?: ITenantName[];
}

export interface ITenantName {
   id: string;
   isEntity: boolean | null;
   entityName: string | null;
   firstName: string;
   middleName: string;
   lastName: string;
   suffix: string | null;
   email: string | null;
   phone: string | null;
   activeDuty: string | null;
   attachment: any | null;
   attachmentId: string | null;
   unsignedDisposTenantInfoId: string;
}

export interface IClient {
   id: string;
   companyName: string;
   phone: string;
   clientType: number;
   addressLine1: string;
   addressLine2: string;
   city: string;
   state: string;
   postalCode: string;
   email: string;
   notes: string;
   tylerUserId: string;
   isProcessServer: boolean;
   casperUserId: string | null;
   tylerUser: any | null;
   casperUser: any | null;
   permissionPolicyUsers: any[];
}

export interface IAmendment {
   id: string;
   created: string;
   dateFiled: string | null;
   affiantSignature: string | null;
   amendedBy: string | null;
   dispoId: string;
   propertyName: string;
   county: string;
   address: string;
   unit: string;
   city: string;
   state: string;
   zip: string;
   evictionServiceMethod: string | null;
   attorneyName: string;
   pdfUrl: string;
   ownerName: string;
   reason: string;
   monthlyRent: number;
   totalRent: number;
   evictionAffiantIs: string;
   tenant1Last: string;
   tenant1First: string;
   tenant1MI: string | null;
   tenant2Last: string | null;
   tenant2First: string | null;
   tenant2MI: string | null;
   tenant3Last: string | null;
   tenant3First: string | null;
   tenant3MI: string | null;
   tenant4Last: string | null;
   tenant4First: string | null;
   tenant4MI: string | null;
   tenant5Last: string | null;
   tenant5First: string | null;
   tenant5MI: string | null;
   andAllOtherOccupants: string;
   evictionTotalRentDue: string;
   allMonths: string;
   evictionOtherFees: string;
   propertyPhone: string;
   propertyEmail: string;
   propertyAddress: string;
   propertyCity: string;
   propertyState: string;
   propertyZip: string;
   attorneyBarNo: string;
   attorneyEmail: string;
   filerBusinessName: string;
   filerPhone: string;
   filerEmail: string;
   expedited: string;
   stateCourt: string;
   applicantDate: string;
}

export interface IWritLabor {
   id: string;
   firstName: string;
   lastName: string;
   email: string;
   phone: string;
   clientId: string;
   isDeleted: boolean;
   createdDate: string;
   client: any | null; // You can define the type of client property more accurately if possible
}

export interface IUnsignedWrit {
   id: string;
   reason: number;
   created: string;
   dateFiled: string;
   affiantSignature: string;
   orderDate: string;
   paymentAmountOwed: number | null;
   paymentDueOn: string;
   comment: string;
   writApplicantIs: string;
   writApplicantPhone: string;
   isCorporation: boolean;
   hasSSN: boolean;
   writLabor: IWritLabor;
   writLaborId: string;
   setOutNotes: string | null;
   setOutScheduled: string | null;
   setOutCompleted: string | null;
   setOutCompletedDate: string | null;
   writCancelled: any | null; // Define the type more accurately if possible
   applicantDate: string;
}

export interface IUnsignedDismissal {
   id: string;
   created: string;
   dateFiled: string;
   affiantSignature: string;
   reason: number;
   applicantDate: string;
}

export interface IImportCsvFieldError {
   fieldName: string;
   message: string;
}
export interface IImportCsvRowError {
   rowIndex: number;
   fields: IImportCsvFieldError[];
}

export interface IExportCsv {
   dispoIds: string[];
   isSigned: boolean;
}

export interface IExportPendingCsv {
   dispoIds: string[];
}


export interface IUploadFile {
   base64String: string;
   fileName: string;
   type: string;
};

export interface ICommonSelectOptions {
   id: string;
   value: string;
};

export type SortingOption = {
   sortColumn: string;
   isAscending: boolean;
};

export type FilterOption = {
   key: string;
};

export type DispoTaskId = {
   taskIds: string[];
   selectedIds: string[];
}