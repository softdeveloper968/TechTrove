import axios from "middlewares/axiosInstance";
import {
   ICreateWritsOfPossession,
   IWritsOfPossessionPdfLink,
   IWritsOfPossessionSign,
   IWritsOfPossession,
   IWritsOfPossessionItems,
} from "interfaces/writs-of-possession.interface";
import { AxiosResponse } from "axios";
import { WritsExportResource } from "interfaces/export-late-notices.interface";
import { IExportCsv, SortingOption } from "interfaces/common.interface";

/**
 * add writs of possession
 * @returns writs of possession created successfully or not
 */
const createWritsOfPossession = async (
   writsOfPssession: ICreateWritsOfPossession[]
) => {
   const response: AxiosResponse<ICreateWritsOfPossession> =
      await axios<ICreateWritsOfPossession>({
         method: "POST",
         url: `api/`,
         data: writsOfPssession,
      });

   return response as AxiosResponse<ICreateWritsOfPossession>;
};

/**
 * fetch list of writs from api
 * @param userID get all writeOfPossession by user id
 * @returns list of all writeOfPossession
 */
const getAllWritesOfPossession = async (
   pageNumber: number,
   pageSize: number,
   isSigned: boolean,
   sortings: SortingOption[] = [],
   searchParam?: string,
) => {
   const filters: Record<string, any> = {
      isSigned: isSigned ?? false
    };

    const queryParams = new URLSearchParams({
      PageNumber: pageNumber.toString(),
      PageSize: pageSize.toString(),
      SearchTerm: searchParam ?? ''
    });

    Object.keys(filters).forEach((key) => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        queryParams.append(`Filters[${key}]`, filters[key].toString());
      }
    });
    
   sortings.forEach((sort, index) => {
     queryParams.append(`Sortings[${index}].SortColumn`, sort.sortColumn);
     queryParams.append(`Sortings[${index}].IsAscending`, sort.isAscending.toString());
   });

   const response: AxiosResponse<IWritsOfPossession> = await axios<IWritsOfPossession>({
      method: "GET",
      url: `/api/Writ?${queryParams.toString()}`,
   });

   return response as AxiosResponse<IWritsOfPossession>;
};

/**
 * delete writs of possession
 * @returns
 */
const deleteWritsOfPossession = async (writsOfPossessionIDs: string[]) => {
   const response: AxiosResponse<IWritsOfPossessionItems[]> = await axios<
      IWritsOfPossessionItems[]
   >({
      method: "DELETE",
      url: `/api/Writ`,
      data: writsOfPossessionIDs,
   });

   return response as AxiosResponse<IWritsOfPossessionItems[]>;
};
/**
 *
 * @param writsOfPossessionIDs selectec writsOfPossession id
 * @returns pdf link
 */
const getWritsOfPossessionDocumentForSign = async (
   writsOfPossessionIDs: string[]
) => {
   const response: AxiosResponse<IWritsOfPossessionPdfLink> =
      await axios<IWritsOfPossessionPdfLink>({
         method: "POST",
         url: `/api/FileEviction/GetEvictionDocumentForSign`,
         data: writsOfPossessionIDs,
      });

   return response as AxiosResponse<IWritsOfPossessionPdfLink>;
};

/**
 * sign  File Eviction
 * @returns
 */

const signWritsOfPossession = async (
   writsOfPossessionSign: IWritsOfPossessionSign
) => {

   const response: AxiosResponse = await axios({
      method: "POST",
      url: `/api/`,
      data: writsOfPossessionSign,
   });

   return response as AxiosResponse;
};

const editWritOfPossessionByWritLabor = async (writOfPossessios: IWritsOfPossessionItems[]) => {

   const response: AxiosResponse<IWritsOfPossessionItems[]> =
      await axios<IWritsOfPossessionItems[]>({
         method: "PUT",
         url: `api/WritLabor/UpdateWritOfPossession`,
         data: writOfPossessios,
      });

   return response as AxiosResponse;
};

const exportWrits = async (payload: IExportCsv,  searchParam?: string) => {
   const queryString = new URLSearchParams(searchParam).toString();
   const response: AxiosResponse<WritsExportResource[]> =
      await axios<WritsExportResource[]>({
         method: "POST",
         url: `api/Writ/ExportWrits?searchParam=${searchParam}`,
         data: payload,
      });

   return response as AxiosResponse<WritsExportResource[]>;
};

const WritsOfPossessionService = {
   createWritsOfPossession,
   getAllWritesOfPossession,
   deleteWritsOfPossession,
   getWritsOfPossessionDocumentForSign,
   signWritsOfPossession,
   editWritOfPossessionByWritLabor,
   exportWrits
};

export default WritsOfPossessionService;
