import { AxiosResponse } from "axios";
import axios from "middlewares/axiosInstance";
import { IAccountingQueue, IAccountingQueueExportFilter, IAccountingQueueExportResource, IAccountingQueueFilter, IBillingTransactionExportFilter, IBillingTransactionFilter, IEvictionFilingTransactionExportResource, IExportCsv, IExportTransactionCsv, IFilingTransaction, IFilingTransactionExportResource, IImportExistingBillingTransactionCSV, IUpdateBillingTnxPayload } from "interfaces/filing-transaction.interface";

const getFilingTransactions = async (pageNumber: number, pageSize: number, searchParam?: string | null, type?: string | null,companyId?: string,fromDate?: Date | null,
   toDate?: Date | null,datePaidFromDate?: Date | null,datePaidToDate?: Date | null, blankOption?: string[], nonBlankOption?: string[], county?: string,state?:string) => {
   const searchParams = searchParam ? searchParam : "";
   // const headers = {
   //     'Content-Type': 'application/json',
   //   };
   
   const queryParams = new URLSearchParams({
       pageNumber: pageNumber.toString(),
       pageSize: pageSize.toString(),
       searchParam: searchParams,
       operationType:type? type: ""
   });


   // Create the payload according to \IBillingTransactionFilter
   const payload: IBillingTransactionFilter = {
      clientId: companyId? companyId:"",
      fromDate: fromDate? new Date(fromDate): null,
      toDate:toDate? new Date(toDate):null,
      fromDatePaid: datePaidFromDate? new Date(datePaidFromDate):null,
      toDatePaid:datePaidToDate? new Date(datePaidToDate):null,
      blankOption: blankOption || [], // Default to an empty array if undefined
      nonBlankOption: nonBlankOption || [], // Default to an empty array if undefined
      county: county? county:"",
      state:state??""
  };

  try {
   const response: AxiosResponse<IFilingTransaction> =
      await axios<IFilingTransaction>({
         method: "POST",
         url: `/api/BillingTransaction?${queryParams.toString()}`,
         data: payload,
      });

   return response as AxiosResponse<IFilingTransaction>;
  } catch (error) {
   console.error("Error in getFillingTransactions:", error);
       throw error;
  }
};

const getAccountingQueue = async (pageNumber: number, pageSize: number, searchParam?: string | null
   ,datePaidFromDate?: Date | null,datePaidToDate?: Date | null, type?: string, 
   payrollFromDate?: Date | null, payrollToDate?: Date | null, 
   commissionFromDate?: Date | null, commissionToDate?: Date | null,
   blankOption?: string[], nonBlankOption?: string[], county?: string,state?:string) => {
      const searchParams = searchParam ? searchParam : "";

   // const headers = {
   //     'Content-Type': 'application/json',
   //   };
   const queryParams = new URLSearchParams({
       pageNumber: pageNumber.toString(),
       pageSize: pageSize.toString(),
       searchParam: searchParams,
   });

   // Create the payload according to IAccountingQueueFilter
   const payload: IAccountingQueueFilter = {
      fromDatePaid: datePaidFromDate ? new Date(datePaidFromDate) : null,
      toDatePaid: datePaidToDate ? new Date(datePaidToDate) : null,
      type: type || undefined,
      fromDatePayroll: payrollFromDate ? new Date(payrollFromDate) : null,
      toDatePayroll: payrollToDate ? new Date(payrollToDate) : null,
      fromDateCommission: commissionFromDate ? new Date(commissionFromDate) : null,
      toDateCommission: commissionToDate ? new Date(commissionToDate): null,
      blankOption: blankOption || [], // Default to an empty array if undefined
      nonBlankOption: nonBlankOption || [], // Default to an empty array if undefined
      county: county? county:"",
      state:state??"",
  };
  try {
   const response: AxiosResponse<IAccountingQueue> =
      await axios<IAccountingQueue>({
         method: "POST",
         url: `/api/BillingTransaction/AccountingQueue?${queryParams.toString()}`,
         data: payload,
      });

   return response as AxiosResponse<IAccountingQueue>;
  } catch (error) {
   console.error("Error in getAccountingQueue:", error);
       throw error;
  }

};

// const updatePaymentAmount = async (data: UpdatePaymentResource) => {
//     const response: AxiosResponse = await axios({
//       method: "PUT",
//       url: `/api/BillingTransaction/${data.Id}`, 
//       data: {
//         PaymentAmount: data.PaymentAmount, 
//       }
//     });
  
//     return response as AxiosResponse;
//   };
  const editFilingTransactionBulk = async (payload: IUpdateBillingTnxPayload[], isAccounting: boolean) => {
   const queryParams = `?isAccounting=${isAccounting}`;
    const response: AxiosResponse =
       await axios({
          method: "PUT",
          url: `api/BillingTransaction/BulkEdit${queryParams}`,
          data: payload
       });
 
    return response as AxiosResponse;
 };

 const exportEvictionFilingTransaction = async (payload: IExportTransactionCsv, searchParam?: string | null, type?: string | null,companyId?: string,fromDate?: Date | null,
   toDate?: Date | null,datePaidFromDate?: Date | null,datePaidToDate?: Date | null, blankOption?: string[], nonBlankOption?: string[],county?: string,state?:string) => {
      const searchParams = searchParam ? searchParam : "";
      const queryParams = new URLSearchParams({
         searchParam: searchParams,
     });
     const requestPayload: IBillingTransactionExportFilter = {
      clientId: companyId? companyId:"",
      fromDate: fromDate? new Date(fromDate): null,
      toDate:toDate? new Date(toDate):null,
      fromDatePaid: datePaidFromDate? new Date(datePaidFromDate):null,
      toDatePaid:datePaidToDate? new Date(datePaidToDate):null,
      blankOption: blankOption ?? [], // Default to an empty array if undefined
      nonBlankOption: nonBlankOption ?? [], // Default to an empty array if undefined
      transactionIds: payload.transactionIds,
      filingType:"Eviction",
      county: county? county:"",
      state:state??"",
  };
    const response: AxiosResponse<IEvictionFilingTransactionExportResource[]> =
       await axios<IEvictionFilingTransactionExportResource[]>({
          method: "POST",
          url: `api/BillingTransaction/ExportEvictionFilingTransaction?${queryParams.toString()}`,
          data: requestPayload,
       });
 
    return response as AxiosResponse<IEvictionFilingTransactionExportResource[]>;
 };

 const exportAccountingQueue = async (payload: IExportCsv, searchParam?: string | null
   ,datePaidFromDate?: Date | null,datePaidToDate?: Date | null, type?: string, 
   payrollFromDate?: Date | null, payrollToDate?: Date | null, 
   commissionFromDate?: Date | null, commissionToDate?: Date | null,
   blankOption?: string[], nonBlankOption?: string[],county?: string,state?:string) => {
      const searchParams = searchParam ? searchParam : "";
      const queryParams = new URLSearchParams({
         searchParam: searchParams,
     });
     const requestPayload: IAccountingQueueExportFilter = {
      fromDatePaid: datePaidFromDate ? new Date(datePaidFromDate) : null,
      toDatePaid: datePaidToDate ? new Date(datePaidToDate) : null,
      type: type || undefined,
      fromDatePayroll: payrollFromDate ? new Date(payrollFromDate) : null,
      toDatePayroll: payrollToDate ? new Date(payrollToDate) : null,
      fromDateCommission: commissionFromDate ? new Date(commissionFromDate) : null,
      toDateCommission: commissionToDate ? new Date(commissionToDate): null,
      blankOption: blankOption ?? [], // Default to an empty array if undefined
      nonBlankOption: nonBlankOption ?? [], // Default to an empty array if undefined
      transactionIds: payload.transactionIds,
      county: county? county:"",
      state:state??""
  };
   const response: AxiosResponse<IAccountingQueueExportResource[]> =
      await axios<IAccountingQueueExportResource[]>({
         method: "POST",
         url: `api/BillingTransaction/ExportAccountingQueue?${queryParams.toString()}`,
         data: requestPayload,
      });

   return response as AxiosResponse<IAccountingQueueExportResource[]>;
};

 const exportFilingTransaction = async (payload: IExportTransactionCsv, searchParam?: string | null,
    type?: string | null,companyId?: string,fromDate?: Date | null,
   toDate?: Date | null,datePaidFromDate?: Date | null,datePaidToDate?: Date | null, blankOption?: string[], nonBlankOption?: string[],county?: string,state?:string) => {
      const searchParams = searchParam ? searchParam : "";
      // const headers = {
      //     'Content-Type': 'application/json',
      //   };
      const queryParams = new URLSearchParams({
          searchParam: searchParams,
      });
      const requestPayload: IBillingTransactionExportFilter = {
         clientId: companyId? companyId:"",
         fromDate: fromDate? new Date(fromDate): null,
         toDate:toDate? new Date(toDate):null,
         fromDatePaid: datePaidFromDate? new Date(datePaidFromDate):null,
         toDatePaid:datePaidToDate? new Date(datePaidToDate):null,
         blankOption: blankOption ?? [], // Default to an empty array if undefined
         nonBlankOption: nonBlankOption ?? [], // Default to an empty array if undefined
         transactionIds: payload.transactionIds,
         filingType: payload.filingType,
         county: county? county:"",
         state:state??""
     };
    const response: AxiosResponse<IFilingTransactionExportResource[]> =
       await axios<IFilingTransactionExportResource[]>({
          method: "POST",
          url: `api/BillingTransaction/ExportFilingTransaction?${queryParams.toString()}`,
          data: requestPayload,
       });
 
    return response as AxiosResponse<IFilingTransactionExportResource[]>;
 };
 const reImportFilingTransaction = async (fileEviction: IImportExistingBillingTransactionCSV[], headers: string[], type: string) => {
   // Serialize headers array as a comma-separated string or JSON (depending on what the backend expects)
   const queryParams = new URLSearchParams();// Comma-separated string, or use JSON.stringify(headers) if backend expects JSON format.
   headers.forEach(header => {
      queryParams.append("headers", header);
    });
    queryParams.append("type", type ?? "");
 
   try {
     const response: AxiosResponse = await axios({
       method: "POST",
       url: `api/BillingTransaction/ImportExistingTransactionCases?${queryParams.toString()}`,
       data: fileEviction,  // This is the body of the request
     });
 
     return response;  // Return the Axios response
   } catch (error) {
     console.error("Error importing filing transaction:", error);
     throw error;  // Rethrow or handle error as needed
   }
 };
 

const FilingTransactionService = {
   getFilingTransactions,
   getAccountingQueue,
//    updatePaymentAmount,
   editFilingTransactionBulk,
   exportEvictionFilingTransaction,
   exportAccountingQueue,
   exportFilingTransaction,
   reImportFilingTransaction,
};

export default FilingTransactionService;