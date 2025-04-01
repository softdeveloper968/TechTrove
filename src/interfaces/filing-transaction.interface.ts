import { CourtDecisionEnum, OperationTypeEnum } from "utils/enum";
import { IRootCaseInfo } from "./common.interface";
import { ITenant } from "./all-cases.interface";
import { string } from "yup";

export interface IFilingTransaction {
   items: IFilingTransactionItem[];
   currentPage: number;
   pageSize: number;
   totalCount: number;
   totalPages: number;
   searchParam?: string;
   companyId?: string, 
   fromDate?: Date | null,
      toDate?: Date | null ,
       datePaidFromDate?: Date | null, 
       datePaidToDate?: Date | null,
       blankOption?: string[],
       nonBlankOption?: string[],
   county?: string, 

};

export interface IFilingTransactionItem {
   id: string;
   dispoId: string;
   clientId: string;
   caseNumber: string;
   propertyName: string;
   signedDispo: IRootCaseInfo | null;
   operationType: OperationTypeEnum;
   courtDecision: CourtDecisionEnum;
   applicantDate: string | null;
   filedDate: string | null;
   paymentMethod: string;
   courtTransAmount: number | null;
   paymentAmount: number;
   invoiceDate: string | null;
   invoiceNumber: string;
   datePaid: string | null;
   checkNumber: string;
   hasInvoiceCreated: boolean;
   tenantNames: ITenant[];
   county: string;
   issueDate: string | null;
   expedited: string;
   companyName: string | null;
   address: string | null;
   tenantFirstName: string;
   tenantLastName: string;
   tenantMiddleName: string | null;
   clientReferenceId: string | null;
   serverReceived: Date | null;
   serviceDate: Date | null;
   serviceDayCal: number | null;
   house: string | null;
   addtlTenants: number | null;
   andAllOtherOccupants: string | null;
   stateCourt: string;
   eFileMethod: string;
   paymentNotes: string | null;
   eFileClientFee: number | null;
   expFee: number | null;
   c2CFilingFee: number | null;
   sheriffFee: number | null;
   c2CServiceFee: number | null;
   automationFee: number | null;
   payPalFee: number | null;
   payPalManual: number | null;
   personalService: string;
   notes: string;
   officeCheckedDate: Date | string | null;
   officeCheckedBy: string;
   officeCheckedNotes: string;
   paymentAccount: string;
   serviceDateAmendment: Date | string | null;
   serverReceivedAmendment: Date | string | null;
   serviceMethodAmendment: string | null;
   serverSignatureAmendment: string | null;
   eFileDatePaid: Date | string | null;
   aosType:string|null;
};

export interface IAccountingQueue {
   items: IAccountingQueueItem[];
   currentPage: number;
   pageSize: number;
   totalCount: number;
   totalPages: number;
   searchParam?: string;
   fromDatePaid?: Date | null;
   toDatePaid?: Date | null;
   type?: string;
   fromDatePayroll?: Date | null;
   toDatePayroll?: Date | null;
   fromDateCommission?: Date | null;
   toDateCommission?: Date | null;
   blankOption?: string[];
   nonBlankOption?: string[];
   county?: string, 
};

export interface IAccountingQueueItem extends  IFilingTransactionItem{
   type: string;
   filerEmail: string;
   envelopeId: string;
   paymentMethod: string;
   processServerCompany: string;
   paidServer: number | null;
   serverSignature: string;
   personalService: string;
   serviceMethod: string;
   payrollDate: Date | null;
   commissionDate: Date | null;
   serverPayAdminNotes: string | null;
};

export interface IEvictionFilingTransactionExportResource {
   Id: string;
   created: Date | null;
   County: string;
   CaseNo: string;
   issueDate: string | null;
   Expedited: string;
   CompanyName: string | null;
   PropertyName: string;
   TenantOne: string;
   TenantAddressCombined: string;
   ClientReferenceID: string | null;
   serverReceived: Date | null;
   serviceDate: Date | null;
   serviceDayCal: number | string | null;
   PersonalService: string;
   House: string | null;
   AddtlTenants: number | null;
   AndAllOtherOccupants: string | null;
   StateCourt: string;
   eFileMethod: string;
   PaymentNotes: string | null;
   EvictionCourtTransAmt: number | null;
   EvictionEfileFee: number | null;
   C2CServiceExpFee: number | null;
   C2CEvictionFee: number | null;
   SheriffFee: number | null;
   C2CServiceFee: number | null;
   EAFee: number | null;
   EvictionPaymentAmount: number;
   EvictionPayPalFee : number | null;
   EvictionPayPalManual: number | null;
   evictionFiledDate: string | null;
   FilingCount: number | null;
   eFilePaymentMethod: string;
   evictionInvoiceDate: string | null;
   EvictionInvoiceNo: string;
   evictionDatePaid: string | null;
   eFileDatePaid: Date | null;
   EvictionCheckNo: string;
   Notes: string;
   officeCheckedDate: Date | null;
   OfficeCheckedBy: string;
   OfficeCheckedNotes: string;
   PaymentAccount: string;
};

export interface IAccountingQueueExportResource {
   Id: string;
   ActionType: string;
   created: Date | null;
   ClientReferenceID: string | null;
   County: string;
   CaseNo: string;
   FilerEmail: string;
   TenantOne: string;
   eFileMethod: string;
   EnvelopeId: string;
   filedDate: string | null;
   eFilePaymentMethod: string;
   InvoiceNo: string;
   invoiceDate: string | null;
   datePaid: string | null;
   CheckNo: string;
   PaymentNotes: string | null;
   CourtTransAmt: number | null;
   AddtlTenants: number | null;
   AndAllOtherOccupants: string | null;
   Expedited: string;
   CompanyName: string | null;
   PropertyName: string;
   TenantAddressCombined: string;
   ProcessServerCompany: string;
   serverReceived: Date | null;
   serviceDate: Date | null;
   serviceDayCal: number |string| null;
   PaidServer: number | null;
   ServerPayAdminNotes: string | null;
   ServerSignature: string;
   PersonalService: string;
   ServiceMethod: string;
   House: string | null;
   C2CServiceFee: number | null;
   SheriffFee: number | null;
   PayPalFee : number | null;
   PayPalManual: number | null;
   StateCourt: string;
   payrollDate: Date | null;
   commissionDate: Date | null;
   PaymentAmount: number;
   Notes: string;
   officeCheckedDate: Date | null;
   OfficeCheckedBy: string;
   OfficeCheckedNotes: string;
   PaymentAccount: string;
   serviceDateAmendment: Date | null;
   serverReceivedAmendment: Date | null;
};

export interface IFilingTransactionExportResource {
   Id: string;
   created: Date | null;
   County: string;
   CaseNo: string;
   CompanyName: string | null;
   PropertyName: string;
   TenantOne: string;
   TenantAddressCombined: string;
   filedDate: string | null;
   CourtTransAmt: number | null;
   sheriffFee: number | null;
   c2CAOSFee: number | null;
   c2CWritFee: number | null;
   c2CDismissalFee: number | null;
   c2CAmendmentFee: number | null;
   c2CServiceFee: number | null;
   PaymentAmount: number;
   PayPalFee: number | null;
   PayPalManual: number | null;
   FilingCount: number | null;
   eFilePaymentMethod: string;
   invoiceDate: string | null;
   InvoiceNo: string;
   datePaid: string | null;
   CheckNo: string;
   Notes: string;
   officeCheckedDate: Date | null;
   OfficeCheckedBy: string;
   OfficeCheckedNotes: string;
   PaymentAccount: string;
   serviceDateAmendment: Date | null;
   serverReceivedAmendment: Date | null;
};
export interface IFilingTransactionOtherExportResource {
   Id: string;
   created: Date | null;
   County: string;
   CaseNo: string;
   CompanyName: string | null;
   PropertyName: string;
   TenantOne: string;
   TenantAddressCombined: string;
   filedDate: string | null;
   CourtTransAmt: number | null;
   PaymentAmount: number;
   PayPalFee: number | null;
   PayPalManual: number | null;
   FilingCount: number | null;
   eFilePaymentMethod: string;
   invoiceDate: string | null;
   InvoiceNo: string;
   datePaid: string | null;
   CheckNo: string;
   Notes: string;
   officeCheckedDate: Date | null;
   OfficeCheckedBy: string;
   OfficeCheckedNotes: string;
   PaymentAccount: string;
};

export interface IExportTransactionCsv {
   transactionIds: string[];
   filingType: string;
}

export interface IAccountingQueueFilter {
   fromDatePaid?: Date | null;
   toDatePaid?: Date | null;
   type?: string;
   fromDatePayroll?: Date | null;
   toDatePayroll?: Date | null;
   fromDateCommission?: Date | null;
   toDateCommission?: Date | null;
   blankOption?: string[];
   nonBlankOption?: string[];
   county?: string;
   state?:string;
}

export interface IAccountingQueueExportFilter {
   fromDatePaid?: Date | null;
   toDatePaid?: Date | null;
   type?: string;
   fromDatePayroll?: Date | null;
   toDatePayroll?: Date | null;
   fromDateCommission?: Date | null;
   toDateCommission?: Date | null;
   blankOption?: string[];
   nonBlankOption?: string[];
   transactionIds: string[];
   county?: string;
   state?:string;
}

export interface IBillingTransactionFilter {
   clientId?: string;
   fromDate?:Date | null;
   toDate?: Date | null;
   fromDatePaid?: Date | null;
   toDatePaid?: Date | null;
   blankOption?: string[];
   nonBlankOption?: string[];
   county?: string;
   state?:string;
}
export interface IBillingTransactionExportFilter {
   clientId?: string;
   fromDate?:Date | null;
   toDate?: Date | null;
   fromDatePaid?: Date | null;
   toDatePaid?: Date | null;
   blankOption?: string[];
   nonBlankOption?: string[];
   transactionIds: string[];
   filingType: string;
   county?: string;
   state?:string;
}

export interface IExportCsv {
   transactionIds: string[];
}
// export interface IFilingTransactionItem {
//    id: string;
//    dispoId: string;
//    signedDispo: IRootCaseInfo | null;
//    operationType: OperationTypeEnum;
//    courtDecision: CourtDecisionEnum;
//    applicantDate: string | null;
//    filedDate: string | null;
//    courtTransAmount: number;
//    paymentAmount: number;
//    c2CTotalFee: number;
//    invoiceDate: string | null;
//    invoiceNumber: string;
//    datePaid: string | null;
//    checkNumber: string;
//    hasInvoiceCreated: boolean;
// };

export interface UpdatePaymentResource {
   id: string;
   dispoId: string;
   caseNumber: string;
   courtTransAmount: number | undefined;
   eFileClientFee: number | undefined;
   expFee: number | undefined;
   c2CFilingFee: number | undefined;
   sheriffFee: number | undefined;
   c2CServiceFee: number | undefined;
   automationFee: number | undefined;
   paymentAmount: number | undefined;
   payPalFee: number | undefined;
   payPalManual: number | undefined;
   invoiceDate: string | null;
   datePaid: string | null;
   eFileDatePaid: string | null;
   filedDate: string | null;
   invoiceNumber: string | null;
   checkNumber: string;
   house: string | null;
   paymentNotes: string | null;
   commissionDate: string | null;
   payrollDate: string | null;
   paidServer: number| undefined;
   expedited: string;
   serverPayAdminNotes: string | null;
   notes: string | null;
   officeCheckedDate: Date | string | null;
   officeCheckedBy: string | null;
   officeCheckedNotes: string | null;
   paymentAccount: string | null;
   paymentMethod: string | null;
   serviceDateAmendment: Date | string | null;
   serverReceivedAmendment: Date | string | null;
   serviceMethodAmendment: string | null;
   serverSignatureAmendment: string | null;
}


export interface IUpdateBillingTnxPayload {
   id: string;
   dispoId: string;
   courtTransAmount: number | undefined;
   eFileClientFee: number | undefined;
   expFee: number | undefined;
   c2CFilingFee: number | undefined;
   sheriffFee: number | undefined;
   c2CServiceFee: number | undefined;
   automationFee: number | undefined;
   paymentAmount: number | undefined;
   payPalFee: number | undefined;
   payPalManual: number | undefined;
   invoiceDate: string | null;
   datePaid: string | null;
   eFileDatePaid: string | null;
   filedDate: string | null;
   invoiceNumber: string | null;
   checkNumber: string;
   house: string | null;
   paymentNotes: string | null;
   commissionDate: string | null;
   payrollDate: string | null;
   paidServer?: number| undefined | null;
   serverPayAdminNotes: string | null;
   notes: string | null;
   officeCheckedDate: Date | string | null;
   officeCheckedBy: string | null;
   officeCheckedNotes: string | null;
   paymentAccount: string | null;
   paymentMethod: string | null;
   serviceDateAmendment: Date | string | null;
   serverReceivedAmendment: Date | string | null;
   serviceMethodAmendment: string | null;
   serverSignatureAmendment: string | null;
}

export interface IFilingTransactionButton {
   title: string;
   icon: string;
   classes: string;
}

export interface IImportExistingBillingTransactionCSV {
   Id: string;
   ActionType: string;
   created?: Date | null;
   ClientReferenceId?: string | null;
   County: string;
   CaseNumber: string;
   FilerEmail: string;
   TenantOne: string;
   EFileMethod: string;
   EnvelopeId: string;
   filedDate?: Date | null;
   EFilePaymentMethod: string;
   invoiceNo: string;
   invoiceDate?: Date | null;
   datePaid?: Date | null;
   eFileDatePaid?: Date | null;
   checkNo: string;
   PaymentNotes?: string | null;
   courtTransAmt: number | null; // decimal type
   AddtlTenants?: number | null; // assuming integer for additional tenants
   AndAllOtherOccupants?: string | null; // Optional field
   Expedited: string;
   CompanyName?: string | null;
   PropertyName?: string | null;
   TenantAddressCombined: string;
   ProcessServerCompany: string;
   serverReceived?: Date | null;
   serviceDate?: Date | null;
   serviceDayCal?: number| string | null;
   paidServer?: number | null; // decimal type
   ServerPayAdminNotes?: string | null;
   ServerSignature: string;
   PersonalService: string;
   ServiceMethod: string;
   House?: string | null;
   c2CServiceFee: number; // decimal type
   sheriffFee: number; // decimal type
   payPalFee: number | null; // decimal type
   payPalManual: number | null; // decimal type
   StateCourt: string;
   payrollDate?: Date | null;
   commissionDate?: Date | null;
   paymentAmount: number; // decimal type
   Notes: string;
   officeCheckedDate?: Date | null; // Optional field
   OfficeCheckedBy: string;
   OfficeCheckedNotes: string;
   PaymentAccount: string;
   evictionCourtTransAmt: number | null;

   evictionEfileFee: number | null;
   c2CServiceExpFee: number | null;
   c2CEvictionFee: number | null;
   eaFee: number | null;
   evictionPaymentAmount: number;
   evictionPayPalFee : number | null;
   evictionPayPalManual: number | null;
   evictionFiledDate?: Date | string | null;
   evictionInvoiceDate?: Date | string | null;
   evictionInvoiceNo: string;
   evictionDatePaid?: Date | string | null;
   evictionCheckNo: string; 
   
   aosFiledDate?: Date | string | null;
   aosCourtTransAmt: number | null;
   aosPaymentAmount: number;
   aosPayPalFee : number | null;
   aosPayPalManual: number | null;
   aosInvoiceDate?: Date | string | null;
   aosInvoiceNo: string;
   aosDatePaid?: Date | string | null;
   aosCheckNo: string; 

   dismissalApplicantDate?: Date | null;
   dismissalFiledDate?: Date | string | null;
   dismissalCourtTransAmt: number | null;
   dismissalPaymentAmount: number;
   dismissalPayPalFee : number | null;
   dismissalPayPalManual: number | null;
   dismissalInvoiceDate?: Date | string | null;
   dismissalInvoiceNo: string;
   dismissalDatePaid?: Date | string | null;
   dismissalCheckNo: string; 

   writApplicantDate?: Date | null;
   writFiledDate?: Date | string | null;
   writCourtTransAmt: number | null;
   writPaymentAmount: number;
   writPayPalFee : number | null;
   writPayPalManual: number | null;
   writInvoiceDate?: Date | string | null;
   writInvoiceNo: string;
   writDatePaid?: Date | string | null;
   writCheckNo: string; 
   c2CWritFee : number | null;


   amendmentApplicantDate?: Date | null;
   amendmentFiledDate?: Date | string | null;
   amendmentCourtTransAmt: number | null;
   amendmentPaymentAmount: number;
   amendmentPayPalFee : number | null;
   amendmentPayPalManual: number | null;
   amendmentInvoiceDate?: Date | string | null;
   amendmentInvoiceNo: string;
   amendmentDatePaid?: Date | string | null;
   amendmentCheckNo: string;
   serviceDateAmendment?: Date | null; 
   serverReceivedAmendment?: Date | null; 
   serviceMethodAmendment: string | null;
   serverSignatureAmendment: string | null;
 }