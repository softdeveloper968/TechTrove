export interface ISinglePaymentItems {
    payerName: string;
    transactionId: string
    type: string;
    amount: number | null;
    createdDate: Date | string | null;
  };

  export interface ISinglePayment {
    items: ISinglePaymentItems[];
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    searchParam?: string;
  };