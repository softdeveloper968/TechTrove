export interface ICustomer {
    items: ICustomerItems[];
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    searchParam?: string;
}

export interface ICustomerItems {
    companyName?: string;
    email?: string;
    refId: string;
    createdAt: Date;
}

export interface ICustomerFormItems {
    id:string;
}
export interface ICustomerFormValues extends ICustomerFormItems {
};

export type CustomerFormMode = "create" | "edit";
