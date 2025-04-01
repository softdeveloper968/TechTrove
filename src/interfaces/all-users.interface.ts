import { IPropertyItems } from "./user.interface";

export interface IUserItems {
   id?: string;
   isActive?: boolean;
   email?: string;
   lastName: string;
   firstName: string;
   password?: string;
   role?: string;
   userCompanyId?: string;
   confirmPassword?: string;
   phoneNumber: string;
   emailConfirmed?: boolean;
   isPasswordSet?: boolean;
   createdDate?: Date;
   userCompany?: ICompanyItems;
   processServerDocuments?: IProcessServerDocument[];
   statesPermitted?: string[];
   companyProperties?:string[];
}
export interface IProcessServerDocument {
   //courtId:string;
   id?: string;
   courtCode: string;
   courtName: string;
   countyName: string;
   pdfBase64: string;
   docUri?: string;
   fileName?: string;
}

// Interface for users along with pagination
export interface IUsers {
   items: IUserItems[];
   currentPage: number;
   pageSize: number;
   totalCount: number;
   totalPages: number;
   searchParam?: string;
}

export interface ICompanyItems {
   id: string;
   companyName: string;
   phone: string;
   clientType: string;
   addressLine1: string;
   addressLine2: string;
   city: string;
   state: string;
   postalCode: string;
   email: string;
   billingEmail: string;
   notes: string;
   tylerUserId: string | null;
   casperUserId: string | null;
   isProcessServer: boolean;
   limit: number;
   isNoLimit: boolean;
   billingAddress: string;
   billingCity: string;
   billingCountrySubDivisionCode: string;
   billingPostalCode: string;
   statesPermitted: string[];
   isPropertySpecific:boolean;
   isParentCompany:boolean;
   tylerUserTXId:string|null;
}


export interface ICompany {
   items: ICompanyItems[];
   currentPage: number;
   pageSize: number;
   totalCount: number;
   totalPages: number;
   searchParam?: string;
}

export interface IChangePassword {
   userId?: string;
   oldPassword: string;
   newPassword: string;
   confirmPassword: string;
}

export interface IStatePermitted {
   stateId: string;
   stateName: string;
}
