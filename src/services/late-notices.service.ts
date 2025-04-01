import axios from "middlewares/axiosInstance";
import {
  IConfirmDelinquenciesImportItems,
  ICreateLateNotice,
  ILateNoticeEmail,
  ILateNotice_CreateNoticeEmail, ILateNotice_SignProofInfo,
  ILateNotices,
  ILateNoticesItems,
  INVEvictionExportEmail,
  IRemoveTenantNotice,
  IResponse,
  ISendNoticeEmail,
  ISendNoticeExportEmail
} from "interfaces/late-notices.interface";
import { ExportAllNoticesResource, ExportNVEvictionsResource, UnsignedDispoResource } from "interfaces/export-late-notices.interface";

import { AxiosResponse } from "axios";

/**
 * fetch list of late notices from api
 * @param userID get all late notices by user id
 * @returns list of all late notices
 */
const getAllLateNotices = async (
  pageNumber: number,
  pageSize: number,
  searchParam?: string,
  county?: string,
  filingType?: boolean | null,  // keep filingType as boolean | null
  status: number = 0,
) => {
  let url = `api/LateNotices/GetLateNoticesByUserIDAndSearchParam/${pageNumber}/${pageSize}`;
  
  const params = new URLSearchParams();

  if (searchParam) {
    params.append('searchParam', searchParam);
  }

  if (county) {
    params.append('county', county);
  }

  if (filingType !== undefined && filingType !== null) {
    params.append('isAutomation', String(filingType));  // Convert boolean to string
  }

  // if (isServed !== undefined && isServed !== null) {
  //   params.append('isServerd', String(isServed));  // Convert boolean to string
  // }

  params.append('status', String(status));
  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const response: AxiosResponse<ILateNotices> = await axios<ILateNotices>({
    method: "GET",
    url: url,
  });

  return response as AxiosResponse<ILateNotices>;
};




/**
* export all late notices from database

 */
// const exportAllLateNotices = async () => {
//   const response: AxiosResponse<UnsignedDispoResource[]> =
//     await axios<UnsignedDispoResource[]>({
//       method: "GET",
//       url: "api/LateNotices/GetAllLateNotices",
//     });

//   return response as AxiosResponse<UnsignedDispoResource[]>;
// };

const exportAllLateNotices = async (allSelectedIDs: string[],tabName: string) => {
  const requestData = {
    allSelectedIDs: allSelectedIDs,
    tabName: tabName || "" // Ensure type is always provided, defaulting to an empty string if not provided
  };
  const response: AxiosResponse<ExportAllNoticesResource[]> =
    await axios<ExportAllNoticesResource[]>({
      method: "POST",
      url: `api/LateNotices/GetAllLateNotices`,
      data: requestData,
    });

  return response as AxiosResponse<ExportAllNoticesResource[]>;
};

/**
 * export all NV file evictions from database
 */
const exportNVEvictions = async (resource: INVEvictionExportEmail,searchParam?: string) => {
  const queryParams: Record<string, string> = {
    searchParam: searchParam ?? '',
  };
  const queryString = new URLSearchParams(queryParams).toString();
  const response: AxiosResponse<ExportNVEvictionsResource> =
     await axios<ExportNVEvictionsResource>({
        method: "POST",
        url: `api/FileEviction/ExportNVEvictions?${queryString}`,
        data: resource,
     });

  return response as AxiosResponse<ExportNVEvictionsResource>;
};

/**
 * fetch list of late notices from api
 * @param userID get all late notices by user id
 * @returns list of all late notices
 */

const getSignedLateNotices = async (pageNumber: number, pageSize: number,searchParam?: string) => {
  
  const queryParams: string = `?searchParam=${searchParam ?? ''}`;
  const response: AxiosResponse<ILateNotices> = await axios<ILateNotices>({
    method: "GET",
    url: `api/LateNotices/GetAllSignedNotices/${pageNumber}/${pageSize}${queryParams}`,
  });

  return response as AxiosResponse<ILateNotices>;
};

/**
 * add late notices
 * @returns
 */
const createLateNotice = async (lateNotice: ICreateLateNotice[]) => {
  const response: AxiosResponse<ICreateLateNotice> = await axios({
    method: "POST",
    url: `api/LateNotices/CreateTenantNotice`,
    data: lateNotice,
  });

  return response as AxiosResponse;
};

/**
 * delete late notices
 * @returns
 */
const deleteLateNotice = async (tenantNoticeIDs: IRemoveTenantNotice) => {
  const response: AxiosResponse<ILateNoticesItems[]> = await axios<
    ILateNoticesItems[]
  >({
    method: "DELETE",
    url: `/api/LateNotices/RemoveTenantNotices`,
    data: tenantNoticeIDs,
  });

  return response as AxiosResponse<ILateNoticesItems[]>;
};

/**
 * send late notices
 * @returns
 */
const sendLateNoticeEmail = async (lateNoticeRequest: ILateNoticeEmail) => {
  const response: AxiosResponse<ILateNotice_CreateNoticeEmail> =
    await axios<ILateNotice_CreateNoticeEmail>({
      method: "POST",
      url: `/api/LateNotices/CreateNotices`,
      data: lateNoticeRequest,
    });

  return response as AxiosResponse<ILateNotice_CreateNoticeEmail>;
};
/**
 * get selected late notices link
 * @returns
 */
const createNoticeLink = async (lateNoticeRequest: ILateNoticeEmail,type?: string) => {
  
  const response: AxiosResponse<ILateNotice_CreateNoticeEmail> =
    await axios<ILateNotice_CreateNoticeEmail>({
      method: "POST",
      url: `api/LateNotices/CreateNoticeLink/?type=${type}`,
      data: lateNoticeRequest,
    });

  return response as AxiosResponse<ILateNotice_CreateNoticeEmail>;
};


const signInProofEmail = async (lateNotice: ILateNotice_SignProofInfo) => {
  const response: AxiosResponse = await axios({
    method: "POST",
    url: `/api/LateNotices/SignNotices`,
    data: lateNotice,
  });

  return response as AxiosResponse;
};

/**
 *
 * @param lateNotice we will send pdf link plus email
 * @returns download link
 */
const sendNoticesEmail = async (lateNotice: ISendNoticeEmail) => {
  const response: AxiosResponse = await axios({
    method: "POST",
    url: `/api/LateNotices/SendNoticesEmail`,
    data: lateNotice,
  });

  return response as AxiosResponse<IResponse>;
};

/**
 *
 * @param lateNotice we will send pdf link plus email
 * @returns download link
 */
const sendExportNoticesEmail = async (lateNotice: ISendNoticeExportEmail) => {
  const response: AxiosResponse = await axios({
    method: "POST",
    url: `/api/LateNotices/SendExportNoticesEmail`,
    data: lateNotice,
  });

  return response as AxiosResponse<IResponse>;
};
const getNoticeDocument = async (
  caseIds: string[]
) => {
  const response: AxiosResponse =
     await axios<string>({
        method: "POST",
        url: `/api/LateNotices/CreateDelinqencyNotice`,
        data: caseIds,
     });
  return response as AxiosResponse;   
};

const sendForService = async (
  caseIds: string[]
) => {
  const response: AxiosResponse =
     await axios<string>({
        method: "POST",
        url: `/api/LateNotices/SendForService`,
        data: caseIds,
     });
  return response as AxiosResponse;   
};

const getConfirmDelinquenciesQueue = async (currentPage: number, pageSize: number, isConfirmed: boolean, isViewAll: boolean, searchParam: string = '', filingType: boolean | null = null, casesIds: string[]) => {
  const queryParams = `?pageNumber=${currentPage}&pageSize=${pageSize}&searchParam=${searchParam}&isApproved=${isConfirmed}&isViewAll=${isViewAll}${filingType !== null ? `&isAutomation=${filingType}` : ''}`;
  
  const response: AxiosResponse = await axios({
    method: "POST",
    url: `api/LateNotices/GetConfirmNotices${queryParams}`,
    data: casesIds
  });

  return response as AxiosResponse;
};
const createEvictionNotice = async (payload: IConfirmDelinquenciesImportItems[]) => {
  ;
  const response: AxiosResponse<IConfirmDelinquenciesImportItems[]> = await axios<
  IConfirmDelinquenciesImportItems[]
  >({
     method: "POST",
     url: `/api/LateNotices/CreateNotice`,
     data: payload,
  });

  return response as AxiosResponse<IConfirmDelinquenciesImportItems[]>;
};
const createTenantEviction = async (payload: IConfirmDelinquenciesImportItems[]) => {
  ;
  const response: AxiosResponse = await axios<
  IConfirmDelinquenciesImportItems[]
  >({
     method: "POST",
     url: `/api/FileEviction/CreateNVEviction`,
     data: payload,
  });

  return response as AxiosResponse;
};

const getSignProofDoc = async (lateNotice: ILateNotice_SignProofInfo) => {
  const response: AxiosResponse = await axios({
    method: "POST",
    url: `/api/LateNotices/GetSignProofDocument`,
    data: lateNotice,
  });
  return response as AxiosResponse;
}
const confirmForEviction = async (noticeIds:string[]) => {
    
  const response: AxiosResponse =
    await axios({
      method: "POST",
      url: `api/LateNotices/ConfirmForEviction`,
      data: noticeIds,
    });

  return response as AxiosResponse;
};
const getConfirmedEvictions = async (
  pageNumber: number,
  pageSize: number,
  isConfirmed: boolean,
  searchParam?: string,
) => {
  const params: Record<string, any> = {
    isConfirmed, // include this in the query parameters
  };

  if (searchParam) params.searchContent = searchParam;

  const queryString = new URLSearchParams(params).toString();
  const response: AxiosResponse = await axios.get(
    `/api/FileEviction/GetNVEvictions/${pageNumber}/${pageSize}?${queryString}`
  );

  return response;
};

const noticeDismiss = async (noticeIds:string[]) => {
    
  const response: AxiosResponse =
    await axios({
      method: "POST",
      url: `api/LateNotices/NoticeDismiss`,
      data: noticeIds,
    });

  return response as AxiosResponse;
};

const getConfirmedDismissals = async (
  pageNumber: number,
  pageSize: number,
  isConfirmed:boolean,
  searchParam?: string,
) => {
  const params: Record<string, any> = {isConfirmed,};

  if (searchParam) params.searchContent = searchParam;
  const queryString = new URLSearchParams(params).toString();
  const response: AxiosResponse = await axios.get(
    `/api/Dismissal/GetNVDismissals/${pageNumber}/${pageSize}?${queryString}`
  );

  return response;
};

/**
 * export all NV Dismissals from database
 */
const exportNVDismissals = async (resource: INVEvictionExportEmail,searchParam?: string,) => {
  const params: Record<string, any> = {};
  if (searchParam) params.searchContent = searchParam;
  const queryString = new URLSearchParams(params).toString();
  const response: AxiosResponse<ExportNVEvictionsResource> =
     await axios<ExportNVEvictionsResource>({
        method: "POST",
        url: `api/Dismissal/ExportNVDismissals?${queryString}`,
        data: resource,
     });

  return response as AxiosResponse<ExportNVEvictionsResource>;
};
const LateNoticesService = {
  getAllLateNotices,
  createLateNotice,
  deleteLateNotice,
  sendLateNoticeEmail,
  createNoticeLink,
  signInProofEmail,
  getSignedLateNotices,
  sendNoticesEmail,
  sendExportNoticesEmail,
  exportAllLateNotices,
  exportNVEvictions,
  getNoticeDocument,
  sendForService,
  getConfirmDelinquenciesQueue,
  createEvictionNotice,
  createTenantEviction,
  getSignProofDoc,
  confirmForEviction,
  getConfirmedEvictions,
  noticeDismiss,
  getConfirmedDismissals,
  exportNVDismissals,
};
export default LateNoticesService;
