import { strict } from "assert";
import { IFileEvictionsItems } from "./file-evictions.interface";

export interface IEvictionAutomationQueueItem {
   id?: string;
   isChecked?: boolean;
   company: string;
   clientId:string;
   evictionAffiantIs: string;
   andAllOtherOccupants: string;
   allowMultipleImports: boolean;
   attorneyBarNo: string;
   attorneyEmail: string;
   attorneyName: string;
   bccEmails: string;
   ccEmails: string;
   tenantAddressConfig: string;
   confirmReportEmail: string;
   county: string;
   daysToFileAfterNoticeDelivery: number;
   disabled: boolean;
   dismissalNotificationDay: string;
   dismissalNotificationDayMultiselect:string[];
   expedited: boolean | string;
   filerBusinessName: string;
   evictionFilerEmail: string;
   evictionFilingDate: Date|null;
   evictionFilingDays: number;
   filingThresholdAdjustment?: number|null;
   minimumFilingAmount: number|null;
   notes: string;
   noticesRequired: boolean;
   ownerId: string;
   ownerName: string;
   prescreenConfirmEmail: string;
   processServer: string;
   propertyAddress: string;
   propertyCity: string;
   propertyEmail: string;
   propertyId: string;
   propertyName: string;
   propertyPhone: string;
   propertyState: string;
   propertyStreetNo: string;
   propertyZip: string;
   prescreenSignEmail: boolean;
   signerEmail: string;
   stateCourt: boolean | string;
   unitsUsePropertyAddress: boolean;
   confirmationPin: string;
   ownerAddress:string;
   ownerCity:string;
   ownerState:string;
   ownerZip:string;
   ownerEmail:string;
   ownerPhone:string;
   crmName:string;
   noticeDelinquencyDate:Date|null;
   noticeDismissalDate:Date|null;
   noticeConfirmEmail:string;
   noticeSignerEmail:string;
   integrationId:string;
   xPropertyId:string;
   courtName:string;
};
export interface IEvictionAutomationPropexoGridItem {
   pmsName ?: string;
   county?: string;
   country?: string;
   zip?: string;
   state?: string;
   city?: string;
   propertyPhone?:string;
   propertyEmail?:string;
   streetAddress2?: string;
   streetAddress1?: string;
   propertyName?: string;
   propertyId?: string;
   integrationId ? : string;
   isActive?:boolean;
   xPropertyId ?:string
   ownerName?:string;
   ownerId?:string;
   ownerAddress?:string;
   ownerZip?:string;
   ownerCity?:string;
   ownerState?:string;
   ownerEmail?:string;
   ownerPhone?:string;
};

export interface IEvictionAutomationIntegrationsGridItem {
   id ?: string;
   pmsName ?: string;
   county?: string;
   country?: string;
   zip?: string;
   state?: string;
   city?: string;
   propertyPhone?:string;
   propertyEmail?:string;
   streetAddress2?: string;
   streetAddress1?: string;
   propertyName?: string;
   propertyId?: string;
   integrationId ? : string;
   isActive?:boolean;
   xPropertyId ?:string
   ownerName?:string;
   ownerId?:string;
   ownerAddress?:string;
   ownerZip?:string;
   ownerCity?:string;
   ownerState?:string;
   ownerEmail?:string;
   ownerPhone?:string;
};

export interface IUnitsForProperty {
   propertyId?: string,
   unitId?: string,
   unitNumber?: string,
   originalUnitNumber?: string,
   address1?: string,
   originalAddress1?: string,
   address2?: string,
   originalAddress2?: string,
   city?: string,
   originalCity?: string,
   state?: string,
   originalState?: string,
   zip?: string,
   originalZip?: string,
   county?: string,
   originalCounty?: string,
   [key: string]: string | undefined; 
}

export interface IPropertyItems {
   id:string;
   companyName:string;
   phone:string;
   clientType:string;
   addressLine1:string;
   addressLine2:string;
   city:string;
   state:string;
   postalCode:string;
   email:string;
   notes:string;
   isProcessServer:boolean;
 }

export interface ITransactionCodes {
   items: ITransactionCodesItem[];
   currentPage: number;
   pageSize: number;
   totalCount: number;
   totalPages: number;
   searchParam?: string;
   companyId?: string;
   propertyId?: string;
   integrationId?:string;
   ownerId?:string;
};

export interface ICRMTransactionCodesResult {
   items: ICRMTransactionCodesItem[];
   currentPage: number;
   pageSize: number;
   totalCount: number;
   totalPages: number;
   searchParam?: string;
   companyId?: string;
   propertyId?: string;
   integrationId?:string;
   ownerId?:string;
};

export interface ITransactionCodesItem {
   id?: string;
   companyName: string;
   clientId:string;
   integrationId:string;
   propertyId: string;
   propertyName: string;
   transactionCodes: string;
   ownerId: string;
   ownerName: string;
   propexoTransactionCodes: IPropexoTransactionCode[]; 
};

export interface ICRMTransactionCodesItem {
   id?: string;
   companyName: string;
   clientId:string;
   integrationId:string;
   propertyId: string;
   propertyName: string;
   transactionCodes: string;
   ownerId: string;
   ownerName: string;
   crmTransactionCodes: ICRMTransactionCode[];

};

export interface ICRMTransactionCode {
   id?: string;
   transactionCodeId: string;
   transactionCodeName: string;
   transactionCodeDescription: string;
   isRent: boolean;
   isSubsidy:boolean;
   transactionCodeShortDescription: string;
   CompanyPropertyTransactionCodeId?: string;
}

export interface IPropexoTransactionCode {
   id?: string;
   transactionCodeId: string;
   transactionCodeName: string;
   transactionCodeDescription: string;
   isRent: boolean;
   isSubsidy:boolean;
   transactionCodeShortDescription: string;
   CompanyPropertyTransactionCodeId?: string;
};

export interface ITransactionCodeFormValues{
   stateName: string;
   countyName: string;
   method: string;
   endPoint: string;
   isMultipleAOSPdf: string;
};
export interface IEvictionAutomationPropexoQueue {
   items: IEvictionAutomationPropexoGridItem[];
   currentPage: number;
   pageSize: number;
   totalCount: number;
   totalPages: number;
   searchParam?: string;
};
export interface IEvictionAutomationIntegrationsQueue {
   items: IEvictionAutomationPropexoGridItem[];
   currentPage: number;
   pageSize: number;
   totalCount: number;
   totalPages: number;
   searchParam?: string;
};
export interface IEvictionAutomationQueue {
   items: IEvictionAutomationQueueItem[];
   currentPage: number;
   pageSize: number;
   totalCount: number;
   totalPages: number;
   searchParam?: string;
   methodName?: string;
   companyId?:string;
   county?: string;
   serverId?:string;
   isExpedited?:number;
   isStateCourt?:number;
};
export interface IEvictionAutomationOtherQueue {
   items: IFileEvictionsItems[];
   currentPage: number;
   pageSize: number;
   totalCount: number;
   totalPages: number;
   isViewAll:boolean;
   searchParam?: string;
   methodName?: string;
   companyId?:string;
};

export interface IEvictionAutomationButton {
   title: string;
   icon: string;
   classes: string;
};

export interface IEvictionAutomationQueueItemImportCsv {
   Company: string;
   EvictionAffiantIs: string;
   AndAllOtherOccupants: string;
   AllowMultipleImports: boolean;
   AttorneyBarNo: string;
   AttorneyEmail: string;
   AttorneyName: string;
   BccEmails: string;
   CcEmails: string;
   TenantAddressConfig: string;
   ConfirmReportEmail: string;
   County: string;
   DaysToFileAfterNoticeDelivery: string|number;
   Disabled: boolean;
   DismissalNotificationDay: string;
   Expedited: boolean | string;
   FilerBusinessName: string;
   EvictionFilerEmail: string;
   EvictionFilingDay: string|number;
   FilingThresholdAdjustment: number|string;
   MinimumFilingAmount: number|string;
   Notes: string;
   NoticesRequired: boolean;
   OwnerId: string;
   OwnerName: string;
   PrescreenConfirmEmail: string;
   ProcessServer: string;
   PropertyAddress: string;
   PropertyCity: string;
   PropertyEmail: string;
   PropertyId: string;
   PropertyName: string;
   PropertyPhone: string;
   PropertyState: string;
   PropertyStreetNo: string;
   PropertyZip: string;
   PrescreenSignEmail: boolean;
   PignerEmail: string;
   StateCourt: boolean | string;
   UnitsUsePropertyAddress: boolean;
   ConfirmationPin: string;
   OwnerAddress?:string;
   OwnerCity?:string;
   OwnerState?:string;
   OwnerZip?:string;
   OwnerEmail?:string;
   OwnerPhone?:string;
   
};

export interface IEvictionAutomationStatus{
   name:string;
   ownerId:string;
   propertyId:string;
   pullDate:string;
   status:string;
   batchId:string;
   docUrl:string;
   logUrl: string;
}

export interface IEvictionAutomationStatusQueue {
   items: IEvictionAutomationStatus[];
   currentPage: number;
   pageSize: number;
   totalCount: number;
   totalPages: number;
   searchParam?: string;
};

export interface EvictionApprovalSelection {
   id: string;
   ownerId: string;
   propertyId: string;
 }

 export interface IEvictionAutomationNoticesImportCsv {
   id?: string;
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
   MonthlyRent: number;
   OwnerName: string;
   PropertyName: string;
   PropertyPhone: string;
   // PropertyEmail: string;
   PropertyAddress: string;
   PropertyCity: string;
   PropertyState: string;
   PropertyZip: string;
   ClientId: string;
   NoticeDeliveryDate?: string;
   NoticeTotalDue: number;
   NoticeDefaultStartDate?: string;
   NoticeDefaultEndDate?: string;
   NoticeLastPaidDate?: string;
   NoticeLastPaidAmount: number;
   NoticeCurrentRentDue: number;
   NoticePastRentDue: number;
   NoticeServerID: string;
 }

 export interface ITranctionCodeList {
   codeId: string,
   name: string,
   description: string
 }
 export interface ICRMTranctionCodeList {
   id: string,
   codeName: string,
   codeDescription: string
 }
 export interface IEvictionAutomationNoticesQueue {
   items: IEvictionAutomationNoticesImportCsv[];
   currentPage: number;
   pageSize: number;
   totalCount: number;
   totalPages: number;
   isViewAll:boolean;
   searchParam?: string;
   methodName?: string;
};

export interface IIntegrationList {
   integrationVendorName: string,
   integrationName: string,
   integrationId: string
};

export interface IPMSList {
   pmsName: string,
   id: string,
}