import { AxiosResponse } from "axios";
import axios from "middlewares/axiosInstance";
import { ICreateInvoiceFormValues, IPreviewInvoiceResponse, ISendInvoiceEmail } from "interfaces/invoices.interface";
import Period from "pages/accounting/dashboard/Period";

const authorize = async () => {
   const response: AxiosResponse =
      await axios({
         method: "GET",
         url: `/api/QuickBooks/Authorize`,
      });

   return response as AxiosResponse;
};

const callback = async (code: string, state: string) => {
   const response: AxiosResponse =
      await axios({
         method: "GET",
         url: `/api/QuickBooks/Callback?code=${code}&state=${state}`,
      });

   return response as AxiosResponse;
};

const getInvoices = async (startPosition: number, maxResults: number, searchParam?: string | null) => {
   const searchParams = searchParam === undefined ? "" : searchParam;
   const response: AxiosResponse =
      await axios({
         method: "GET",
         url: `/api/Invoices?startPosition=${startPosition}&maxResults=${maxResults}&searchParam=${searchParams}`,
      });

   return response as AxiosResponse;
};

const getInvoiceStatusDetails = async (periodValue: Period, fromDate: Date|null, toDate: Date|null) => {
    try {
        const fromDateUTC = fromDate ? new Date(fromDate).toDateString() : "";
    const toDateUTC = toDate ? new Date(toDate).toDateString() : "";
    const queryParams = `?fromDate=${fromDateUTC}&toDate=${toDateUTC}`;
        const response: AxiosResponse =
        await axios({
            method: "GET",
            url: `/api/Accounting/GetInvoicesStatus/${periodValue.valueOf()}${queryParams}`,
        });
    return response as AxiosResponse;
        
    } catch (error) {
        console.error('Error fetching company details:', error);
        throw error;
    }
 };

 const getRecentInvoices = async () => {
    try {
        const response: AxiosResponse =
        await axios({
            method: "GET",
            url: `/api/Accounting/GetRecentInvoices`,
        });
    return response as AxiosResponse;
    } catch (error) {
        console.error('Error fetching company details:', error);
        throw error;
    }
 };

const getCustomers = async () => {
   const response: AxiosResponse =
      await axios({
         method: "GET",
         url: `/api/Customers`,
      });

   return response as AxiosResponse;
};

const previewInvoice = async (invoiceId: string) => {
   const response: AxiosResponse =
      await axios<IPreviewInvoiceResponse>({
         method: "GET",
         url: `/api/Invoices/PreviewInvoice?invoiceId=${invoiceId}`,
      });

   return response as AxiosResponse<IPreviewInvoiceResponse>;
};

const previewInvoiceDetail = async (invoiceId: string) => {
   const response: AxiosResponse =
      await axios<IPreviewInvoiceResponse>({
         method: "GET",
         url: `/api/Invoices/GetInvoiceDetailPDF?invoiceId=${invoiceId}`,
      });

   return response as AxiosResponse<IPreviewInvoiceResponse>;
};

const createInvoices = async (payload: ICreateInvoiceFormValues) => {
   const response: AxiosResponse =
      await axios({
         method: "POST",
         url: `/api/Invoices/Create`,
         data: payload
      });

   return response as AxiosResponse;
};

const createBillingInvoices = async (payload: ICreateInvoiceFormValues) => {
   const response: AxiosResponse =
      await axios({
         method: "POST",
         url: `/api/Invoices/CreateBillingInvoice`,
         data: payload
      });

   return response as AxiosResponse;
};

const sendInvoiceEmail = async (payload: ISendInvoiceEmail) => {
   const response: AxiosResponse =
      await axios({
         method: "POST",
         url: `/api/Invoices/SendEmail`,
         data: payload
      });

   return response as AxiosResponse;
};

const InvoicesService = {
   authorize,
   callback,
   getInvoices,
   getInvoiceStatusDetails,
   getRecentInvoices,
   getCustomers,
   previewInvoice,
   previewInvoiceDetail,
   createInvoices,
   createBillingInvoices,
   sendInvoiceEmail
};

export default InvoicesService;