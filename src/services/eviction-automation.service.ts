import { AxiosResponse } from "axios";
import { Guid } from "guid-typescript";
import { IAllCasesSign } from "interfaces/all-cases.interface";
import { ICRMTranctionCodeList, ICRMTransactionCodesItem, IEvictionAutomationIntegrationsGridItem, IEvictionAutomationNoticesImportCsv, IEvictionAutomationPropexoGridItem, IEvictionAutomationQueueItem, IEvictionAutomationQueueItemImportCsv, IIntegrationList, IPMSList, ITranctionCodeList, ITransactionCodesItem, IUnitsForProperty } from "interfaces/eviction-automation.interface";
import { ILateNotices } from "interfaces/late-notices.interface";
import axios from "middlewares/axiosInstance";

const getEvictionAutomationApprovalsQueue= async (currentPage: number, pageSize: number,isApproved:boolean,isViewAll:boolean,searchParam: string = '',casesIds:string[]|null, companyId:string|null, ownerId:string|null, propertyEmail:string|null, propertyId:string|null,state:string) => {
   
    const queryParams = `?pageNumber=${currentPage}&pageSize=${pageSize}&searchParam=${searchParam}&isApproved=${isApproved}&isViewAll=${isViewAll}&clientId=${companyId}&ownerId=${ownerId}&propertyEmail=${propertyEmail}&propertyId=${propertyId}&state=${state}`;
    const response: AxiosResponse =
        await axios({
            method: "POST",
            url: `api/EvictionAutomation/GetEvictionAutomationCases${queryParams}`,
            data: casesIds
        });

    return response as AxiosResponse;
};

const updateEvictionAutomationQueues = async (payload: IEvictionAutomationQueueItem[]) => {
   const response: AxiosResponse<IEvictionAutomationQueueItem[]> = await axios<
      IEvictionAutomationQueueItem[]
   >({
      method: "PUT",
      url: `/api/EvictionAutomation`,
      data: payload,
   });

   return response as AxiosResponse<IEvictionAutomationQueueItem[]>;
};

const deleteEvictionAutomationQueues = async (ids: string[]) => {
   const response: AxiosResponse<IEvictionAutomationQueueItem[]> = await axios<
      IEvictionAutomationQueueItem[]
   >({
      method: "DELETE",
      url: `/api/EvictionAutomation`,
      data: ids,
   });

   return response as AxiosResponse<IEvictionAutomationQueueItem[]>;
};

const addEvictionAutomation = async (payload: IEvictionAutomationQueueItemImportCsv[]) => {
   
   const response: AxiosResponse<IEvictionAutomationQueueItemImportCsv> =
       await axios<IEvictionAutomationQueueItemImportCsv>({
           method: "POST",
           url: `api/EvictionAutomation`,
           data: payload,
       });

   return response as AxiosResponse<IEvictionAutomationQueueItemImportCsv>;
};


const addEvictionAutomationSetting = async (payload: IEvictionAutomationQueueItem) => {
   if (payload.dismissalNotificationDayMultiselect && Array.isArray(payload.dismissalNotificationDayMultiselect)) {
    payload.dismissalNotificationDay = payload.dismissalNotificationDayMultiselect.join(', '); // Join with a comma or any other delimiter
  }
   const response: AxiosResponse<IEvictionAutomationQueueItem> =
       await axios<IEvictionAutomationQueueItem>({
           method: "POST",
           url: `api/EvictionAutomation/AddEvictionAutomationSetting`,
           data: payload,
       });

   return response as AxiosResponse<IEvictionAutomationQueueItem>;
};

const GetEvictionAutomationSettingByClient = async () => {   
   const response: AxiosResponse<IEvictionAutomationQueueItem> =
       await axios<IEvictionAutomationQueueItem>({
           method: "GET",
           url: `api/EvictionAutomation/GetEvictionAutomationSettingByClient`,          
       });

   return response as AxiosResponse<IEvictionAutomationQueueItem>;
};
const UpdateEvictionAutomationSetting = async (payload: IEvictionAutomationQueueItem) => {
   
   const response: AxiosResponse<IEvictionAutomationQueueItem> =
       await axios<IEvictionAutomationQueueItem>({
           method: "PUT",
           url: `api/EvictionAutomation/UpdateEvictionAutomationSetting`,
           data: payload,
       });

   return response as AxiosResponse<IEvictionAutomationQueueItem>;
};

const updateTransactionCode = async (payload: ITransactionCodesItem) => {
   
    const response: AxiosResponse<ITransactionCodesItem> =
        await axios<ITransactionCodesItem>({
            method: "PUT",
            url: `api/Propexo/CompanyPropertyTransactionCode`,
            data: payload,
        });
 
    return response as AxiosResponse<ITransactionCodesItem>;
 };

 const updateCRMTransactionCode = async (payload: ICRMTransactionCodesItem) => {
   
    const response: AxiosResponse<ICRMTransactionCodesItem> =
        await axios<ICRMTransactionCodesItem>({
            method: "PUT",
            url: `api/CRMImporter/CompanyPropertyTransactionCode`,
            data: payload,
        });
 
    return response as AxiosResponse<ICRMTransactionCodesItem>;
 };

 const createTransactionCode = async (payload: ITransactionCodesItem) => {
   
    const response: AxiosResponse<ITransactionCodesItem> =
        await axios<ITransactionCodesItem>({
            method: "POST",
            url: `api/Propexo/CompanyPropertyTransactionCodes`,
            data: payload,
        });
 
    return response as AxiosResponse<ITransactionCodesItem>;
 };

 const createCRMTransactionCode = async (payload: ICRMTransactionCodesItem) => {
   
    const response: AxiosResponse<ICRMTransactionCodesItem> =
        await axios<ICRMTransactionCodesItem>({
            method: "POST",
            url: `api/CRMImporter/CompanyPropertyTransactionCodes`,
            data: payload,
        });
 
    return response as AxiosResponse<ICRMTransactionCodesItem>;
 };

const getEvictionAutomationSettings = async (currentPage: number, pageSize: number, searchParam: string = '',companyId?:string,county?:string,isExpedited?:number,isStateCourt?:number) => {
    const queryParams = `?pageNumber=${currentPage}&pageSize=${pageSize}&searchParam=${searchParam}&companyId=${companyId??''}&county=${county ?? ''}&isExpedited=${isExpedited??0}&isStateCourt=${isStateCourt??0}`;
    const response: AxiosResponse =
        await axios({
            method: "GET",
            url: `api/EvictionAutomation/GetEvictionAutomationSettings${queryParams}`,
        });

    return response as AxiosResponse;
};
const getTransactionCodes = async (currentPage: number, pageSize: number, searchParam: string = '' , companyId?: string,integrationId?:string,ownerId?:string, propertyId?: string) => {
   const company= companyId == null || companyId == "" || companyId == undefined ? "" : companyId;
   const property= propertyId == null || propertyId == "" || propertyId == undefined ? "" : propertyId;
   const owner= ownerId == null || ownerId == "" || ownerId == undefined ? "" : ownerId;
   const integration= integrationId == null || integrationId == "" || integrationId == undefined ? "" : integrationId;
   const search= searchParam == null || searchParam == "" || searchParam == undefined ? "" : searchParam;
   const queryParams = `?pageNumber=${currentPage}&pageSize=${pageSize}&companyId=${company}&integrationId=${integration}&ownerId=${owner}&propertyId=${property}&search=${search}`;
    // const queryParams = `/${currentPage}/${pageSize}?companyId=${company}&propertyId=${property}`;
    const response: AxiosResponse =
        await axios({
            method: "GET",
            url: `api/Propexo/CompanyPropertyTransactionCode${queryParams}`,
        });

    return response as AxiosResponse;
};

const getCRMTransactionCodes = async (currentPage: number, pageSize: number, searchParam: string = '' , companyId?: string,integrationId?:string,ownerId?:string, propertyId?: string) => {
    const company= companyId == null || companyId == "" || companyId == undefined ? "" : companyId;
    const property= propertyId == null || propertyId == "" || propertyId == undefined ? "" : propertyId;
    const owner= ownerId == null || ownerId == "" || ownerId == undefined ? "" : ownerId;
    const integration= integrationId == null || integrationId == "" || integrationId == undefined ? "" : integrationId;
    const search= searchParam == null || searchParam == "" || searchParam == undefined ? "" : searchParam;
    const queryParams = `?pageNumber=${currentPage}&pageSize=${pageSize}&companyId=${company}&integrationId=${integration}&ownerId=${owner}&propertyId=${property}&search=${search}`;
     // const queryParams = `/${currentPage}/${pageSize}?companyId=${company}&propertyId=${property}`;
     const response: AxiosResponse =
         await axios({
             method: "GET",
             url: `api/CRMImporter/CompanyPropertyTransactionCode${queryParams}`,
         });
 
     return response as AxiosResponse;
 };

const getTransactionCodeById = async (propertyId: string , integrationId: string) => {

    const queryParams = `?PropertyId=${propertyId}&IntegrationId=${integrationId}`;
    const response: AxiosResponse<ITranctionCodeList[]> =
        await axios<
        ITranctionCodeList[]
        >({
            method: "GET",
            url: `api/Propexo/TransactionCodeList${queryParams}`,
        });

    return response as AxiosResponse<ITranctionCodeList[]>;
};

const getPropertyTransactionCodeById = async (propertyId: string , integrationId: string) => {

    const queryParams = `?IntegrationId=${integrationId}&PropertyId=${propertyId}`;
    const response: AxiosResponse<ICRMTranctionCodeList[]> =
        await axios<
        ICRMTranctionCodeList[]
        >({
            method: "GET",
            url: `api/CRMImporter/PropertyTransactionCodes${queryParams}`,
        });

    return response as AxiosResponse<ICRMTranctionCodeList[]>;
};

/**
 * Remove/delete TransactionCode.
 * @param countyIDs The ID of the TransactionCode to be removed.
 * @returns AxiosResponse indicating the result of the deletion.
 */
const removeTransactionCodes = async (transactionCodeId: string) => {
    const response: AxiosResponse = await axios.delete(`/api/Propexo/CompanyPropertyTransactionCode?id=${transactionCodeId}`);
 
    return response;
 };

 const removeCRMTransactionCodes = async (transactionCodeId: string) => {
    const response: AxiosResponse = await axios.delete(`/api/CRMImporter/CompanyPropertyTransactionCode?id=${transactionCodeId}`);
 
    return response;
 };

const getEvictionAutomationPropexo = async (currentPage: number, pageSize: number) => {
   
    const queryParams = `pageNumber=${currentPage}&pageSize=${pageSize}`;
    const response: AxiosResponse =
        await axios({
            method: "GET",
            url: `api/Propexo/Properties?${queryParams}`,
        });

    return response as AxiosResponse;
};

const getEvictionAutomationIntegrations = async (currentPage: number, pageSize: number, pmsName: string, search: string = '') => {
   
    const queryParams = `pageNumber=${currentPage}&pageSize=${pageSize}&pms=${pmsName}&searchParam=${search}`;
    const response: AxiosResponse =
        await axios({
            method: "GET",
            url: `api/CRMImporter/Properties?${queryParams}`,
        });

    return response as AxiosResponse;
};

const getUnitsForProperty = async (pmsId: string, propertyId: string) => {
 const queryParams = `pmsId=${pmsId}&propertyId=${propertyId}`;
 const response: AxiosResponse = 
      await axios(
        {
            method: "GET",
            url: `api/CRMImporter/PropertyUnits?${queryParams}`,
        });
        return response as AxiosResponse;
};

const updateUnits = async (pmsId: string, propertyId: string, unitToUpdate: IUnitsForProperty []) => {
    const queryParams = `pmsId=${pmsId}&propertyId=${propertyId}`;
    const response: AxiosResponse = 
    await axios({
        method: "PUT",
        url: `api/CRMImporter/PropertyUnits?${queryParams}`,
        data: unitToUpdate
    });
    return response as AxiosResponse
}

const SignApproveCases = async (sign: string,cases:string[]) => {
    
    const data = {
        sign: sign,
        evictionIds: cases
    };
    const response: AxiosResponse = await axios({
        method: "POST",
        url: `api/EvictionAutomation/SignApproveCases`,
        data: data,
    });

    return response as AxiosResponse;
 };

 const signDismissals = async (payload: IAllCasesSign) => {
    const response: AxiosResponse = await axios({
      method: "POST",
      url: `/api/EvictionAutomation/SignDismissal`,
      data: payload,
    });
  
    return response as AxiosResponse;
  };
  

 const getEvictionAutomationSatus = async (currentPage: number, pageSize: number, searchParam: string = '') => {
    const queryParams = `?pageNumber=${currentPage}&pageSize=${pageSize}&searchParam=${searchParam}`;
    const response: AxiosResponse =
        await axios({
            method: "GET",
            url: `api/EvictionAutomation/GetEvictionAutomationStatus${queryParams}`,
        });

    return response as AxiosResponse;
};
const loginWithPin = async (email: string, pin: string) => {
    const queryParams = `?email=${email}&pin=${pin}`;
    const response: AxiosResponse =
        await axios({
            method: "GET",
            url: `api/EvictionAutomation/LoginWithPin${queryParams}`,
        });

    return response as AxiosResponse;
};

const ConfirmApprovals = async (ownerId: string, propertyId: string, pin: string,crmName:string, cases: string[], isDismissal: boolean) => {
    
    const data = {
        ownerId: ownerId,
        propertyId: propertyId,
        pin: pin,
        crmName:crmName,
        evictionIds: cases,
        isDismissal: isDismissal
    };
    
    const url = isDismissal ? 'api/EvictionAutomation/ConfirmDismissalApprovals' : 'api/EvictionAutomation/ConfirmApprovals';

    const response: AxiosResponse = await axios({
        method: "POST",
        url: url,
        data: data,
    });

    return response as AxiosResponse;
};


 const getEvictionAutomationDismissalApprovalsQueue= async (currentPage: number, pageSize: number,isDismissed:boolean,isViewAll:boolean,searchParam: string = '',casesIds:string[]) => {
   
    const queryParams = `?pageNumber=${currentPage}&pageSize=${pageSize}&searchParam=${searchParam}&isDismissed=${isDismissed}&isViewAll=${isViewAll}`;
    const response: AxiosResponse =
        await axios({
            method: "POST",
            url: `api/EvictionAutomation/GetDismissalCases${queryParams}`,
            data: casesIds
        });

    return response as AxiosResponse;
};

const statusReprocessing = async (fileNames: string[], type: number) => {
    try {
        // Manually construct the query string
        const queryParams = fileNames.map(fileName => `fileNames=${encodeURIComponent(fileName)}`).join('&') + `&type=${type}`;
        
        const response: AxiosResponse = await axios.get(`api/EvictionAutomation/StatusReprocessing?${queryParams}`);

        return response as AxiosResponse;
    } catch (error) {
        console.error('Request failed', error);
        throw error;
    }
};

const createEvictionNotice = async (payload: IEvictionAutomationNoticesImportCsv[]) => {
    const response: AxiosResponse<IEvictionAutomationNoticesImportCsv[]> = await axios<
    IEvictionAutomationNoticesImportCsv[]
    >({
       method: "POST",
       url: `/api/EvictionAutomation/CreateEvictionNotice`,
       data: payload,
    });
 
    return response as AxiosResponse<IEvictionAutomationNoticesImportCsv[]>;
 };
 const getEvictionAutomationNoticeQueue= async (currentPage: number, pageSize: number,isConfirmed:boolean,isViewAll:boolean,searchParam: string = '',casesIds:string[]) => {
   
    const queryParams = `?pageNumber=${currentPage}&pageSize=${pageSize}&searchParam=${searchParam}&isApproved=${isConfirmed}&isViewAll=${isViewAll}`;
    const response: AxiosResponse =
        await axios({
            method: "POST",
            url: `api/EvictionAutomation/GetEvictionAutomationNotices${queryParams}`,
            data: casesIds
        });

    return response as AxiosResponse;
};

const getAllEvictionAutomationNotice = async (
    pageNumber: number,
    pageSize: number,
    searchParam?: string,
    county?: string,
    filingType?: boolean | null,  // keep filingType as boolean | null
    status: number = 0,
  ) => {
    let url = `api/EvictionAutomation/GetAllEANotices/${pageNumber}/${pageSize}`;
    
    const params = new URLSearchParams();
  
    if (searchParam) {
      params.append('searchParam', searchParam);
    }
  
    if (county) {
      params.append('county', county);
    }
  
    if (filingType !== undefined && filingType !== null) {
      params.append('isAutomation', String(filingType));  // Convert boolean to string
    }
  
    // if (isServed !== undefined && isServed !== null) {
    //   params.append('isServerd', String(isServed));  // Convert boolean to string
    // }
  
    params.append('status', String(status));
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
  
    const response: AxiosResponse<ILateNotices> = await axios<ILateNotices>({
      method: "GET",
      url: url,
    });
  
    return response as AxiosResponse<ILateNotices>;
  };

const ConfirmEvictionNotices = async (ownerId: string, propertyId: string, pin: string,crmName:string, cases: string[]) => {
    const data = {
        ownerId: ownerId,
        propertyId: propertyId,
        pin: pin,
        crmName:crmName,
        evictionIds: cases
    };
    const response: AxiosResponse = await axios({
        method: "POST",
        url: `api/EvictionAutomation/ConfirmEvictionNotices`,
        data: data,
    });

    return response as AxiosResponse;
};

const getallIntegrations = async () => {
    const response: AxiosResponse<IIntegrationList[]> = await axios<IIntegrationList[]>({
       method: "GET",
       url: "/api/Propexo/Integrations",
    });
 
    return response as AxiosResponse<IIntegrationList[]>;
 };

 const getAllPMS = async () => {
    const response: AxiosResponse<IPMSList[]> = await axios<IPMSList[]>({
       method: "GET",
       url: "/api/CRMImporter/GetAllPMS",
    });
 
    return response as AxiosResponse<IPMSList[]>;
 };

 const getPropertyBasedOnIntegrationId = async (integrationId: string,) => {
    const queryParams = `?integrationId=${integrationId}`;
    const response: AxiosResponse<IEvictionAutomationPropexoGridItem[]> = await axios<IEvictionAutomationPropexoGridItem[]>({
       method: "GET",
       url: `/api/Propexo/PropertyList${queryParams}`,
    });
 
    return response as AxiosResponse<IEvictionAutomationPropexoGridItem[]>;
 };

 const getPropertyBasedOnPMS = async (pmsId: string) => {
    const queryParams = `?pmsId=${pmsId}`;
    const response: AxiosResponse<IEvictionAutomationIntegrationsGridItem[]> = await axios<IEvictionAutomationIntegrationsGridItem[]>({
       method: "GET",
       url: `/api/CRMImporter/GetPropertiesByPMS${queryParams}`,
    });
 
    return response as AxiosResponse<IEvictionAutomationIntegrationsGridItem[]>;
 };

 const syncPropexo = async (
    ids: string[], 
    searchParam: string = '', 
    companyId?: string, 
    county?: string, 
    isExpedited?: number, 
    isStateCourt?: number
  ) => {
      try {
          const requestBody = {
              selectedIds: ids,
              searchParam: searchParam,
              companyId: companyId || '',    // If companyId is undefined, pass an empty string
              county: county || '',          // If county is undefined, pass an empty string
              isExpedited: isExpedited || 0, // Default to 0 if undefined
              isStateCourt: isStateCourt || 0 // Default to 0 if undefined
          };
  
          const response: AxiosResponse = await axios({
              method: "POST",
              url: `/api/EvictionAutomation/SyncPropexo?isManual=${true}`, // URL to your API endpoint
              data: requestBody, // Pass the EASettingResource object in the body
              headers: {
                  'Content-Type': 'application/json', // Specify the content type
              }
          });
  
          return response;
      } catch (error) {
          console.error("Error syncing Propexo:", error);
          throw error; // Re-throw error to handle it in the calling component
      }
  };

  const syncCRM = async (
    ids: string[], 
    searchParam: string = '', 
    companyId?: string, 
    county?: string, 
    isExpedited?: number, 
    isStateCourt?: number
  ) => {
      try {
          const requestBody = {
              selectedIds: ids,
              searchParam: searchParam,
              companyId: companyId || '',    // If companyId is undefined, pass an empty string
              county: county || '',          // If county is undefined, pass an empty string
              isExpedited: isExpedited || 0, // Default to 0 if undefined
              isStateCourt: isStateCourt || 0 // Default to 0 if undefined
          };
  
          const response: AxiosResponse = await axios({
              method: "POST",
              url: `/api/EvictionAutomation/SyncCRM?isManual=${true}`, // URL to your API endpoint
              data: requestBody, // Pass the EASettingResource object in the body
              headers: {
                  'Content-Type': 'application/json', // Specify the content type
              }
          });
  
          return response;
      } catch (error) {
          console.error("Error syncing CRM:", error);
          throw error; // Re-throw error to handle it in the calling component
      }
  };
 
const EvictionAutomationService = {
   getEvictionAutomationApprovalsQueue,
   updateEvictionAutomationQueues,
   deleteEvictionAutomationQueues,
   addEvictionAutomation,
   addEvictionAutomationSetting,
   GetEvictionAutomationSettingByClient,
   UpdateEvictionAutomationSetting,
   getEvictionAutomationSettings,
   getTransactionCodes,
   getCRMTransactionCodes,
   removeTransactionCodes,
   removeCRMTransactionCodes,
   updateTransactionCode,
   updateCRMTransactionCode,
   createTransactionCode,
   createCRMTransactionCode,
   getTransactionCodeById,
   getPropertyTransactionCodeById,
   getEvictionAutomationPropexo,
   getEvictionAutomationIntegrations,
   getUnitsForProperty,
   updateUnits,
   SignApproveCases,
   getEvictionAutomationSatus,
   loginWithPin,
   ConfirmApprovals,
   getEvictionAutomationDismissalApprovalsQueue,
   signDismissals,
   createEvictionNotice,
   getEvictionAutomationNoticeQueue,
   getAllEvictionAutomationNotice,
   ConfirmEvictionNotices,
   statusReprocessing,
   getallIntegrations,
   getAllPMS,
   getPropertyBasedOnIntegrationId,
   getPropertyBasedOnPMS,
   syncPropexo,
   syncCRM
};

export default EvictionAutomationService;