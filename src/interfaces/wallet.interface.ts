export interface IWallet {
    items: IWalletItems[];
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    searchParam?: string;
}
export interface IWalletItems{
    id:string;
    balance:number;
    limit:number;
    isNoLimit:boolean;
    companyName:string;
    clientId?:string;
    description?:string;
    checkNumber?:string;
}