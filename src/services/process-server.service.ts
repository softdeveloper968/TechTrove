import { AxiosResponse } from "axios";
import axios from "middlewares/axiosInstance";
import {
   DocumentReviewResponse,
   IGetAOS,
   IProcessServerCaseInfoEditRequest, IProcessServerCaseInfoItem,
   IProcessServerCaseInfoResponse,
   IProcessServerRequest,
   IReviewSignAOS,
   IReviewSignAOSResource,
   ISendAOSForSign,
   IServerCaseInfoResource,
   ISignAOSResource,
   ISignedAOSResource,
   ITypeValidateResource,
   ProcessServerExportItem,
   TypeValidateResponse
} from "interfaces/process-server.interface";
import { SortingOption } from "interfaces/common.interface";

const createProcessServer = async (payload: IProcessServerRequest) => {
   const response: AxiosResponse =
      await axios({
         method: "POST",
         url: `api/ProcessServer`,
         data: payload,
      });

   return response as AxiosResponse;
};

const getProcessServerUsers = async () => {
   // const queryParams = `?search=${searchParam}`;
   const response: AxiosResponse =
      await axios({
         method: "POST",
         url: `api/ProcessServer/GetAllProcessServer`,
      });

   return response as AxiosResponse;
};

const getAllProcessServerUsers = async () => {
   const response: AxiosResponse =
      await axios({
         method: "POST",
         url: `api/ProcessServer/GetAllProcessServer`,
      });

   return response as AxiosResponse;
};

// api to get process server assigned geographical area in settings tab
const getProcessServers = async (
   currentPage: number, 
   pageSize: number, 
   searchParam: string = '',
   sortings: SortingOption[] = [],
   state:string,
) => {
   const queryParams = new URLSearchParams({
      PageNumber: currentPage.toString(),
      PageSize: pageSize.toString(),
      SearchTerm: searchParam,
      State:state,
    });

    sortings.forEach((sort, index) => {
      queryParams.append(`Sortings[${index}].SortColumn`, sort.sortColumn);
      queryParams.append(`Sortings[${index}].IsAscending`, sort.isAscending.toString());
    });

   const response: AxiosResponse =
      await axios({
         method: "GET",
         url: `api/ProcessServer/GetProcessServer?${queryParams.toString()}`
      });

   return response as AxiosResponse;
};

const editProcessServerUser = async (payload: IProcessServerRequest[]) => {
   const response: AxiosResponse =
      await axios({
         method: "PUT",
         url: `api/ProcessServer`,
         data: payload,
      });

   return response as AxiosResponse;
};

const deleteProcessServerUser = async (id: string) => {
   const response: AxiosResponse =
      await axios({
         method: "DELETE",
         url: `api/ProcessServer/${id}`
      });

   return response as AxiosResponse;
};

const importProcessServerCaseInfo = async (payload: IServerCaseInfoResource) => {
   const response: AxiosResponse =
      await axios({
         method: "POST",
         url: `api/ProcessServer/AddProcessServerCase`,
         data: payload,
      });

   return response as AxiosResponse;
};

const validateProcessServerCaseType = async (payload: ITypeValidateResource[]) => {
   const response: AxiosResponse<TypeValidateResponse[]> =
     await axios<TypeValidateResponse[]>({
       method: "POST",
       url: `api/ProcessServer/ValidateProcessServerCaseType`,
       data: payload,
     });
     return response as AxiosResponse<TypeValidateResponse[]>;
};

const getProcessServerCases = async (
   currentPage: number,
   pageSize: number,
   searchParam: string = '',
   serverName: string = '',
   serviceMethod: string = '',
   dateRange: string = '',
   sortings: SortingOption[] = [],
) => {

   const filters: Record<string, any> = {
      dateRange: dateRange ?? '',
      serviceMethod: serviceMethod ?? '',
      serverName: serverName ?? '',
   };
   // Create a URLSearchParams object for the filters
   const queryParams = new URLSearchParams({
      PageNumber: currentPage.toString(),
      PageSize: pageSize.toString(),
      SearchTerm: searchParam ?? ''
   });
 // Append filters to the query string
 Object.keys(filters).forEach((key) => {
   if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
      queryParams.append(`Filters[${key}]`, filters[key].toString());
   }
});

   // Append sorting options if any
   sortings.forEach((sort, index) => {
      queryParams.append(`Sortings[${index}].SortColumn`, sort.sortColumn);
      queryParams.append(`Sortings[${index}].IsAscending`, sort.isAscending.toString());
   });

   // Make the API request
   const response: AxiosResponse = await axios({
      method: 'GET',
      url: `/api/ProcessServer/ProcessServerCaseInfo/${currentPage}/${pageSize}/?${queryParams.toString()}`,
   });

   return response as AxiosResponse;
};


/**
 * delete ProcessServer
 * @returns
 */
const deleteProcessServer = async (processServerIDs: string[]) => {
   const response: AxiosResponse<IProcessServerCaseInfoItem[]> = await axios<
   IProcessServerCaseInfoItem[]
   >({
      method: "DELETE",
      url: `/api/ProcessServer/RemoveProcessServer`,
      data: processServerIDs,
   });

   return response as AxiosResponse<IProcessServerCaseInfoItem[]>;
};

const editProcessServerCaseInfo = async (payload: IProcessServerCaseInfoEditRequest) => {
   const response: AxiosResponse<IProcessServerCaseInfoResponse> =
      await axios({
         method: "PUT",
         url: `api/ProcessServer/EditProcessServerCaseInfo`,
         data: payload
      });

   return response as AxiosResponse<IProcessServerCaseInfoResponse>;
};

const editProcessServerCaseInfoBulk = async (payload: IProcessServerCaseInfoItem[]) => {
   const response: AxiosResponse =
      await axios({
         method: "PUT",
         url: `api/ProcessServer/EditProcessServerCaseInfoBulk`,
         data: payload
      });

   return response as AxiosResponse;
};

const getProcessServerCasesById = async (id: string) => {
   const response: AxiosResponse =
      await axios({
         method: "GET",
         url: `api/ProcessServer/ProcessServerCaseInfo/${id}`,
      });

   return response as AxiosResponse;
};
const getProcessServerDocuments = async (currentPage: number, pageSize: number, searchParam: string = '') => {
   // const queryParams = `?search=${searchParam}`;
   const response: AxiosResponse =
      await axios({
         method: "GET",
         url: `api/ProcessServer/GetProcessServerDocuments/${currentPage}/${pageSize}`,
      });

   return response as AxiosResponse;
};

// const sendForSignature = async (payload: ISendAOSForSign[]) => {
//    const response: AxiosResponse =
//       await axios({
//          method: "POST",
//          url: `api/ProcessServer/SendForSignature`,
//          data: payload,
//       });

//    return response as AxiosResponse;
// };
const sendForSignature = async (payload: string[]) => {
   const response: AxiosResponse =
      await axios({
         method: "POST",
         url: `api/ProcessServer/SendForSignature`,
         data: payload,
      });

   return response as AxiosResponse;
};
const exportProcessServer = async (serverIds: string[],searchParam: string = '',
   serverName: string = '',
   serviceMethod: string = '',
   dateRange: string = '') => {
      const queryParams = new URLSearchParams({
         searchParam,
         serverName,
         serviceMethod,
         dateRange
      }).toString();
   const response: AxiosResponse<ProcessServerExportItem[]> =
     await axios<ProcessServerExportItem[]>({
       method: "POST",
       url: `api/ProcessServer/ExportAllProcessServer?${queryParams}`,
       data: serverIds,
     });
 
   return response as AxiosResponse<ProcessServerExportItem[]>;
};

const getDocumentsForSignature = async (payload: string[], isReviewButton: boolean) => {
   const response: AxiosResponse<DocumentReviewResponse> =
      await axios<DocumentReviewResponse>({
         method: "POST",
         url: `api/ProcessServer/GetDocumentsForSignature?isReviewButton=${isReviewButton}`,
         data: payload,
      });

   return response as AxiosResponse<DocumentReviewResponse>;
};
// const getDocumentsForSignature = async (payload: IReviewSignAOS[], isReviewButton: boolean,casesIds: string[]) => {
//    const requestData: IGetAOS = {
//       resource: payload, 
//       casesIds: casesIds || [] 
//    };
//    const response: AxiosResponse<DocumentReviewResponse> =
//       await axios<DocumentReviewResponse>({
//          method: "POST",
//          url: `api/ProcessServer/GetDocumentsForSignature?isReviewButton=${isReviewButton}`,
//          data: requestData,
//       });

//    return response as AxiosResponse<DocumentReviewResponse>;
// };

// const signAOSDocuments = async (payload: ISignAOSResource) => {
//    const response: AxiosResponse =
//       await axios({
//          method: "POST",
//          url: `api/ProcessServer/SignAOS`,
//          data: payload,
//       });

//    return response as AxiosResponse;
// };

// const signAOSDocuments = async (payload: IReviewSignAOSResource) => {
//    ;
//    const response: AxiosResponse =
//       await axios({
//          method: "POST",
//          url: `api/ProcessServer/SignAOS`,
//          data: payload,
//       });

//    return response as AxiosResponse;
// };
// const signAOSDocuments = async (payload: IReviewSignAOSResource) => {
//    const response: AxiosResponse =
//       await axios({
//          method: "POST",
//          url: `api/ProcessServer/SignAOS`,
//          data: {
//              sign: payload.sign,
//              CaseResource: payload.casesRecords,  // Changed casesRecords to CaseResource
//              casesIds: payload.casesIds  // Changed casesRecords to CaseResource
//          },
//       });

//    return response as AxiosResponse;
// };

const signAOSDocuments = async (payload: ISignedAOSResource) => {
   const response: AxiosResponse =
      await axios({
         method: "POST",
         url: `api/ProcessServer/SignAOS`,
         data: {
             sign: payload.sign,
             serverCasesIds: payload.serverCasesIds  // Changed casesRecords to CaseResource
         },
      });

   return response as AxiosResponse;
};

const getAmendmentVersionByDispoId = async (caseNos: string[]) => {
   try {
     const response = await axios.post(
       `/api/ProcessServer/GetAmendmentVersionByDispoId`, 
       caseNos, // Pass the dispoIds array in the request body
       {
         headers: {
           "Content-Type": "application/json",
         },
       }
     );
     console.log("API Response:", response.data);
     return response.data;
   } catch (error: any) {
     console.error("Error calling API:", error);
     throw error;
   }
};

const ProcessServerService = {
   createProcessServer,
   editProcessServerUser,
   deleteProcessServerUser,
   getProcessServerUsers,
   getProcessServers,
   importProcessServerCaseInfo,
   validateProcessServerCaseType,
   getProcessServerCases,
   deleteProcessServer,
   exportProcessServer,
   editProcessServerCaseInfo,
   editProcessServerCaseInfoBulk,
   getProcessServerCasesById,
   getProcessServerDocuments,
   getAllProcessServerUsers,
   sendForSignature,
   getDocumentsForSignature,
   signAOSDocuments,
   getAmendmentVersionByDispoId
};

export default ProcessServerService;