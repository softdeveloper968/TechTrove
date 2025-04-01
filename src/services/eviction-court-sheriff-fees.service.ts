import axios from "middlewares/axiosInstance";
import { AxiosResponse } from "axios";
import { IEvictionCourtShariffFeeItems } from "interfaces/eviction-court-shariff-fees.interface";

/**
 * Create a new eviction court sheriff fees.
 * @param evictionCourtShariffFeesDetails The details of the eviction court shariff fees  to be created.
 * @returns AxiosResponse containing the created county details.
 */
const createEvictionCourtSheriffFees = async (
  evictionCourtShariffFeesDetails: IEvictionCourtShariffFeeItems
) => {
  const response: AxiosResponse = await axios.post(
    "/api/EvictionFee",
    evictionCourtShariffFeesDetails
  );

  return response;
};

/**
 * Update eviction court sheriff fees.
 * @param evictionCourtShariffFeesDetails The details of the county to be updated.
 * @returns AxiosResponse containing the updated county details.
 */
const updateEvictionCourtSheriffFees = async (
  evictionCourtShariffFeesDetails: IEvictionCourtShariffFeeItems
) => {
  let { id, ...rest } = evictionCourtShariffFeesDetails;
  const response: AxiosResponse = await axios.put(
    `/api/EvictionFee/${evictionCourtShariffFeesDetails.id}`,
    rest
  );

  return response;
};

/**
 * Get a paginated list of all eviction Court Sheriff fees .
 * @param pageNumber The page number.
 * @param pageSize The number of items per page.
 * @param searchParam Optional search parameter.
 * @returns AxiosResponse containing the list of counties.
 */
const getAllEvictionCourtSheriffFees = async (
  pageNumber: number,
  pageSize: number
) => {
  const url = `/api/EvictionFee?pageNumber=${pageNumber}&pageSize=${pageSize}`;

  const response: AxiosResponse = await axios.get(url);

  return response;
};

/**
 * Remove/delete one or more Eviction Court Sheriff Fees .
 * @returns AxiosResponse indicating the result of the deletion.
 */
const removeEvictionCourtSheriffFees = async (evictionFeeId: number) => {
  const response: AxiosResponse = await axios.delete(
    `/api/EvictionFee/${evictionFeeId}`
  );

  return response;
};

/**
 * Get details of a specific county by its ID.
 * @param countyId The ID of the county to fetch.
 * @returns AxiosResponse containing the details of the county.
 */
const getEvictionCourtSheriffFeesById = async (evictionId: string) => {
  const response: AxiosResponse = await axios.get(
    `api/County/Get/${evictionId}`
  );

  return response;
};

const EvictionCourtSheriffFeesService = {
  createEvictionCourtSheriffFees,
  getAllEvictionCourtSheriffFees,
  removeEvictionCourtSheriffFees,
  getEvictionCourtSheriffFeesById,
  updateEvictionCourtSheriffFees,
};

export default EvictionCourtSheriffFeesService;
