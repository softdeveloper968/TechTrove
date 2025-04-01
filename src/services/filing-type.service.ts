import { AxiosResponse } from "axios";
import axios from "middlewares/axiosInstance";
import { IAddFilingType, IFilingType, IFilingTypeItem } from "interfaces/filing-type.interface";

const getFilingTypes = async (pageNumber: number, pageSize: number, searchParam: string) => {
   const response: AxiosResponse<IFilingType> =
      await axios({
         method: 'GET',
         url: `/api/FilingType?pageNumber=${pageNumber}&pageSize=${pageSize}&searchParam=${searchParam}`,
      });

   return response as AxiosResponse;
};

const getFilingTypeList = async () => {
   const response: AxiosResponse<IFilingType> =
      await axios({
         method: 'GET',
         url: `/api/FilingType/FilingList`,
      });

   return response as AxiosResponse;
};

const addFilingType = async (payload: IAddFilingType) => {
   const response: AxiosResponse<IAddFilingType> =
      await axios<IAddFilingType>({
         method: "POST",
         url: `api/FilingType`,
         data: payload,
      });

   return response as AxiosResponse<IAddFilingType>;
};

const updateFilingType = async (payload: IFilingTypeItem) => {
   const response: AxiosResponse<IFilingTypeItem> =
      await axios<IFilingTypeItem>({
         method: "PUT",
         url: `api/FilingType`,
         data: payload,
      });

   return response as AxiosResponse<IFilingTypeItem>;
};

const deleteFilingType = async (id: string) => {
   const response: AxiosResponse =
      await axios({
         method: "DELETE",
         url: `api/FilingType/${id}`
      });

   return response as AxiosResponse;
};

const FilingTypeService = {
   getFilingTypes,
   getFilingTypeList,
   addFilingType,
   updateFilingType,
   deleteFilingType
};

export default FilingTypeService;