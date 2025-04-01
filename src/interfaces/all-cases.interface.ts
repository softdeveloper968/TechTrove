import { IAmendmentsSign } from "./amendments.interface";
import { SortingOption } from "./common.interface";

// Base interface for common properties in AllCases
export interface IAllCasesBase {
   id?: string;
   tenantFirstName: string;
   tenantLastName: string;
   address: string;
   city: string;
   unit: string;
   state: string;
   propertyName: string;
   county: string;
};
export interface ICrmInfo {
   id?: string;
   crmName: string;
   status?: string;
   statusDate?: Date | null;
}

export interface IAllCasesDownloadDocument {
   pdfUrls: string;
   type: string
}

export interface IAllCasesItems extends IAllCasesBase, AmendmentsItems {
   isChecked?: boolean;
   status: string;
   caseNo: string;
   documents: Document[];
   militaryStatusDoc: Document[];
   tenantNames: ITenant[];
   zip: string;
   evictionDateFiled: Date | null;
   evictionServiceDate: Date | null;
   attorneyBarNo: string;
   // lastDaytoAnswer: Date;
   evictionServiceMethod: string;
   courtDate: Date | null;
   dismissalFileDate: Date | null;
   writFiledDate: Date | null;
   attorneyName: string;
   evictionAffiantSignature: string;
   answerDate: Date | null;
   writSignDate: Date | null;
   noticeCount: number;
   evictionCount: number;
   amendmentAffiantSignature: string;
   amendedBy: string;
   answerBy: Date | null
   //caseCount: number;
   reason?: string;
   // for file writs
   selectedReason?: string;
   writOrderDate?: Date | string | null;
   paymentAmountOwned?: string;
   paymentDueOn?: Date | string | null;
   writComment?: string;
   hasSSN?: string;
   isCorporation?: string;
   selectedWritLabor?: string;
   writLaborId?: string;
   writApplicantIS?: string;
   otherApplicantIS?: string;
   writApplicantPhone?: string;
   militaryStatusReport?: string;
   evictionLastDayToAnswer?: Date | null;
   companyName: string;
   ownerName: string;
   monthlyRent: string;
   totalRent: string;
   evictionAffiantIs: string;
   andAllOtherOccupants: string;
   envelopeNo: string | number;
   createdAt: string;
   tenant1Last?: string;
   tenant1First?: string;
   tenant1MI?: string;
   tenant2Last?: string;
   tenant2First?: string;
   tenant2MI?: string;
   tenant3Last?: string;
   tenant3First?: string;
   tenant3MI?: string;
   tenant4Last?: string;
   tenant4First?: string;
   tenant4MI?: string;
   tenant5Last?: string;
   tenant5First?: string;
   tenant5MI?: string;
   crmInfo: ICrmInfo;
   clientReferenceId: string;
   issueDate: Date | string | null;
   isDismissal: boolean | null;
};

export interface AmendmentsItems {

   // tenantAddress?: string;
   // tenantUnit?: string;
   // tenantCity?: string;
   // tenantState?: string;
   // tenantZip?: string;
   evictionTotalRentDue?: string;
   allMonths?: string;
   evictionOtherFees?: string;
   // propertyName?: string;
   propertyPhone?: string;
   propertyEmail?: string;
   propertyAddress?: string;
   propertyCity?: string;
   propertyState?: string;
   propertyZip?: string;
   attorneyEmail?: string;
   filerBusinessName?: string;
   filerPhone?: string;
   filerEmail?: string;
   processServer?: string;
   processServerEmail?: string;
   expedited?: string;
   stateCourt?: string;
}

// Interface for all cases with pagination
export interface IAllCases {
   items: IAllCasesItems[];
   currentPage: number;
   pageSize: number;
   totalCount: number;
   totalPages: number;
   searchParam?: string;
   status?: string;
   county?: string;
   filingType?: boolean | null;
   courtType?:string | null;
   sortings: SortingOption[]
};

// Interface for AllCases buttons
export interface IAllCasesButton {
   title: string;
   icon: string;
   classes: string;
};

export interface ISelectOptions {
   id: number | string;
   value: string;
};
export interface ISearchSelectOptions {
   value: string;
   label: string;
}

export interface IAllCasesSign {
   signature: string;
   dispoIds: string[];
   resources?: IAmendmentsSign[]
};

export interface IWritCasesSign {
   signature: string;
   writs: IWritsCase[];
};

export interface IAllCasesReason {
   dispoId: string;
   reason?: string;
};

export interface IDismissalReason {
   dispoId: string;
   reason: number | undefined;
};

export interface IAmendmentReview {
   dispoId: string
   caseNo: string
   propertyName: string
   county: string
   tenantFirstName: string
   tenantLastName: string
   unit: string
   street: string
   city: string,
   state: string,
   zip: string,
   evictionServiceMethod: string,
   attorneyName: string,
   address: string
};

export interface IAllCases_CreateAllCasesEmail {
   combinedPdfUrl(combinedPdfUrl: any): unknown;
   combinedUrl: string;
   pdfCount: number;
};

export interface DocumentReviewResponse {
   combinedPdfUrl: string;
   pdfCount: number;
};

export interface Document {
   id: string;
   type: string;
   url: string;
};

export interface ICaseDocument {
   id: string;
   type: string;
   url: string;
   fileName:string;
};

export interface ITenant {
   id: string;
   firstName: string;
   lastName: string;
   middleName: string;
   phone?:string,
   email?:string,
   isMilitaryStatusUploaded: boolean;
   militaryStatusDocURL: string;
   attachmentId?: string;
};

export interface ITenantDocument {
   caseId: string;
   tenantNameId: string[];
   militaryReportDocument: string;
};

export interface IWritsCase {
   caseId: string;
   reason: number | null;
   writOrderDate: Date | string | null;
   paymentAmountOwned: number | null ;
   paymentDueOn: Date | string | null;
   writComment: string;
   hasSSN: boolean;
   isCorporation: boolean;
   writLaborId: string;
   writApplicantIs: string;
   writApplicantPhone: string;
};

export interface IWritsUnsignedCase {
   caseId: string;
};

export interface IWritsLabor {
   length: number;
   id: string;
   firstName: string;
   lastName: string;
   email: string;
   isActive: boolean;
   role: string | null;
   password: string | null;
   userCompanyId: string;
   phone: string;
   createdDate: string;
   userCompany: any | null; // You might want to replace 'any' with the actual type for userCompany
};

export interface ISelectedWrit {
   id?: string;
   isChecked?: boolean;
   status: string;
   caseNo: string;
   documents: Document[];
   zip: string;
   evictionDateFiled: Date | null;
   evictionServiceDate: Date | null;
   attorneyBarNo: string;
   // lastDaytoAnswer: Date;
   evictionServiceMethod: string;
   courtDate: Date | null;
   dismissalFileDate: Date | null;
   writFiledDate: Date | null;
   attorneyName: string;
   evictionAffiantSignature: string;
   answerDate: Date | null;
   writSignDate: Date | null;
   noticeCount: number;
   evictionCount: number;
   amendmentAffiantSignature: string;
   amendedBy: string;
   answerBy: Date | null
   //caseCount: number;
   reason?: string;
   // file writ input fields
   selectedReason?: string;
   writOrderDate?: Date | string | null;
   paymentAmountOwned?: string;
   paymentDueOn?: Date | string | null;
   writComment?: string;
   hasSSN?: string;
   isCorporation?: string;
   selectedWritLabor?: string;
   writLaborId?: string;
   writApplicantIS?: string;
   otherApplicantIS?: string;
   writApplicantPhone?: string;
   militaryStatusReport?: string;
   tenantNames?: ITenant[];
};

export interface IMSReportResponse {
   isUploaded: boolean;
   militaryReportURL: string;
   tenantNameId: string;
   attachmentId: string;
}

export interface UpdateCaseNumberResource {
   UniqueId: string;
   CaseNumber: string;
}

export interface ICasesSearchRequest {
   filingType: string;
   caseNumbers: string[];
};

// export interface IImportExistingCaseCSV {
//    County: string; // Required
//    CaseNo: string; // Required

//    PropertyName: string; // Required
//    OwnerName?: string; // Optional
//    PropertyPhone: string;
//    PropertyEmail: string;
//    PropertyAddress: string; // Required
//    PropertyCity: string; // Required
//    PropertyState: string; // Required
//    PropertyZip: string; // Required
//    EvictionFilerEmail: string; // Required
//    //CompanyName?: string; // Optional
//    Tenant1First: string; // Required
//    Tenant1Last: string; // Required
//    Tenant1MI?: string; // Optional
//    Tenant2First?: string; // Optional
//    Tenant2Last?: string; // Optional
//    Tenant2MI?: string; // Optional
//    Tenant3First?: string; // Optional
//    Tenant3Last?: string; // Optional
//    Tenant3MI?: string; // Optional
//    Tenant4First?: string; // Optional
//    Tenant4Last?: string; // Optional
//    Tenant4MI?: string; // Optional
//    Tenant5First?: string; // Optional
//    Tenant5Last?: string; // Optional
//    Tenant5MI?: string; // Optional
//    AndAllOtherOccupants: string;
//    TenantAddress: string; // Required
//    TenantUnit?: string; // Optional
//    TenantCity: string; // Required
//    TenantState: string; // Required
//    TenantZip: string; // Required
//    EvictionDateFiled?: string | null; // Optional
//    EvictionServiceMethod :string;
//    EvictionServiceDate?: string | null; // Optional
//    EvictionLastDaytoAnswer?: string | null; // Optional
//    EvictionReason: string;
//    EvictionTotalRentDue: string;
//    MonthlyRent: number;
//    AllMonths: string;
//    EvictionOtherFees: string;
//    AnswerDate?: string | null; // Optional
//    CourtDate?: string | null; // Optional
//    EvictionAffiantSignature?: string; // Optional
//    AttorneyName?: string; // Optional
//    AttorneyBarNo?: string; // Optional
//    FilerBusinessName: string;
//    EvictionAffiantIs: string;
//    WritApplicantDate?: string | null; // Optional
//    ClientReferenceID?: string; // Optional
//    StateCourt?: string; // Optional
//    ClientId?: string;
// }

export interface IImportExistingCaseCSV {
   County: string;
   CaseNo: string;
   Tenant1Last: string;
   Tenant1First: string;
   Tenant1MI?: string;
   AndAllOtherOccupants: string;
   TenantAddress: string;
   TenantUnit?: string;
   TenantCity: string;
   TenantState: string;
   TenantZip: string;
   Tenant2Last?: string;
   Tenant2First?: string;
   Tenant2MI?: string;
   Tenant3Last?: string;
   Tenant3First?: string;
   Tenant3MI?: string;
   Tenant4Last?: string;
   Tenant4First?: string;
   Tenant4MI?: string;
   Tenant5Last?: string;
   Tenant5First?: string;
   Tenant5MI?: string;
   EvictionDateFiled?: string | null;
   EvictionServiceMethod :string;
   EvictionServiceDate?: string | null;
   EvictionLastDaytoAnswer?: string | null;
   EvictionReason: string;
   EvictionTotalRentDue: string;
   MonthlyRent: number;
   AllMonths: string;
   EvictionOtherFees: string;
   AnswerDate?: string | null;
   CourtDate?: string | null;
   EvictionAffiantSignature?: string;
   OwnerName?: string;
   PropertyName: string;
   PropertyPhone: string;
   PropertyEmail: string;
   PropertyAddress: string;
   PropertyCity: string;
   PropertyState: string;
   PropertyZip: string;
   AttorneyName?: string;
   AttorneyBarNo?: string;
   FilerBusinessName: string;
   EvictionAffiantIs: string;
   WritApplicantDate?: string | null;
   EvictionFilerEmail: string;
   StateCourt?: string;
   //CompanyName?: string;
   ClientReferenceID?: string;
   ClientId?: string;
}

