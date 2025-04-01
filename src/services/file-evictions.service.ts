import axios from "middlewares/axiosInstance";
import {
   ICreateFileEviction,
   IFileEviction_CreateFileEvcitionEmail,
   IFileEvictionSign, IFileEvictionsItems,
   ISendFileEvictionEmail,
   IResponse,
   IFileEvictionImportCsv
} from "interfaces/file-evictions.interface";
import { AxiosResponse } from "axios";
import { UnsignedDispoResource } from "interfaces/export-late-notices.interface";
import { IRootCaseInfo } from "interfaces/common.interface";
import { IFileEvictionsTXItems, IFileEvictionTXImportCsv } from "interfaces/file-evictions-tx.interface";


/**
 * add file evictions
 * @returns file eviction created successfully or not
 */
const createFileEviction = async (fileEviction: ICreateFileEviction[]) => {
   const response: AxiosResponse<ICreateFileEviction> =
      await axios<ICreateFileEviction>({
         method: "POST",
         url: `api/FileEviction/CreateTenantEvictionCase`,
         data: fileEviction,
      });

   return response as AxiosResponse<ICreateFileEviction>;
};

/**
 * export all file evictions from database
 */
const exportAllFileEvictions = async (evictionIDs: string[]) => {
   const response: AxiosResponse<UnsignedDispoResource> =
      await axios<UnsignedDispoResource>({
         method: "POST",
         url: "api/FileEviction/GetAllEvictions",
         data: evictionIDs,
      });

   return response as AxiosResponse<UnsignedDispoResource>;
};
/**
 * fetch list of late notices from api
 * @param userID get all late notices by user id
 * @returns list of all late notices
 */
const getAllFileEvictions = async (
   pageNumber: number,
   pageSize: number,
   isViewAll: boolean,
   casesIds: string[],
   searchParam?: string,
   companyId?: string,
   state?: string | null
) => {
   const params: Record<string, any> = { isViewAll };

   // Manually append each caseId to the query string
   if (casesIds && casesIds.length > 0) {
      casesIds.forEach((id, index) => {
         params[`casesIds[${index}]`] = id; // Use the format expected by your backend
      });
   }

   if (searchParam) params.searchContent = searchParam;
   if (companyId) params.companyId = companyId;
   if (state) params.state = state;

   const queryString = new URLSearchParams(params).toString();
   const response: AxiosResponse = await axios.get(
      `/api/FileEviction/GetTenantEviction/${pageNumber}/${pageSize}?${queryString}`
   );

   return response;
};


/**
 * delete FileEviction
 * @returns
 */
const deleteFileEviction = async (tenantFileEvictionIDs: string[]) => {
   const response: AxiosResponse<IFileEvictionsItems[]> = await axios<
      IFileEvictionsItems[]
   >({
      method: "DELETE",
      url: `/api/FileEviction/RemoveTenantEviction`,
      data: tenantFileEvictionIDs,
   });

   return response as AxiosResponse<IFileEvictionsItems[]>;
};
/**
 *
 * @param tenantFileEvictionIDs selectec eviction id
 * @returns pdf link
 */
const getFileEvictionDocumentForSign = async (
   tenantFileEvictionIDs: string[]
) => {
   const response: AxiosResponse<IFileEviction_CreateFileEvcitionEmail> =
      await axios<IFileEviction_CreateFileEvcitionEmail>({
         method: "POST",
         url: `/api/FileEviction/GetEvictionDocumentForSign`,
         data: tenantFileEvictionIDs,
      });
   return response as AxiosResponse<IFileEviction_CreateFileEvcitionEmail>;
};

/**
 * sign  File Eviction
 * @returns
 */

const signFileEviction = async (fileEvictionSign: IFileEvictionSign) => {
   const response: AxiosResponse = await axios({
      method: "POST",
      url: `/api/FileEviction/SignEvictions`,
      data: fileEvictionSign,
   });

   return response as AxiosResponse;
};
const signFileEvictionTX = async (fileEvictionSign: IFileEvictionSign) => {
   const response: AxiosResponse = await axios({
      method: "POST",
      url: `/api/FileEviction/SignEvictionsTX`,
      data: fileEvictionSign,
   });

   return response as AxiosResponse;
};

/**
 *
 * @param FileEviction we will send pdf link plus email
 * @returns download link
 */
const sendFileEvictionEmail = async (fileEviction: ISendFileEvictionEmail) => {
   ;
   const response: AxiosResponse = await axios({
      method: "POST",
      url: `/api/FileEviction/SendEvictionEmail`,
      data: fileEviction,
   });

   return response as AxiosResponse<IResponse>;
};

const createFileEvictionForImport = async (fileEviction: IFileEvictionImportCsv[]) => {
   const response: AxiosResponse<IFileEvictionImportCsv> =
      await axios<IFileEvictionImportCsv>({
         method: "POST",
         url: `api/FileEviction/CreateTenantEvictionCase`,
         data: fileEviction,
      });

   return response as AxiosResponse<IFileEvictionImportCsv>;
};

const editFileEvictionBulk = async (payload: IFileEvictionImportCsv[]) => {

   const response: AxiosResponse =
      await axios({
         method: "PUT",
         url: `api/FileEviction/EditFileEvictionBulk`,
         data: payload
      });

   return response as AxiosResponse;
};
const editFileEvictionTXBulk = async (payload: IFileEvictionsTXItems[]) => {

   const response: AxiosResponse =
      await axios({
         method: "PUT",
         url: `api/FileEviction/EditFileEvictionTXBulk`,
         data: payload
      });

   return response as AxiosResponse;
};
const getFileEvictionById = async (evictionId: string) => {
   const response: AxiosResponse<IRootCaseInfo> = await axios<IRootCaseInfo>({
      method: "GET",
      url: `/api/FileEviction/GetDispoById/${evictionId}`,
   });

   return response as AxiosResponse<IRootCaseInfo>;
};

const createFileEvictionTXForImport = async (fileEviction: IFileEvictionTXImportCsv[]) => {
   const response: AxiosResponse<IFileEvictionTXImportCsv> =
      await axios<IFileEvictionTXImportCsv>({
         method: "POST",
         url: `api/FileEviction/CreateTenantEvictionTXCase`,
         data: fileEviction,
      });

   return response as AxiosResponse<IFileEvictionTXImportCsv>;
};

const FileEvictionService = {
   createFileEviction,
   getAllFileEvictions,
   deleteFileEviction,
   signFileEviction,
   getFileEvictionDocumentForSign,
   exportAllFileEvictions,
   sendFileEvictionEmail,
   createFileEvictionForImport,
   editFileEvictionBulk,
   getFileEvictionById,
   createFileEvictionTXForImport,
   editFileEvictionTXBulk,
   signFileEvictionTX
};

export default FileEvictionService;
