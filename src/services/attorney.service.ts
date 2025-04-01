import { AxiosResponse } from "axios";
import axios from "middlewares/axiosInstance";
import { IAddAttorney, IAttorney, IAttorneyItem } from "interfaces/attorney.interface";

const getAttorneys = async (pageNumber: number, pageSize: number, searchParam: string) => {
   const response: AxiosResponse<IAttorney> =
      await axios({
         method: 'GET',
         url: `/api/Attorney?pageNumber=${pageNumber}&pageSize=${pageSize}&searchParam=${searchParam}`,
      });

   return response as AxiosResponse;
};

const addAttorney = async (payload: IAddAttorney) => {
   const response: AxiosResponse<IAddAttorney> =
      await axios<IAddAttorney>({
         method: "POST",
         url: `api/Attorney`,
         data: payload,
      });

   return response as AxiosResponse<IAddAttorney>;
};

const updateAttorney = async (id: string, payload: IAttorneyItem) => {
   const response: AxiosResponse<IAttorneyItem> =
      await axios<IAttorneyItem>({
         method: "PUT",
         url: `api/Attorney/${id}`,
         data: payload,
      });

   return response as AxiosResponse<IAttorneyItem>;
};

const deleteAttorney = async (id: string) => {
   const response: AxiosResponse =
      await axios({
         method: "DELETE",
         url: `api/Attorney/${id}`
      });

   return response as AxiosResponse;
};

const AttorneyService = {
   getAttorneys,
   addAttorney,
   updateAttorney,
   deleteAttorney
};

export default AttorneyService;