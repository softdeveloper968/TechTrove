import { AxiosResponse } from "axios";
import axios from "middlewares/axiosInstance";
import Period from "pages/accounting/dashboard/Period";
  const getAccountingDetails = async () => {
    const response: AxiosResponse = await axios.get(
         "/api/Accounting/GetAccountingInfo",
        );
  
    return response as AxiosResponse;
  };

  const getCompanyDetails = async (periodValue: Period, fromDate: Date|null, toDate: Date|null) => {
    try {
      const fromDateUTC = fromDate ? new Date(fromDate).toDateString() : "";
    const toDateUTC = toDate ? new Date(toDate).toDateString() : "";
    const queryParams = `?fromDate=${fromDateUTC}&toDate=${toDateUTC}`;
      const response: AxiosResponse = await axios({
        method : "GET",
        url:`/api/Accounting/GetTransactionAnalytics/${periodValue.valueOf()}${queryParams}`,
    });
      return response as AxiosResponse;
    } catch (error) {
      console.error('Error fetching company details:', error);
      throw error;
    }
  };

const AccountingService = {
    getAccountingDetails,
    getCompanyDetails,
};

export default AccountingService;