import axios from "middlewares/axiosInstance";
import { AxiosResponse } from "axios";
/**
 * Get a paginated list of all transaction.
 * @param pageNumber The page number.
 * @param pageSize The number of items per page.
 * @returns AxiosResponse containing the list of transaction.
 */
const getAllTransactions = async (
  pageNumber: number,
  pageSize: number,
  searchParam: string,
  fromDate?: Date | null,
  toDate?: Date | null,
  companyId?: string,
  isC2CCard?: boolean | null
) => {
  
  // Construct the query parameters conditionally
  const params: Record<string, any> = {};

  if (searchParam) params.searchContent = searchParam;
  if (fromDate) params.fromDate = fromDate.toUTCString(); 
  if (toDate) params.toDate = toDate.toUTCString();
  if (companyId) params.companyId = companyId;
  if (isC2CCard !== null && isC2CCard !== undefined) params.isC2CCard = isC2CCard;

  const queryString = new URLSearchParams(params).toString();
  const response: AxiosResponse = await axios.get(
    `/api/Accounting/GetTransactions/${pageNumber}/${pageSize}?${queryString}`
  );

  return response;
};

const getCaseTransactionHistory=async (id:string)=>{  
  const response: AxiosResponse = await axios.get(
    `/api/Accounting/GetCaseTransHistory/${id}`
  );

  return response;
}

const exportTransactions = async (  
  searchParam: string,
  fromDate?: Date | null,
  toDate?: Date | null,
  companyId?: string,
  isC2CCard?: boolean | null
) => {
  
  const params: Record<string, any> = {};

  if (searchParam) params.searchContent = searchParam;
  if (fromDate) params.fromDate = fromDate.toUTCString(); 
  if (toDate) params.toDate = toDate.toUTCString();
  if (companyId) params.companyId = companyId;
  if (isC2CCard !== null && isC2CCard !== undefined) params.isC2CCard = isC2CCard;

  const queryString = new URLSearchParams(params).toString();
  const response: AxiosResponse = await axios.get(
    `/api/Accounting/ExportTransactions?${queryString}`
  );

  return response;
};
const TransactionService = {
  getAllTransactions,
  getCaseTransactionHistory,
  exportTransactions
};

export default TransactionService;