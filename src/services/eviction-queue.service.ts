import { AxiosResponse } from "axios";
import { SortingOption } from "interfaces/common.interface";
import { IDeleteTaskCase, IEvictionQueueTaskItem } from "interfaces/eviction-queue.intreface";
import axios from "middlewares/axiosInstance";
const getEvictionQueues = async (currentPage: number, pageSize: number, searchParam: string = '') => {
   // const queryParams = `?search=${searchParam}`;
   const response: AxiosResponse =
      await axios({
         method: "GET",
         url: `api/EvictionQueue/${currentPage}/${pageSize}`,
      });

   return response as AxiosResponse;
};
const updateStatus = async (id: number, status: boolean) => {
   const response: AxiosResponse =
      await axios({
         method: "PUT",
         url: `api/EvictionQueue/QueueStatus/${id}`,
         data: { status }
      });

   return response as AxiosResponse;
};

// const getTasksByEvictionQueueId = async (currentPage: number, pageSize: number, id: number, action: number = 0, status: number = 0, searchParam: string = "", county: string = "",company: string = "",sortings: SortingOption[] = []) => {
//    // const queryParams = `?search=${searchParam}`;
//    const response: AxiosResponse =
//       await axios({
//          method: "GET",
//          url: `api/EvictionQueue/GetAllTasks/${currentPage}/${pageSize}?id=${id}&actionType=${action}&status=${status}&searchParam=${searchParam}&county=${county}&company=${company}&sortings{}`,
//       });

//    return response as AxiosResponse;
// };

const getTasksByEvictionQueueId = async (
   currentPage: number,
   pageSize: number,
   id: number,
   action: number = 0,
   status: number = 0,
   searchParam: string = "",
   county: string = "",
   company: string = "",
   sortings: SortingOption[] = []
 ) => {
   const queryParams = new URLSearchParams();
 
   // Add query parameters
   queryParams.append("id", id.toString());
   queryParams.append("actionType", action.toString());
   queryParams.append("status", status.toString());
   queryParams.append("searchParam", searchParam ?? "");
   queryParams.append("county", county ?? "");
   queryParams.append("company", company ?? "");
 
   // Add sorting options to query parameters
   sortings.forEach((sort, index) => {
     queryParams.append(`sortings[${index}].SortColumn`, sort.sortColumn);
     queryParams.append(`sortings[${index}].IsAscending`, sort.isAscending.toString());
   });
 
   // Make the API call
   const response: AxiosResponse = await axios({
     method: "GET",
     url: `api/EvictionQueue/GetAllTasks/${currentPage}/${pageSize}?${queryParams.toString()}`, // Attach queryParams
   });
 
   return response;
 };
 

const updateDisable = async (id: string, disabled: boolean) => {

   const response: AxiosResponse =
      await axios({
         method: "PUT",
         url: `api/EvictionQueue/UpdateTaskStatus/${id}`,
         data: { disabled }
      });

   return response as AxiosResponse;
};
const getAllCounties = async (currentPage: number, pageSize: number, searchParam: string = "") => {
   // const queryParams = `?search=${searchParam}`;

   const response: AxiosResponse =
      await axios({
         method: "GET",
         url: `api/County/?pageNumber=${currentPage}&pageSize=${pageSize}&searchParam=${searchParam}`,
      });

   return response as AxiosResponse;
};
const editEviction = async (payload: IEvictionQueueTaskItem[]) => {
   const response: AxiosResponse =
       await axios({
           method: "PUT",
           url: `api/EvictionQueue/EditCaseInfoBulk`,
           data: payload
       });

   return response as AxiosResponse;
};

const resubmitCase = async (id: string, taskId: string,actionType:number) => {
   const response: AxiosResponse =
      await axios({
         method: "POST",
         url: `api/EvictionQueue/ResubmitCase/?dispoId=${id}&taskId=${taskId}&actionType=${actionType}`
      });

   return response as AxiosResponse;
};

const resubmitCases = async (ids:string[]) => {
   const response: AxiosResponse =
      await axios({
         method: "POST",
         url: `api/EvictionQueue/ResubmitCases`,
         data: ids,
      });

   return response as AxiosResponse;
};

const deleteCases = async (request: IDeleteTaskCase) => {
   const response: AxiosResponse =
      await axios({
         method: "POST",
         url: `api/EvictionQueue/DeleteCases`,
         data: request,
      });

   return response as AxiosResponse;
};

const cancelCases = async (ids:string[]) => {
   const response: AxiosResponse =
      await axios({
         method: "POST",
         url: `api/EvictionQueue/CancelCases`,
         data: ids,
      });

   return response as AxiosResponse;
};

const syncManualCaseStatus = async (taskIds: string[]) => {
   const response: AxiosResponse =
      await axios({
         method: "POST",
         url: `api/EvictionQueue/SyncManualCaseStatus`,
         data: taskIds,
      });

   return response as AxiosResponse;
};

const exportManualFilingCases = async (taskIds: string[], queryParams: Record<string, string>) => {
   const queryString = new URLSearchParams(queryParams).toString();
   const response: AxiosResponse =
     await axios({
       method: "POST",
       url: `api/EvictionQueue/ExportManualFilingCasesCSV?${queryString}`,
       data: taskIds,
     });
 
   return response as AxiosResponse;
 };

 const resubmitCobbCases = async (ids:string[]) => {
   const response: AxiosResponse =
      await axios({
         method: "POST",
         url: `api/EvictionQueue/ResubmitCobbCases`,
         data: ids,
      });

   return response as AxiosResponse;
};

const regenerateSignedAOS = async (ids:string[]) => {
   const response: AxiosResponse =
      await axios({
         method: "POST",
         url: `api/ProcessServer/RegenerateSignedAOS`,
         data: ids,
      });

   return response as AxiosResponse;
};

const EvictionQueuesService = {
   getEvictionQueues,
   updateStatus,
   getTasksByEvictionQueueId,
   updateDisable,
   getAllCounties,
   editEviction,
   // resubmitCase,
   resubmitCases,
   deleteCases,
   cancelCases,
   syncManualCaseStatus,
   exportManualFilingCases,
   resubmitCobbCases,
   regenerateSignedAOS
};

export default EvictionQueuesService;