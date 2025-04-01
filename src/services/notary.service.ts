import axios from "middlewares/axiosInstance";
import { AxiosResponse } from "axios";
//import { ICourtItems } from "interfaces/court.interface";
import { INotaryItems } from "interfaces/notary.interface";

/**
 * Create a new notary.
 * @param notaryDetails The details of the notary to be created.
 * @returns AxiosResponse containing the created notary details.
 */
const createNotary = async (notaryDetails: INotaryItems) => {
    
  const response: AxiosResponse = await axios.post("/api/Notary", notaryDetails);
  return response;
};




/**
 * Get a paginated list of all notaries.
 * @param pageNumber The page number.
 * @param pageSize The number of items per page.
 * @param searchParam Optional search parameter.
 * @returns AxiosResponse containing the list of notaries.
 */
const getAllNotary = async (pageNumber: number, pageSize: number) => {
    
  const url = `/api/Notary?pageNumber=${pageNumber}&pageSize=${pageSize}`;
  const response: AxiosResponse = await axios.get(url);
  return response;
};

const removeNotary = async (notaryId: string) => {
    const response: AxiosResponse = await axios.delete(`/api/Notary/${notaryId}`);  
    return response;
  };
  const updateNotary = async (notaryDetails: INotaryItems) => {
    
    //let { id, county, id, ...rest } = notaryDetails;
    const response: AxiosResponse = await axios.put(
      `/api/Notary/${notaryDetails.id}`,
      notaryDetails
    );  
    return response;
  };

const NotaryService = {
    getAllNotary,
    createNotary,
    removeNotary,
    updateNotary
};

export default NotaryService;
