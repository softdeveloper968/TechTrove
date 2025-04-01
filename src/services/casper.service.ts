import { AxiosResponse } from "axios";
import axios from "middlewares/axiosInstance";
import { ICasperLoginAddRequest } from "interfaces/casper.interface";

const createCasperLoginUser = async (payload: ICasperLoginAddRequest) => {
   const response: AxiosResponse =
      await axios({
         method: "POST",
         url: `api/CasperUser/CreateCasperUser`,
         data: payload,
      });

   return response as AxiosResponse;
};

const getCasperLoginUsers = async (currentPage: number, pageSize: number, searchParam: string = '') => {
   // const queryParams = `?search=${searchParam}`;
   const response: AxiosResponse =
      await axios({
         method: "GET",
         url: `api/CasperUser/GetCasperUsers/${currentPage}/${pageSize}`,
      });

   return response as AxiosResponse;
};

const editCasperLoginUser = async (payload: ICasperLoginAddRequest) => {
   const response: AxiosResponse =
      await axios({
         method: "PUT",
         url: `api/CasperUser/UpdateCasperUser`,
         data: payload,
      });

   return response as AxiosResponse;
};

const deleteCasperLoginUser = async (id: string) => {
   const response: AxiosResponse =
      await axios({
         method: "DELETE",
         url: `api/CasperUser/DeleteCasperUser?casperUserId=${id}`,
      });

   return response as AxiosResponse;
};

const getAllCasperUsers = async () => {
   const response: AxiosResponse =
      await axios({
         method: "GET",
         url: `api/CasperUser/GetAllCasperUser`,
      });

   return response as AxiosResponse;
};

const CasperService = {
   createCasperLoginUser,
   editCasperLoginUser,
   deleteCasperLoginUser,
   getCasperLoginUsers,
   getAllCasperUsers
};

export default CasperService;