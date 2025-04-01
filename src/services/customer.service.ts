import { AxiosResponse } from "axios";
import { ICustomerFormItems } from "interfaces/customer.interface";
import axios from "middlewares/axiosInstance";

  const getCustomerDetails = async (pageNumber: number, pageSize: number,searchParam:string) => {
    
    const response: AxiosResponse = await axios.get(
         `/api/Customers/${pageNumber}/${pageSize}?searchParam=${searchParam}`,
        );
    return response as AxiosResponse;
  };

  const createCustomer = async (customerId: ICustomerFormItems) => {   
    const response: AxiosResponse = await axios.post(`/api/Customers?clientId=${customerId.id}`);
    return response;
  };

const CustomerService = {
    getCustomerDetails,
    createCustomer,
};

export default CustomerService;