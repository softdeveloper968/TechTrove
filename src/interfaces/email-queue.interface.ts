import { server } from "typescript";

export interface IEmailQueueItem {
   id: string;
   caseNo: string;
   status: string;
   county: string;
   state: string;
   zip: string;
   processServerEmail: string;
   methodName: string;
   expedited?: string;
   evictionTransactionAmt?: string;
   transactionfee?: string;
   tenantZip?: string;
   propertyName?: string;
   description?: string;
   referenceId?: string;
   companyName?: string;
   stateCourt?: string;
   // tenantOne?:string;
   tenant1LastName: string;
   tenant1FirstName: string;
   tenant1MiddleName: string;
   documents?: Document;
   caseCreatedDate?: Date;
   tenantAddress?: string;
   tenantUnit?: string;
   eFileFeeClient?: string;
   evictionCourtFee?: string;
   evictionEnvelopeID?: string;
   envelopeIdHistory?: string;
   evictionDateFiled?: Date | null;
   evictionPaymentMethod?: string;
   paymentAccount?: string
   attorneyName?: string;
   attorneyBarNo?: string;
   evictionReason?: string;
   filerEmail?: string;
   tenantCity?: string;
   tenantState?: string;
   isTransactionFeeChanged?: boolean;
   document?: string;
   eFileMethod?: string;
   taskStatus:string;
   rejectedReason:string;
   taskId:string;
};

export interface IEmailQueue {
   items: IEmailQueueItem[];
   currentPage: number;
   pageSize: number;
   totalCount: number;
   totalPages: number;
   searchParam?: string;
   companyId?: string;
   county?: string;
   serverId?: string;
   isExpedited?: number;
   isStateCourt?: number;
   status?:string;
   taskStatus?:number;
   court?:string;
};

export interface IEmailQueueButton {
   title: string;
   icon: string;
   classes: string;
}

export interface IEditEmailQueueItem {
   id: string;
   caseNo: string;
   processServerEmail: string;
   description: string;
   document: string;
   taskStatus: string;
   // attachmentType: string;
   expedited: string;
   county: string;
   evictionTransactionAmt: string;
   //tenantOne: string;
   tenantZip: string;
   propertyName: string;
   referenceId: string;
   stateCourt: string;
   tenant1LastName: string;
   tenant1FirstName: string;
   tenant1MiddleName: string;
   caseCreatedDate: Date | string;
   tenantAddress: string;
   tenantUnit: string;
   eFileFeeClient: string;
   evictionCourtFee: string;
   evictionEnvelopeID: string;
   evictionDateFiled: Date | string|null;
   evictionPaymentMethod: string;
   attorneyName: string;
   attorneyBarNo: string;
   evictionReason: string;
   filerEmail: string;
   tenantCity: string;
   tenantState: string;
   eFileMethod?: string;
   paymentAccount?: string;
   caseType?: string;
   taskId?: string;
}
export interface IDocument {
   id: string;
   type: string;
   url: string;
};

export interface IServerIinfo {
   id: string;
   email: string;
}

export interface IServerEmailLogItem {
   id: string;
   serverEmail: string;
   documentUrl: string;
   verificationCheck?: Date | null;
   checkedBy?: string
   createdDate?: Date;
   county: string;
   mailDate: Date | null;
   mailTotal: number;
   mailWeight: string;
   mailTracking: number;
   mailManager: string;
   notes: string;
   c2CCheck: string;
   c2CCheckTotal: string;
   serviceTotal: string;
}

export interface IServerEmailLog {
   items: IServerEmailLogItem[];
   currentPage: number;
   pageSize: number;
   totalCount: number;
   totalPages: number;
   searchParam?: string;
};

export interface IMailManagementItem {
   id: string;
   county: string;
   filingType: number | null;
   documentUrl: string;
   batchSignDate: Date | string;
   mailDate: Date | string;
   mailTotal: number | null;
   mailWeight: string;
   mailTracking: number | string | null;
   mailNotes: string;
   mailManager: string;
}

export interface IMailManagementQueue {
   items: IMailManagementItem[];
   currentPage: number;
   pageSize: number;
   totalCount: number;
   totalPages: number;
   searchParam?: string;
};

export interface IManualCaseDownloadDocument {
   pdfUrls: string;
}