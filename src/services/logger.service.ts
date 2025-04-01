import { AxiosResponse } from "axios";
import axios from "middlewares/axiosInstance";
import { IAllLogs, IUser } from "interfaces/log.interface";

const getLogs = async (pageNumber: number, pageSize: number, searchParam?: string,event?:number,type?:number,fromDate ?:Date|null,toDate?:Date|null,userId?:string,companyId?:string) => {
    // const queryParams = `?search=${searchParam}`;
    
    const fromDateUTC = fromDate ? new Date(fromDate).toDateString() : "";
    const toDateUTC = toDate ? new Date(toDate).toDateString() : "";
    const queryParams = `?type=${type??0}&searchContent=${searchParam ??""}&fromDate=${fromDateUTC}&toDate=${toDateUTC}&event=${event??0}&userId=${userId??""}&companyId=${companyId??""}`;
    const response: AxiosResponse<IAllLogs> = await axios<IAllLogs>({
      method: "GET",
      url: `/api/Logs/${pageNumber}/${pageSize}${queryParams}`,
    });
  
    return response as AxiosResponse<IAllLogs>;


    // const response: AxiosResponse =
    //     await axios({
    //         method: "GET",
    //         url: `api/Logs/${pageNumber}/${pageSize}`,
    //     });

    // return response as AxiosResponse;
};
const getUsers=async(search:string,companyId:string)=>{
  
  const response: AxiosResponse<IUser[]> = await axios<IUser[]>({
    method: "GET",
    url: `/api/Account/AllUsers/?search=${search}&companyId=${companyId}`,
  });

  return response as AxiosResponse<IUser[]>;
}
const getUsersByCompany=async(companyId:string)=>{
  
  const response: AxiosResponse<IUser[]> = await axios<IUser[]>({
    method: "GET",
    url: `/api/Account/GetAllUserByCompany/${companyId}`,
  });

  return response as AxiosResponse<IUser[]>;
}
const LoggerService = {
    getLogs,
    getUsers,
    getUsersByCompany
}
export default LoggerService;