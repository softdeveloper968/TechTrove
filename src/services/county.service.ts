import axios from "middlewares/axiosInstance";
import { AxiosResponse } from "axios";
import { ICountyItems } from "interfaces/county.interface";

/**
 * Create a new county.
 * @param countyDetails The details of the county to be created.
 * @returns AxiosResponse containing the created county details.
 */
const createCounty = async (countyDetails: ICountyItems) => {
   const response: AxiosResponse = await axios.post(
      "/api/County",
      countyDetails
   );

   return response;
};

/**
 * Update an existing county.
 * @param countyDetails The details of the county to be updated.
 * @returns AxiosResponse containing the updated county details.
 */
const updateCounty = async (countyDetails: ICountyItems) => {
   let { countyId, ...rest } = countyDetails;
   const response: AxiosResponse = await axios.put(
      `/api/County/${countyDetails.countyId}`,
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
const getAllCounty = async (pageNumber?: number, pageSize?: number) => {
   const url = pageNumber
      ? `/api/County?pageNumber=${pageNumber}&pageSize=${pageSize}`
      : `/api/County`;

   const response: AxiosResponse = await axios.get(url);

   return response;
};

/**
 * Remove/delete one or more counties.
 * @param countyIDs The IDs of the counties to be removed.
 * @returns AxiosResponse indicating the result of the deletion.
 */
const removeCounty = async (countyId: number) => {
   const response: AxiosResponse = await axios.delete(`/api/County/${countyId}`);

   return response;
};

/**
 * Get details of a specific county by its ID.
 * @param countyId The ID of the county to fetch.
 * @returns AxiosResponse containing the details of the county.
 */
const getCountyById = async (countyId: string) => {
   const response: AxiosResponse = await axios.get(`api/County/Get/${countyId}`);

   return response;
};
/**
 * Get a  list of all states.
 * @returns AxiosResponse containing the list of counties.
 */
const getAllStates = async () => {
   const url = `api/County/States`;
   const response: AxiosResponse = await axios.get(url);
   return response;
};

// get all the counties without pagination
const getCounties = async () => {
   const response: AxiosResponse = await axios({
      method: "GET",
      url: `/api/County/GetCounties`,
   });

   return response as AxiosResponse;
};

const CountyService = {
   createCounty,
   getAllCounty,
   removeCounty,
   getCountyById,
   updateCounty,
   getAllStates,
   getCounties
};

export default CountyService;
