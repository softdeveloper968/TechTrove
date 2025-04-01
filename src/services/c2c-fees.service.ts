import axios from "middlewares/axiosInstance";
import { AxiosResponse } from "axios";
import { IC2CFeeItems } from "interfaces/c2c-fees.interface";

/**
 * Create a new c2cFees.
 * @param c2cDetails The details of the county to be created.
 * @returns AxiosResponse containing the created county details.
 */
const createC2CFees = async (c2cDetails: IC2CFeeItems) => {
  const response: AxiosResponse = await axios.post("/api/C2CFee", c2cDetails);

  return response;
};

/**
 * Update an existing c2cDetails.
 * @param c2cDetails The details of the county to be updated.
 * @returns AxiosResponse containing the updated county details.
 */
const updateC2CFees = async (c2cDetails: IC2CFeeItems) => {
  let { id, ...rest } = c2cDetails;
  const response: AxiosResponse = await axios.put(
    `/api/C2CFee/${c2cDetails.id}`,
    rest
  );

  return response;
};

/**
 * Get a paginated list of all c2cFees.
 * @param pageNumber The page number.
 * @param pageSize The number of items per page.
 * @returns AxiosResponse containing the list of c2c fees.
 */
const getAllC2CFees = async (pageNumber: number, pageSize: number) => {
  const response: AxiosResponse = await axios.get(
    `/api/C2CFee/${pageNumber}/${pageSize}`
  );

  return response;
};

/**
 * Remove/delete one or more c2cFees.
 * @param c2cFeesId The IDs of the c2cFees to be removed.
 * @returns AxiosResponse indicating the result of the deletion.
 */
const removeC2CFees = async (c2cFeesId: string) => {
  const response: AxiosResponse = await axios.delete(
    `/api/C2CFee/${c2cFeesId}`
  );

  return response;
};

/**
 * Get details of a specific county by its ID.
 * @param countyId The ID of the county to fetch.
 * @returns AxiosResponse containing the details of the county.
 */
const getC2CDetailById = async (c2cId: string) => {
  const response: AxiosResponse = await axios.get(`api/County/Get/${c2cId}`);

  return response;
};

const C2CFeesService = {
  createC2CFees,
  updateC2CFees,
  getAllC2CFees,
  removeC2CFees,
  getC2CDetailById,
};

export default C2CFeesService;
