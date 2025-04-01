import { AxiosResponse } from "axios";
import axios from "middlewares/axiosInstance";
import { IAllCasesItems } from "interfaces/all-cases.interface";
import { IEvictionAnswerItems } from "interfaces/eviction-answer.interface";

const getEvictionAnswerCaseByCaseNumber = async (caseNumber: string) => {
   const response: AxiosResponse<IAllCasesItems> = await axios<IAllCasesItems>({
     method: "POST",
     url: `/api/AllCase/GetCaseByCaseNumber?caseNumber=${caseNumber}`,
   });
 
   return response as AxiosResponse<IAllCasesItems>;
 }

const getEvictionAnswerDocumentForSign = async (payload: IEvictionAnswerItems) => {
   const response: AxiosResponse =
       await axios({
           method: "POST",
           url: `api/EvictionAnswer/GetEvictionAnswerDocumentForSign`,
           data: payload,
       });

   return response as AxiosResponse;
};
const addEvictionAnswerFormDetails = async (payload: IEvictionAnswerItems) => {
   const response: AxiosResponse =
       await axios({
           method: "POST",
           url: `api/EvictionAnswer`,
           data: payload,
       });

   return response as AxiosResponse;
};

const addPaymentDetails = async (data:any) => {    
    
   const response: AxiosResponse =
       await axios({
           method: "POST",
           url: `api/EvictionAnswer/AddPayment`,  
           data:data,        
       });

   return response as AxiosResponse;
};

const verifyCaptcha = async (token: string) => {
   // const response: AxiosResponse= await axios({
   //   method: "POST",
   //   url: `/api/AllCase/GetCaseByCaseNumber?caseNumber=${caseNumber}`,
   // });
   const response: AxiosResponse = await axios.post('/api/Account/verify', { token });
 
   return response as AxiosResponse;
 }


const EvictionAnswerService = {
   getEvictionAnswerDocumentForSign,
   getEvictionAnswerCaseByCaseNumber,
   verifyCaptcha,
   addPaymentDetails,
   addEvictionAnswerFormDetails,
};

export default EvictionAnswerService;