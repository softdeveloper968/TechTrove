
// Interface for user login request
export interface IUserLogin {
  email: string;
  password: string;
}

// Interface for user registration process, extends IUserLogin
export interface IUserRegistration extends IUserLogin {
  firstName: string;
  lastName: string;
  confirmPassword: string;
}

// Interface for the response of the login API
export interface ILoginResponse {
  userID: string;
  token: string;
  expirationTime: any; // Adjust the type according to the actual data type
  isActive?:boolean|null;
  unsignedAmendmentCount: number;
  unsignedDismissalCount:number;
  unsignedWritCount:number;
  unsignedEvictionApprovalCount: number;
  unsignedEvictionDismissalCount: number;
  states: IStates[];
}

// Generic interface for API responses with optional generic data type
export interface IApiResponse<T = undefined> {
  status: number;
  message?: string;
  data: T;
  errors: null;
  operationSuccess: boolean;
  statusCode: number;
}

// Interface for resetting password
export interface IResetPassword {
  userId: string | null;
  code: string | null;
  password: string;
  isNewAccount: boolean;
}

export interface IVerifyEmail{
  userId: string | null;
  code: string | null;
}

// Interface for decoded JWT token
export interface IJWTDecodedToken {
  Email: string;
  FirstName: string;
  LastName: string;
  ClientID: string;
  UserID: string;
  UserCompany:string;
  PhoneNumber:string;
  aud: string;
  exp: number;
  iss: string;
  jti: string;
  UserRoles: string[];
  PermittedStates:string[];
}

// Comments and Suggestions:
// - Used clear and concise comments for explaining the purpose of each interface.
// - Followed a consistent naming convention for interfaces.
// - Added a comment to adjust the type in the ILoginResponse interface according to the actual data type.
export interface IErrorResponse {
  statusCode: number;
  message: string;
}

export interface IUnsignedCaseCount {
  unsignedAmendment: number;
  unsignedDismissal: number;
  unsignedWrit: number;
  unsignedEvictionApprovalCount: number;
  unsignedEvictionDismissalCount: number;
};

export interface IStates {
  stateId: string;
 stateName: string;
};

// export interface ISignedEvictionCaseCount {
//   signedApprovalCount: number;
//   signedDismissalCount: number;
// };


export interface IProperties {
   items: IPropertyItems[];
   currentPage: number;
   pageSize: number;
   totalCount: number;
   totalPages: number;
   searchParam?: string;
};

export interface IPropertyItems {
   id?: string;
   propertyName: string;
   propertyCode?: number;
   propertyAddress: string;
   propertyCity: string;
   propertyState: string;
   propertyZip: string;
   propertyPhone: string;
   propertyEmail: string;
   numberOfUnits: number;
   clientId?:string;
   companyName?:string;
}
 
// export interface IPropertyFormValues {
//    id: string;
//    propertyName: string;
//    propertyAddress: string;
//    propertyCity: string;
//    propertyState: string;
//    propertyZip: string;
//    propertyPhone: string;
//    propertyEmail: string;
//    numberOfUnits: number;
// }

export type PropertyFormModeType = "create" | "edit";