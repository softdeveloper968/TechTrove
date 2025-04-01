import { AxiosResponse } from "axios";
import axios from "middlewares/axiosInstance";
import { ISystemInfo } from "interfaces/system-info.interface";



/**
 * fetch list of System Info Records from api
 * @param userID get all System Info by user id
 * @returns list of all System Info
 */
const getSystemInformationRecords = async (
  pageNumber: number,
  pageSize: number,
  searchParam?: string,
): Promise<AxiosResponse<ISystemInfo>> => {
  
  // Construct the query parameters object
  const queryParams: Record<string, string> = {
    searchParam: searchParam ?? '',
  };

  // Create the URLSearchParams object
  const queryString = new URLSearchParams(queryParams).toString();

  // Construct the URL with the query parameters
  const url = `/api/SystemInfo/GetAllRecords/${pageNumber}/${pageSize}?${queryString}`;

  // Make the API call
  const response: AxiosResponse<ISystemInfo> = await axios.get<ISystemInfo>(url);

  return response;
};


const SystemInfoService = {

    getSystemInformationRecords,
};

export default SystemInfoService;
