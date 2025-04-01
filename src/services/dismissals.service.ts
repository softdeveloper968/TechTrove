import axios from "middlewares/axiosInstance";
import {
  ICreateDismissals,
  IDismissalsPdfLink,
  IDismissalsSign,
  IDismissals,
  IDismissalsItems,
} from "interfaces/dismissals.interface";
import { AxiosResponse } from "axios";
import { IExportCsv, IExportPendingCsv } from "interfaces/common.interface";
import { DismissalsExportResource, DismissalsPendingExportResource } from "interfaces/export-late-notices.interface";

/**
 * add Dismissals
 * @returns Dismissals created successfully or not
 */
const createDismissals = async (dismissals: ICreateDismissals[]) => {
  const response: AxiosResponse<ICreateDismissals> =
    await axios<ICreateDismissals>({
      method: "POST",
      url: `api/`,
      data: dismissals,
    });

  return response as AxiosResponse<ICreateDismissals>;
};

/**
 * fetch list of dismissals from api
 * @param userID get all dismissals by user id
 * @returns list of all dismissals
 */
const getAllDismissals = async (
  pageNumber: number,
  pageSize: number,
  isSigned:boolean,
  searchParam?: string,
  county?: string,
  isViewAll?:boolean,
  casesIds?:string[],
) => {
  
  const queryParams = `?searchParam=${searchParam ?? ''}&isSigned=${isSigned}&county=${county ?? ''}&isViewAll=${isViewAll??true}`

  const response: AxiosResponse<IDismissals> = await axios<IDismissals>({
    method: "POST",
    url: `/api/Dismissal/${pageNumber}/${pageSize}${queryParams}`,
    data: casesIds
  });
  return response as AxiosResponse<IDismissals>;
};

/**
 * delete dismissals
 * @returns
 */
const deleteDissmissals = async (dismissalsIDs: string[]) => {
  
  const response: AxiosResponse<IDismissalsItems[]> = await axios<
    IDismissalsItems[]
  >({
    method: "DELETE",
    url: `/api/Dismissal`,
    data: dismissalsIDs,
  });

  return response as AxiosResponse<IDismissalsItems[]>;
};
/**
 *
 * @param dismissalsIDs selectec dismissals id
 * @returns pdf link
 */
const getDismissalsDocumentForSign = async (dismissalsIDs: string[]) => {
  const response: AxiosResponse<IDismissalsPdfLink> =
    await axios<IDismissalsPdfLink>({
      method: "POST",
      url: `/api/`,
      data: dismissalsIDs,
    });

  return response as AxiosResponse<IDismissalsPdfLink>;
};

/**
 * sign  Dismissals
 * @returns
 */

const signDismissals = async (dismissalsSign: IDismissalsSign) => {
  const response: AxiosResponse = await axios({
    method: "POST",
    url: `/api/`,
    data: dismissalsSign,
  });

  return response as AxiosResponse;
};

const exportDismissals = async (payload: IExportCsv,  searchParam?: string) => {
  const queryString = new URLSearchParams(searchParam).toString();
   const response: AxiosResponse<DismissalsExportResource[]> =
      await axios<DismissalsExportResource[]>({
         method: "POST",
         url: `api/Dismissal/ExportDismissals?searchParam=${searchParam}`,
         data: payload,
      });

   return response as AxiosResponse<DismissalsExportResource[]>;
};

const exportPendingDismissals = async (payload: IExportPendingCsv, searchParam?: string) => {
  const response: AxiosResponse<DismissalsPendingExportResource[]> =
     await axios<DismissalsPendingExportResource[]>({
        method: "POST",
        url: `api/Dismissal/ExportPendingDismissals?searchParam=${searchParam}`,
        data: payload,
     });

  return response as AxiosResponse<DismissalsPendingExportResource[]>;
};

const DismissalsService = {
  createDismissals,
  getAllDismissals,
  deleteDissmissals,
  getDismissalsDocumentForSign,
  signDismissals,
  exportDismissals,
  exportPendingDismissals
};

export default DismissalsService;
