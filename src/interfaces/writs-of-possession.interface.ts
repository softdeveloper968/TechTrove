import { ITenant } from "./all-cases.interface";
import { SortingOption } from "./common.interface";

// Base interface for common properties
export interface IWritsOfPossessionBase {
    isChecked?: boolean;
    id?: string;
  }
  
  // Interface for items displayed in the Writs Of Possession screen
  export interface IWritsOfPossessionItems extends IWritsOfPossessionBase {
    caseNo: string;
    documentsPdf: Document[];
    documents:string 
    propertyName: string;
    county: string;
    firstName: string;
    lastName: string;
    unit: string;
    address?: string;
    city: string;
    state: string;
    zip: string;
    dateFiled: Date | null;
    // evictionServiceDate: Date | null;
   // lastDaytoAnswer: Date | null;
    //courtDate: Date | null;
   // writFileDate: Date | null;
    writLabor : string;
   // writAffiantSignature : string;
    amended : string;
    answerBy:string;
    dateServed:string;
    evictionAffiantSignature:string;
    signedBy:string;
    writDateFiled?: string;
    setOutNotes?:string;
    setOutScheduled?:boolean|null;
    setOutCompleted?:boolean|null;
    setOutCompletedDate?:Date|null;
    writCancelled?:boolean|null;
    companyName:string;
    tenantNames: ITenant[];
    andAllOtherOccupants: string;
    reason: string | null;
    writOrderDate: Date | string | null,
    paymentAmountOwned: string | null;
    paymentDueOn: Date | string | null;
    writComment: string;
    hasSSN: boolean;
    writLaborId: string;
    writApplicantIs: string;
    writApplicantPhone: string;
    isCorporation: boolean;
    versionNumber: number;
  }
  
  // Interface for creating a Writs Of Possession
  export interface ICreateWritsOfPossession extends IWritsOfPossessionItems {
    // Additional properties specific to creating a Writs Of Possession
  }
  
  // Interface for WritsOFPossession along with pagination
  export interface IWritsOfPossession extends IWritsOfPossessionBase {
    items: IWritsOfPossessionItems[];
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    searchParam?: string;
    writsOfPossessionPdfLink: string;
    sortings: SortingOption[]
  }
  
  // Interface for a button related to writs of possession
export interface IWritsOfPossessionButton {
    title: string;
    icon: string;
    classes: string;
  }

export interface IWritsOfPossessionPdfLink {
    combinedPDFUrl: string;
  }

  export interface IWritsOfPossessionSign {
    sign: string;
    writsOfPossessionIds: string[];
  }


export interface IWritsOfPossessionPdfLink {
  combinedPDFUrl: string;
}

export interface IWritCaseDocument {
  id: string;
  type: string;
  url: string;
};