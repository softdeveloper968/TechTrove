export type TylerFormMode = "create" | "edit" | "clone";

export interface IRadioOption {
    id: string;
    value: string;
};

export interface ISelectOptions {
    id: number | string;
    value: string;
    disabled?: boolean
};

export interface ITylerLoginRequest {
    userName: string;
    password: string;
    firstName: string;
    lastName: string;
    paymentName: string;
    hasAttorney: boolean;
};

export interface ITylerLoginUpdateRequest extends ITylerLoginRequest {
    id: string;
};

export interface ITylerLoginResponse {
    id: string;
    username: string;
    paymentName: string;
    hasAttorney: boolean;
};

export interface ITylerUserItems {
    id: string;
    userName: string;
    password: string;
    firstName: string;
    lastName: string;
    paymentName: string;
    hasAttorney: boolean;
    isDefaultPayment:boolean;
    state?:string;
    courtPayments:ICourtPayment[];
};

export interface ICourtPayment{
    //courtId:string;
    courtName:string;
    courtCode:string;
    filingType:string;
    state:string;
    paymentName:string;
    isC2CCard:boolean;
}

export interface ITylerFormValues extends ITylerUserItems {
    password: string;
    firstName: string;
    lastName: string;
}

export interface ITylerUser {
    items: ITylerUserItems[];
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    searchParam?: string;
};

export interface ITylerConfigOptionalService {
    optionalServiceName?: string;
    optionalServiceCode?:string;
    quantity: number | "" | null;
    maxQuantity: number | "" | null;
    isDefendantCount: boolean;
    isAdditionalDefendantCount: boolean;
    isAllOther: boolean;
};

export interface ITylerConfigItems {
    id: string;
    feeCalcOnly: boolean;
    maxPayment: number;
    ccEmail: string;
    preliminaryCopyEmail: string;
    countyName: string;
    locationCode:string;
    locationName: string;
    state: string;
    // locationCode: string;
    caseTypeCode:string;
    caseTypeName: string;
    filingCode:string;
    filingCodeName: string;
    filingDescription: string;
    optionalService: ITylerConfigOptionalService[];
    fileIntoExistingCase:boolean;
    courtType:string;
    filingType:string;
    requiredSupplementDoc: boolean;
    supplementCode: string;
    supplementCodeName: string;
    supplementDescription: string;
    isActive:boolean;
    caseCategoryCode?:string
    caseCategoryName?:string
};

export interface ITylerConfig {
    items: ITylerConfigItems[];
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    searchParam?: string;
};

export interface ITylerConfigRequest {
    feeCalcOnly: boolean;
    maxPayment: number | null;
    ccEmail: string;
    preliminaryCopyEmail: string;
    countyName: string;
    locationCode :string;
    locationName: string;
    state: string;
    // locationCode: string;
    caseTypeCode: string;
    caseTypeName: string;
    filingCode:string;
    filingCodeName: string;
    filingDescription: string;
    optionalService: ITylerConfigOptionalService[];
    fileIntoExistingCase:boolean;
    courtType:string;
    filingType:string;
    requiredSupplementDoc: boolean;
    supplementCode: string;
    supplementCodeName: string;
    supplementDescription: string;
    isActive:boolean;
    caseCategoryCode:string;
    caseCategoryName:string;
};

export interface ITylerConfigResponse {
    id: string;
};

export interface ITylerConfigFormValues extends ITylerConfigRequest {
    // id: "",
    id: string;
};

export interface DataList{
    code:string;
    name:string;
};
export interface ConfigStatusResource {
    id: string; // Guid in .NET corresponds to string in TypeScript
    isActive: boolean;
}