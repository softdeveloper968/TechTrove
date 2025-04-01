export interface IInvoice {
   items: IInvoiceItem[];
   currentPage: number;
   pageSize: number;
   totalCount: number;
   totalPages: number;
   searchParam?: string;
};

export interface IInvoiceItem {
   id: string;
   dueDate: string;
   docNumber: string;
   totalAmt: string;
   customerRef: ICustomerRef;
   status: string;
   line: IGroupLine[];
   metaData: IMetaData;
   emailStatus: string;
   billEmail: IBillEmail;
};

export interface ICustomerRef {
   value: string;
   name: string
};

export interface IGroupLine {
   detailType: string;
   description: string;
};

interface IMetaData {
   createTime: string;
};

interface IBillEmail {
   address: string;
};

export interface ICreateInvoiceFormValues {
   clientId: string;
   invoiceMonthYear: Date | null;
};

export interface ISendInvoiceEmail {
   invoiceId: string;
   email: string | null
};

export interface InvoiceAnalytics {
   status: string;
   statusCount: number;
};


export interface InvoiceAnalytics {
   status: string;
   statusCount: number;
};

export interface RecentInvoicesItems {
   DocNumber: string;
   TotalAmt: number; 
   DueDate: string;
   Status: string;
};

export interface IPreviewInvoiceResponse {
   isSuccess: boolean;
   message: string;
   base64String: string;
};