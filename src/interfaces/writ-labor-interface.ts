export interface IWritlaborItems {
    id?: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone:string;
    clientId?:string;   
    client?:ICompanyItems;
    isUser?:boolean
  }
  // Interface for users along with pagination
  export interface IWritLabor {
    items: IWritlaborItems[];
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    searchParam?: string;
  }

  export interface ICompanyItems {
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
  