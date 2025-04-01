import axios from "middlewares/axiosInstance";
import { AxiosResponse } from "axios";
import { IGarnishmentCourtSheriffFeesItems } from "interfaces/garnishment-court-sheriff-fees.interface";

/**
 * Create a new garnishmentCourtSheriffFees.
 * @param garnishmentCourtSheriffFeesDetails The details of the garnishmentCourtSheriffFeesDetails to be created.
 * @returns AxiosResponse containing the created garnishmentCourtSheriffFeesDetails details.
 */
const createGarnishmentCourtSheriffFees = async (
  garnishmentCourtSheriffFeesDetails: IGarnishmentCourtSheriffFeesItems
) => {
  const response: AxiosResponse = await axios.post(
    "/api/GarnishmentFee",
    garnishmentCourtSheriffFeesDetails
  );

  return response;
};

/**
 * Update an existing garnishment.
 * @param garnishment The details of the granishment to be updated.
 * @returns AxiosResponse containing the updated granishment fee details.
 */
const updateGarnishmentCourtSheriffFees = async (
  garnishment: IGarnishmentCourtSheriffFeesItems
) => {
  let { id, ...rest } = garnishment;
  const response: AxiosResponse = await axios.put(
    `/api/GarnishmentFee/${garnishment.id}`,
    rest
  );

  return response;
};

/**
 * Get a paginated list of all c2cFees.
 * @param pageNumber The page number.
 * @param pageSize The number of items per page.
 * @returns AxiosResponse containing the list of get all  fees.
 */
const getAllGarnishmentCourtSheriffFees = async (
  pageNumber: number,
  pageSize: number
) => {
  const response: AxiosResponse = await axios.get(
    `/api/GarnishmentFee/${pageNumber}/${pageSize}`
  );

  return response;
};

/**
 * Remove/delete one or more c2cFees.
 * @param c2cFeesId The IDs of the c2cFees to be removed.
 * @returns AxiosResponse indicating the result of the deletion.
 */
const removeGarnishmentCourtSheriffFees = async (c2cFeesId: string) => {
  const response: AxiosResponse = await axios.delete(
    `/api/GarnishmentFee/${c2cFeesId}`
  );

  return response;
};

const GarnishmentCourtSheriffFeesService = {
  createGarnishmentCourtSheriffFees,
  updateGarnishmentCourtSheriffFees,
  getAllGarnishmentCourtSheriffFees,
  removeGarnishmentCourtSheriffFees,
};

export default GarnishmentCourtSheriffFeesService;
