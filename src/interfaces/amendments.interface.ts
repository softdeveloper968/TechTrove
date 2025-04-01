import { ITenant } from "./all-cases.interface";

// Base interface for common properties
export interface IAmendmentsBase {
   isChecked?: boolean;
   id?: string;
}

// Interface for items displayed in the Amendments screen
export interface IAmendmentsItems extends IAmendmentsBase {
   caseNo: string;
    propertyName: string;
   county: string;
   // firstName: string;
   // middleName: string;
   // lastName: string;
   unit: string;
   // streetNo: string;
   address: string;
    city: string;
   state: string;
   zip: string;
   evictionDateFiled: Date | null;
   evictionServiceDate: Date | null;
   lastDaytoAnswer: Date | null;
   evictionServiceMethod: string;
   courtDate: Date | null;
   dismissalFileDate: Date | null;
    writFileDate: Date | null;
   attorneyName: string;
   evictionAffiantSignature: string;
   amendedBy: string;
   amendmentAffiantSignature: string;
   amendedDate: Date | null;
   reason?: string;
   // companyName: string;
   ownerName: string;
    monthlyRent: string;
    totalRent: string;
   evictionAffiantIs: string;
  tenantNames: ITenant[],
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
    andAllOtherOccupants: string;
   //tenantAddress: string;
   //tenantUnit: string;
   //tenantCity: string;
  // tenantState?: string;
   //tenantZip: string;
   evictionTotalRentDue?: string;
   allMonths?: string;
   evictionOtherFees?: string;
   propertyPhone?: string;
   propertyEmail?: string;
   propertyAddress?: string;
   propertyCity?: string;
   propertyState?: string;
   propertyZip?: string;
   attorneyBarNo?: string;
   attorneyEmail?: string;
   filerBusinessName?: string;
   filerPhone?: string;
   filerEmail?: string;
   expedited?: string;  
   stateCourt?: string;
   versionNumber: number;

}

// Interface for creating a Amendments
export interface ICreateAmendments extends IAmendmentsItems {
   // Additional properties specific to creating Amendments
}

// Interface for Amendments along with pagination
export interface IAmendments extends IAmendmentsBase {
   items: IAmendmentsItems[];
   totalCount: number;
   totalPages: number;
   currentPage: number;
   pageSize: number;
   searchParam?: string;
}

// Interface for a button related to Amendments
export interface IAmendmentsButton {
   title: string;
   icon: string;
   classes: string;
}

export interface IAmendmentsPdfLink {
   combinedPDFUrl: string;
}

export interface IAmendmentsSign {
   // sign: string;
   // amendmentIds: string[];
   dispoId: string | undefined;
   caseNo?: string;
   propertyName: string;
   county: string;
   // tenantFirstName: string;
   // tenantLastName: string;
   unit: string;
   city: string;
   state: string;
   zip: string;
   evictionServiceMethod: string;
   attorneyName: string;
   address: string;
   ownerName: string;
   reason: string;
   monthlyRent?: number;
   totalRent: number;
   evictionAffiantIs: string;
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
   tenant1Id?: string;
   tenant2Id?: string;
   tenant3Id?: string;
   tenant4Id?: string;
   tenant5Id?: string;
}

export interface IAmendmentsPdfLink {
   combinedPDFUrl: string;
   // pdfCount: number;
}

export interface IAmendmentsReason {
   dispoId: string;
   reason?: string;
}

export interface IFileAmendment {
   dispoId: string;
   reason?: string;
   caseNo: string;
   propertyName: string;
   county: string;
   firstName: string;
   middleName: string;
   lastName: string;
   unit: string;
   streetNo: string;
   address?: string;
   city: string;
   state: string;
   zip: string;
   evictionDateFiled: Date | null;
   evictionServiceDate: Date | null;
   lastDaytoAnswer: Date | null;
   evictionServiceMethod: string;
   courtDate: Date | null;
   dismissalFileDate: Date | null;
   writFileDate: Date | null;
   attorneyName: string;
   evictionAffiantSignature: string;
   amendedBy: string;
   amendmentAffiantSignature: string;
   amendedDate: Date | null;
}
