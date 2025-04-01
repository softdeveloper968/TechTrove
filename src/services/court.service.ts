import axios from "middlewares/axiosInstance";
import { AxiosResponse } from "axios";
import { ICourtItems } from "interfaces/court.interface";

/**
 * Create a new county.
 * @param countyDetails The details of the county to be created.
 * @returns AxiosResponse containing the created county details.
 */
const createCourt = async (courtDetails: ICourtItems) => {
   const response: AxiosResponse = await axios.post("/api/court", courtDetails);
   return response;
};

/**
 * Update an existing county.
 * @param countyDetails The details of the county to be updated.
 * @returns AxiosResponse containing the updated county details.
 */
const updateCourt = async (courtDetails: ICourtItems) => {
   let { courtId, county, id, ...rest } = courtDetails;
   const response: AxiosResponse = await axios.put(
      `/api/court/${courtDetails.id}`,
      rest
   );

   return response;
};

/**
 * Get a paginated list of all counties.
 * @param pageNumber The page number.
 * @param pageSize The number of items per page.
 * @param searchParam Optional search parameter.
 * @returns AxiosResponse containing the list of counties.
 */
const getAllCourt = async (pageNumber: number, pageSize: number) => {
   const url = `/api/court?pageNumber=${pageNumber}&pageSize=${pageSize}`;
   const response: AxiosResponse = await axios.get(url);
   return response;
};

/**
 * Get a paginated list of all counties.
 * @param pageNumber The page number.
 * @param pageSize The number of items per page.
 * @param searchParam Optional search parameter.
 * @returns AxiosResponse containing the list of counties.
 */
const getCourtsByCountyId = async (courtId: number) => {
   const url = `/api/court/GetByCounty/${courtId}`;
   const response: AxiosResponse = await axios.get(url);
   return response;
};

/**
 * Remove/delete one or more counties.
 * @param courtId The IDs of the counties to be removed.
 * @returns AxiosResponse indicating the result of the deletion.
 */
const removeCourt = async (courtId: string) => {
   const response: AxiosResponse = await axios.delete(`/api/court/${courtId}`);

   return response;
};

/**
 * Get details of a specific county by its ID.
 * @param courtId The ID of the county to fetch.
 * @returns AxiosResponse containing the details of the county.
 */
const getCourtById = async (courtId: string) => {
   const response: AxiosResponse = await axios.get(`api/court/${courtId}`);

   return response;
};

const getAllCourtList = async () => {
   const response: AxiosResponse = await axios.get(`api/court/all`);

   return response;
};

const getCourtsByState = async (state: string) => {
   const payload: any = {
      state: state,
      court: "",
      CaseType: "",
      filingCode: "",
      fileIntoExistingCase: false
   };

   const response: AxiosResponse =
      await axios({
         method: "POST",
         url: `api/TylerConfig/GetCourtsByState`,
         data: payload,
      });
      
   return response as AxiosResponse;
};

const CourtService = {
   createCourt,
   getAllCourt,
   removeCourt,
   getCourtById,
   updateCourt,
   getCourtsByCountyId,
   getAllCourtList,
   getCourtsByState
};

export default CourtService;
