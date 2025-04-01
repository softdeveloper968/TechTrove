import axios from "middlewares/axiosInstance";
import { ExportServiceTrackerItems, ExportUnservedQueueItems, IServiceTracker, IUnservedQueue, IUnservedQueueItems } from "interfaces/service-tracker.interface";
import { AxiosResponse } from "axios";
import { UnsignedDispoResource } from "interfaces/export-late-notices.interface";

/**
 * fetch list of service tracker from api
 * @param userID get all service tracker by user id
 * @returns list of all service tracker
 */
const getAllServiceTracker = async (
  pageNumber: number,
  pageSize: number,
  searchParam?: string
) => {
  
  const url: string = searchParam
  ? `/api/ServiceTracker/${pageNumber}/${pageSize}?searchParam=${searchParam}`
  : `/api/ServiceTracker/${pageNumber}/${pageSize}`;
const response: AxiosResponse<IServiceTracker> = await axios<IServiceTracker>({
  method: "GET",
  url: url,
    }
  );

  return response as AxiosResponse<IServiceTracker>;
};

/**
* export all cases from database
*/
const exportServiceTracker= async (caseIDs: string[],
  searchParam?: string) => {
  const response: AxiosResponse<ExportServiceTrackerItems> =
    await axios<ExportServiceTrackerItems>({
      method: "POST",
      url: `api/ServiceTracker/ExportServiceTracker?searchParam=${searchParam}`,
      data: caseIDs,
    });

  return response as AxiosResponse<ExportServiceTrackerItems>;
};

/**
* export all cases from database
*/
const exportUnservedQueue= async (caseIDs: string[],
  searchParam?: string) => {
  const response: AxiosResponse<ExportUnservedQueueItems> =
    await axios<ExportUnservedQueueItems>({
      method: "POST",
      url: `api/ServiceTracker/ExportUnservedQueue?searchParam=${searchParam}`,
      data: caseIDs,
    });

  return response as AxiosResponse<ExportUnservedQueueItems>;
};
/**
 * fetch list of unserved queue from api
 * @param userID get all unserved queue by user id
 * @returns list of all unserved queue
 */
const getAllUnservedQueue = async (
  pageNumber: number,
  pageSize: number,
  searchParam?: string
) => {
  
  const url: string = searchParam
  ? `/api/ServiceTracker/UnservedQueue/${pageNumber}/${pageSize}?searchParam=${searchParam}`
  : `/api/ServiceTracker/UnservedQueue/${pageNumber}/${pageSize}`;
const response: AxiosResponse<IUnservedQueue> = await axios<IUnservedQueue>({
  method: "GET",
  url: url,
    }
  );

  return response as AxiosResponse<IUnservedQueue>;
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
const exportUnservedAmendments = async (caseIDs: string[], searchParam?: string) => {

  const response: AxiosResponse<ExportUnservedQueueItems[]> =
     await axios<ExportUnservedQueueItems[]>({
        method: "POST",
        url: `api/Amendments/ExportUnservedAmendments?searchParam=${searchParam}`,
        data: caseIDs,
     });

  return response as AxiosResponse<ExportUnservedQueueItems[]>;
};
const editUnservedEviction = async (payload: IUnservedQueueItems[],status?: string) => {

  const response: AxiosResponse =
     await axios({
        method: "PUT",
        url: `api/ServiceTracker/EditUnservedEvictionBulk?status=${status}`,
        data: payload
     });

  return response as AxiosResponse;
};

const ServiceTrackerService = {
  getAllServiceTracker,
  exportServiceTracker,
  getAllUnservedQueue,
  editUnservedEviction,
  exportUnservedQueue,
  getAllUnservedAmendments,
  exportUnservedAmendments
};

export default ServiceTrackerService;
