import { AxiosResponse } from "axios";
import { IUploadFile } from "interfaces/common.interface";
import axios from "middlewares/axiosInstance";

const saveUploadedFile = async (payload: IUploadFile) => {
    const response: AxiosResponse =
    await axios({
       method: "POST",
       url: `/api/FileUpload/SaveUploadFile`,
       data: payload
    });
 
 return response as AxiosResponse;
 };
 
 const CommonService = {
    saveUploadedFile
  };
  
  export default CommonService;