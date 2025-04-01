import axios from "middlewares/axiosInstance";
import {
   IPropertyInfoAddress,
   ISearchCasesRequest,
   IAllCheckCases
} from "interfaces/case.interface";
import { AxiosResponse } from "axios";

/**
 * @param searchCaseRequest  model contains search Param
 * @param county on the basis dropdown available on check case status screen
 * @returns  cases based on tenant name, property name
 */
const searchCases = async (searchCaseRequest: ISearchCasesRequest) => {
   const response: AxiosResponse<IPropertyInfoAddress[]> = await axios<
      IPropertyInfoAddress[]
   >({
      method: "POST",
      url: "/api/AllCase/GetCasesByCountyAndParam",
      data: searchCaseRequest,
   });

   return response as AxiosResponse<IPropertyInfoAddress[]>;
};

const getAllCheckCases = async (
  pageNumber: number,
  pageSize: number,
  searchParam?: string,
  state?:string,
) => {
   const filters: Record<string, any> = {
    state: state ?? ''
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
  //const queryParams = `?searchParam=${searchParam ?? ''}&state=${state}`;
  const response: AxiosResponse<IAllCheckCases> = await axios<IAllCheckCases>({
    method: "GET",
    url: `/api/AllCase/GetCases?${queryParams.toString()}`,
  });

   return response as AxiosResponse<IAllCheckCases>;
};

const CaseStatusService = {
   searchCases,
   getAllCheckCases,
};
export default CaseStatusService;
