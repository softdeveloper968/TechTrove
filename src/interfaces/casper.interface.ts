export type CasperFormMode = "create" | "edit";

export interface ICasperLoginAddRequest {
   userName: string;
   password: string;
   isDefault: boolean;
   name:string;
   // firstName: string;
   // lastName: string;
};

export interface ICasperLoginUpdateRequest extends ICasperLoginAddRequest {
   id: string;
};

export interface ICasperUserItem {
   id: string;
   userName: string;
   password: string;
   isDefault: boolean;
   name:string;
   isC2CCard:boolean;
   // firstName: string;
   // lastName: string;
};

export interface ICasperUser {
   items: ICasperUserItem[];
   currentPage: number;
   pageSize: number;
   totalCount: number;
   totalPages: number;
   searchParam?: string;
};

export interface ICasperFormValues extends ICasperUserItem {
   password: string;
   isDefault: boolean;
   name:string;
   // confirmPassword: string;
   // firstName: string;
   // lastName: string;
};