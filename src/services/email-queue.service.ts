import { AxiosResponse } from "axios";
import { DispoTaskId } from "interfaces/common.interface";
import { IEditEmailQueueItem, IEmailQueueItem, IMailManagementItem, IManualCaseDownloadDocument, IServerEmailLogItem } from "interfaces/email-queue.interface";
import axios from "middlewares/axiosInstance";


const getEmailQueues = async (currentPage: number, pageSize: number, searchParam: string = '',companyId?:string,county?:string,serverId?:string,isExpedited?:number,isStateCourt?:number,staus?:string,taskStatus?:number,state?:string,court?:string) => {
    const response: AxiosResponse =
       await axios({
           method: "GET",
           url: `api/ProcessServer/GetCasesToSendEmail/${currentPage}/${pageSize}?searchParam=${searchParam ?? ''}&companyId=${companyId??''}&county=${county ?? ''}&severEmail=${serverId??''}&isExpedited=${isExpedited??0}&isStateCourt=${isStateCourt??0}&status=${staus??''}&taskStatus=${taskStatus??0}&state=${state??''}&court=${court}`,
       });
   return response as AxiosResponse;
};

const sendEmailToServer = async (selectedIds: string[], taskIds: string[], data : DispoTaskId, searchParam: string = '', companyId?: string, county?: string, serverId?: string, isExpedited?: number, isStateCourt?: number, staus?: string, taskStatus?: number,state?:string,court?:string) => {

   const response: AxiosResponse =
      await axios({
         method: "POST",
         url: `api/ProcessServer/SendEmailToServer?searchParam=${searchParam ?? ''}&companyId=${companyId ?? ''}&county=${county ?? ''}&severEmail=${serverId ?? ''}&isExpedited=${isExpedited ?? 0}&isStateCourt=${isStateCourt ?? 0}&status=${staus ?? ''}&taskStatus=${taskStatus ?? 0}&state=${state}&court=${court}`,
         data: data,
      });

   return response as AxiosResponse;
};

const UpdateCaseInfo = async (data: IEditEmailQueueItem) => {
   const response: AxiosResponse =
      await axios({
         method: "POST",
         url: `api/ProcessServer/UpdateCaseInfo`,
         data: data,
      });

   return response as AxiosResponse;
};

const GetProcessServer = async () => {
   const response: AxiosResponse =
      await axios({
         method: "POST",
         url: `api/ProcessServer/GetAllProcessServer`,
      });

   return response as AxiosResponse;
};
const editEmailQueueCaseInfoBulk = async (payload: IEmailQueueItem[]) => {
   const response: AxiosResponse =
      await axios({
         method: "PUT",
         url: `api/ProcessServer/EditCaseInfoBulk`,
         data: payload
      });

   return response as AxiosResponse;
};

const runManualCrawling = async () => {
   const response: AxiosResponse =
      await axios({
         method: "GET",
         url: `api/EvictionQueue/RunManualCrawling`,
      });

   return response as AxiosResponse;
};

const getServerEmailLogs = async (currentPage: number, pageSize: number, searchParam: string = '',state:string) => {

   const response: AxiosResponse =
      await axios({
         method: "GET",
         url: `api/ProcessServer/GetProcessServerEmailHistory/${currentPage}/${pageSize}?searchParam=${searchParam ?? ''}&state=${state}`,
      });

   return response as AxiosResponse;
};

const editServerEmailLogInfoBulk = async (payload: IServerEmailLogItem[]) => {
   const response: AxiosResponse =
      await axios({
         method: "PUT",
         url: `api/ProcessServer/UpdateServerEmailLogInfoBulk`,
         data: payload
      });

   return response as AxiosResponse;
};

const getMailManagementQueue = async (currentPage: number, pageSize: number, searchParam: string = '') => {
   const response: AxiosResponse =
      await axios({
         method: "GET",
         url: `api/ProcessServer/MailManagementQueue/${currentPage}/${pageSize}?searchParam=${searchParam ?? ''}`,
      });

   return response as AxiosResponse;
};

const updateMailManagementQueue = async (payload: IMailManagementItem[]) => {
   const response: AxiosResponse =
      await axios({
         method: "PUT",
         url: `api/ProcessServer/MailManagementQueue`,
         data: payload
      });

   return response as AxiosResponse;
};
const deleteCases = async (selectedIds: string[]) => {
   const response: AxiosResponse =
      await axios({
         method: "POST",
         url: `api/ProcessServer/DeleteCases`,
         data: selectedIds,
      });

   return response as AxiosResponse;
};

const deletePdfLink = async (selectedId: string) => {
   const response: AxiosResponse =
      await axios({
         method: "POST",
         url: `api/ProcessServer/DeletePdfLink`,
         data: selectedId,
      });

   return response as AxiosResponse;
};

const getManualCasesDocuments = async (selectedCaseIds: string[]): Promise<AxiosResponse<string[]>> => {
   const response: AxiosResponse<string[]> =
      await axios.post<string[]>('/api/ProcessServer/GetManualCasesDocuments', selectedCaseIds);

   return response;
};

const EmailQueueService = {
   getEmailQueues,
   sendEmailToServer,
   UpdateCaseInfo,
   GetProcessServer,
   runManualCrawling,
   editEmailQueueCaseInfoBulk,
   getServerEmailLogs,
   editServerEmailLogInfoBulk,
   getMailManagementQueue,
   updateMailManagementQueue,
   deleteCases,
   deletePdfLink,
   getManualCasesDocuments
};

export default EmailQueueService;