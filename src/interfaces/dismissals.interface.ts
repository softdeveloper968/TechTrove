import { ICrmInfo, ITenant } from "./all-cases.interface";

// Base interface for common properties
export interface IDismissalsBase {
    isChecked?: boolean;
    id?: string;
  }
  
  // Interface for items displayed in the Dismissals screen
  export interface IDismissalsItems extends IDismissalsBase {
    caseNo: string;
    //dismissalPdfs :string 
    documents:string;
    propertyName: string;
    county: string;
    firstName: string;
    lastName: string;
    unit: string;
    address?: string;
    city: string;
    state: string;
    zip: string;    
    //dismissalFiledDate : Date | null;
    filed: Date | null;
    signedBy:string;
    evictionAffiantSignature:string;
    //dismissalAffiantSignature  : string;
    companyName:string;
    tenantNames: ITenant[],
    andAllOtherOccupants: string;
    crmInfo: ICrmInfo;
    reason?:string;
  }
  
  // Interface for creating a Dismissals
  export interface ICreateDismissals extends IDismissalsItems {
    // Additional properties specific to creating a Dismissals
  }
  
  // Interface for dismissals along with pagination
  export interface IDismissals extends IDismissalsBase {
    items: IDismissalsItems[];
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    searchParam?: string;
    isViewAll?:boolean;
  }
  
  // Interface for a button related to dismissals
export interface IDismissalsButton {
    title: string;
    icon: string;
    classes: string;
  }

export interface IDismissalsPdfLink {
    combinedPDFUrl: string;
  }

  export interface IDismissalsSign {
    sign: string;
    dismissalsIds: string[];
  }


export interface IDismissalsPdfLink {
  combinedPDFUrl: string;
}

  