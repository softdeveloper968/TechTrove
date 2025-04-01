import axios from "middlewares/axiosInstance";
import { AxiosResponse } from "axios";
import {
  ICreateAmendments, IAmendmentsSign,
  IAmendments,
  IAmendmentsItems
} from "interfaces/amendments.interface";
import { DocumentReviewResponse } from "interfaces/all-cases.interface";
import { IExportCsv } from "interfaces/common.interface";
import { ExportAmendmentsResponse } from "interfaces/export-late-notices.interface";
import { ExportUnservedQueueItems, IUnservedQueue } from "interfaces/service-tracker.interface";

/**
 * add Amendments
 * @returns amendments created successfully or not
 */
const createAmendments = async (amendments: ICreateAmendments[]) => {
  const response: AxiosResponse<ICreateAmendments> =
    await axios<ICreateAmendments>({
      method: "POST",
      url: `api/`,
      data: amendments,
    });

  return response as AxiosResponse<ICreateAmendments>;
};


const FileAmendment= async (
  AllCasesIDsWithReason: IAmendmentsSign[]
)=>{
  const response: AxiosResponse = await axios({
    method: "POST",
    url: `/api/Amendments/FileAmendment`,
    data: AllCasesIDsWithReason,
  });

  return response as AxiosResponse<IAmendmentsSign>;
};
/**
 * fetch list of amendments from api
 * @param userID get all amendments by user id
 * @returns list of all amendments
 */
// const getAllAmendments = async (
//   pageNumber: number,
//   pageSize: number,
//   searchParam?: string
// ) => {
//   const url: string = searchParam ? `/api/` : `/api/`;

//   const response: AxiosResponse<IAmendments> = await axios<IAmendments>({
//     method: "GET",
//     url: url,
//   });

//   return response as AxiosResponse<IAmendments>;
// };


const getAllAmendments = async (
  pageNumber: number,
  pageSize: number,
  isSigned:boolean,
  searchParam?: string,

) => {
  
  const url: string = searchParam
    ? `/api/Amendments/${pageNumber}/${pageSize}?searchParam=${searchParam}&isSigned=${isSigned}`
    : `/api/Amendments/${pageNumber}/${pageSize}?isSigned=${isSigned}`;
  const response: AxiosResponse<IAmendments> = await axios<IAmendments>({
    method: "GET",
    url: url,
  });
  
  return response as AxiosResponse<IAmendments>;
};

const getAllUnservedAmendments = async (
  pageNumber: number,
  pageSize: number,
  searchParam?: string,

) => {
  const params: Record<string, any> = {};

  if (searchParam) params.searchParam = searchParam;
  const queryString = new URLSearchParams(params).toString();
  const url: string = `/api/Amendments/Unserved/${pageNumber}/${pageSize}?${queryString}`;
  const response: AxiosResponse<IUnservedQueue> = await axios<IUnservedQueue>({
    method: "GET",
    url: url,
  });
  
  return response as AxiosResponse<IUnservedQueue>;
};


/**
 * delete amendments
 * @returns
 */
const deleteAmendments = async (amendmentsIDs: string[]) => {
  const response: AxiosResponse<IAmendmentsItems[]> = await axios<
    IAmendmentsItems[]
  >({
    method: "DELETE",
    url: `/api/Amendments`,
    data: amendmentsIDs,
  });

  return response as AxiosResponse<IAmendmentsItems[]>;
};

/**
 *
 * @param amendmentsIDs selected amendments id
 * @returns pdf link
 */
const getAmendmentsDocumentForSign = async (amendmentSign: IAmendmentsSign[]) => {
  
  const response:  AxiosResponse<DocumentReviewResponse> = await axios({
      method: "POST",
      url: `/api/Amendments/AmendmentReview`,
      data: amendmentSign,
    });

    return response as AxiosResponse<DocumentReviewResponse>;
};

/**
 * sign  Amendments
 * @returns
 */

const signAmendments = async (amendmentsSign: IAmendmentsSign) => {
  const response: AxiosResponse = await axios({
    method: "POST",
    url: `/api/Amendments/SignAmendment`,
    data: amendmentsSign,
  });

  return response as AxiosResponse;
};

const exportAmendments = async (payload: IExportCsv, searchParam?: string) => {
   const response: AxiosResponse<ExportAmendmentsResponse[]> =
      await axios<ExportAmendmentsResponse[]>({
         method: "POST",
         url: `api/Amendments/ExportAmendments?searchParam=${searchParam}`,
         data: payload,
      });

   return response as AxiosResponse<ExportAmendmentsResponse[]>;
};

const exportUnservedAmendments = async (caseIDs: string[], searchParam?: string) => {

  const response: AxiosResponse<ExportUnservedQueueItems[]> =
     await axios<ExportUnservedQueueItems[]>({
        method: "POST",
        url: `api/Amendments/ExportUnservedAmendments?searchParam=${searchParam}`,
        data: caseIDs,
     });

  return response as AxiosResponse<ExportUnservedQueueItems[]>;
};

const AmendmentsService = {
  createAmendments,
  getAllAmendments,
  getAllUnservedAmendments,
  deleteAmendments,
  getAmendmentsDocumentForSign,
  signAmendments,
  FileAmendment,
  exportAmendments,
  exportUnservedAmendments
};

export default AmendmentsService;
