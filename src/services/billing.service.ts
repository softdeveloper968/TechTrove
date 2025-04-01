import { AxiosResponse } from "axios";
import axios from "middlewares/axiosInstance";
import { IBilling } from "interfaces/billing.interface";

const getBillingTransactions = async (pageNumber: number, pageSize: number, searchParam?: string | null) => {
   const searchParams = searchParam === undefined ? "" : searchParam;
   const response: AxiosResponse<IBilling> =
      await axios({
         method: "GET",
         url: `/api/BillingTransaction?pageNumber=${pageNumber}&pageSize=${pageSize}&searchParam=${searchParams}`,
      });

   return response as AxiosResponse<IBilling>;
};

const BillingService = {
   getBillingTransactions
};

export default BillingService;