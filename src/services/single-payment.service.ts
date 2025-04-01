import { AxiosResponse } from "axios";
import axios from "middlewares/axiosInstance";
import { ISinglePayment } from "interfaces/single-payment.interface";



/**
 * fetch list of AllCases from api
 * @param userID get all AllCases by user id
 * @returns list of all AllCases
 */
const getAllPayments = async (
  pageNumber: number,
  pageSize: number,
  searchParam?: string,
): Promise<AxiosResponse<ISinglePayment>> => {
  
  // Construct the query parameters object
  const queryParams: Record<string, string> = {
    searchParam: searchParam ?? '',
  };

  // Create the URLSearchParams object
  const queryString = new URLSearchParams(queryParams).toString();

  // Construct the URL with the query parameters
  const url = `/api/Payment/GetAllPaymentRecords/${pageNumber}/${pageSize}?${queryString}`;

  // Make the API call
  const response: AxiosResponse<ISinglePayment> = await axios.get<ISinglePayment>(url);

  return response;
};


const SinglePaymentService = {

  getAllPayments,
};

export default SinglePaymentService;
