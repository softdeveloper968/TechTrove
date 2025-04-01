export interface ITransaction {
    items: ITransactionItems[];
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    searchParam?: string;
    fromDate?:Date|null;
    toDate?:Date|null;
    companyId?:string|null; 
    isC2CCard?:boolean|null;
}
export interface ITransactionItems{
    id:string;
    createdDate:Date | null;
    description:number;
    amount:number;
    remainingAmount:number;
    isDebit:boolean;
    checkNumber:string;
    transactionReferenceId?:number;
    isC2CCard:boolean;
    companyName?:string;
    type?:number;
}

export interface ICaseTransHistroryItems{
   id:string;
   caseNo:string;
   county:string;
   propertyName:string;
   isC2CCard: boolean;
   isExpedited:boolean;
   amount:number;
   caseType:string;
}

export interface IExportTransaction{
    transactionReferenceId:number,
    company:string,
    caseNo:string,
    filingType:string,
    county:string,
    property:string,
    caseType:string,
    description:string,
    checkNumber:string,
    paymentAccount:string
    transactionType:string,
    transactionDate:string,
    amount:number,  
    balance:number,  
}