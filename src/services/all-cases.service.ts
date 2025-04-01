import { AxiosResponse } from "axios";
import axios from "middlewares/axiosInstance";
import {
   IAllCases,
   IAllCasesItems, IAllCasesSign,
   DocumentReviewResponse,
   IWritsLabor,
   ITenantDocument,
   IWritsCase,
   IWritsUnsignedCase,
   IMSReportResponse,
   UpdateCaseNumberResource,
   ICasesSearchRequest,
   IAllCasesDownloadDocument,
   IDismissalReason,
   IImportExistingCaseCSV,
   IWritCasesSign
} from "interfaces/all-cases.interface";
import {
   IPropertyInfoAddress,
   ISearchCasesRequest,
} from "interfaces/case.interface";
import { ExportAllCasesResource } from "interfaces/export-late-notices.interface";
import { IAmendmentsSign } from "interfaces/amendments.interface";
import { IRootCaseInfo, SortingOption } from "interfaces/common.interface";

/**
 * @param searchCaseRequest  model contains 2 properties i.e. search Param and county
 * @returns  cases based on tenant name, property name
 */
const searchAllCases = async (searchCaseRequest: ISearchCasesRequest) => {
   const response: AxiosResponse<IPropertyInfoAddress[]> =
      await axios<IPropertyInfoAddress[]>({
         method: "POST",
         url: `/api/`,
         data: searchCaseRequest,
      });

   return response as AxiosResponse<IPropertyInfoAddress[]>;
};

/**
 * fetch list of AllCases from api
 * @param userID get all AllCases by user id
 * @returns list of all AllCases
 */
const getAllCases = async (
   pageNumber: number,
   pageSize: number,
   searchParam?: string,
   status?: string,
   county?: string,
   filing?: boolean | null,
   state?:string,
   court?:string,
   sortings: SortingOption[] = [],
 ): Promise<AxiosResponse<IAllCases>> => {
   const filters: Record<string, any> = {
      status: status ?? '',
      county: county ?? '',
      state: state ?? '',
      court:court ??'',
      ...(filing !== undefined && filing !== null ? { isAutomation: filing.toString() } : {}),
    };

   const queryParams = new URLSearchParams({
     PageNumber: pageNumber.toString(),
     PageSize: pageSize.toString(),
     SearchTerm: searchParam ?? ''
   });

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
   
   const url = `/api/AllCase/GetCases?${queryParams.toString()}`;
   const response: AxiosResponse<IAllCases> = await axios.get<IAllCases>(url);

   return response;
 }; 

const getCasesBySearchingCaseNumber = async (caseNumberList: ICasesSearchRequest) => {
   const response: AxiosResponse<IAllCasesItems[]> = await axios<IAllCasesItems[]>({
      method: "POST",
      url: `/api/AllCase/GetCasesBySearchingCaseNumber`,
      data: caseNumberList,
   });

   return response as AxiosResponse<IAllCasesItems[]>;
}

const getCaseByCaseNumber = async (caseNumber: string) => {
   const response: AxiosResponse<IAllCasesItems> = await axios<IAllCasesItems>({
      method: "POST",
      url: `/api/AllCase/GetCaseByCaseNumber?caseNumber=${caseNumber}`,
   });

   return response as AxiosResponse<IAllCasesItems>;
}

const saveDataOnFinish = async (payload: IAllCasesItems[]) => {
   const response: AxiosResponse = await axios({
      method: "POST",
      url: `/api/`,
      data: payload,
   });

   return response as AxiosResponse;
}

const dismissalSign = async (payload: IAllCasesItems[]) => {
   const response: AxiosResponse = await axios({
      method: "POST",
      url: `/api/`,
      data: payload,
   });

   return response as AxiosResponse;
};

const getDismissalsDocumentForSign = async (payload: IDismissalReason[]) => {
   const response: AxiosResponse<DocumentReviewResponse> =
      await axios<DocumentReviewResponse>({
         method: "POST",
         url: `/api/Dismissal/DismissalReview`,
         data: payload,
      });

   return response as AxiosResponse<DocumentReviewResponse>;
};


const getAmendmentDocumentForSign = async (payload: IAmendmentsSign[]) => {
   const response: AxiosResponse<DocumentReviewResponse> =
      await axios<DocumentReviewResponse>({
         method: "POST",
         url: `/api/Amendments/AmendmentReview`,
         data: payload,
      });

   return response as AxiosResponse<DocumentReviewResponse>;
};

const getWritsDocumentForSign = async (payload: IWritsCase[] | IWritsUnsignedCase[]) => {
   const response: AxiosResponse<DocumentReviewResponse> =
      await axios<DocumentReviewResponse>({
         method: "POST",
         url: `/api/Writ/WritsReview`,
         data: payload,
      });

   return response as AxiosResponse<DocumentReviewResponse>;
};

const nonSignFileDismissal = async (payload: IDismissalReason[]) => {
   const response: AxiosResponse = await axios({
      method: "POST",
      url: `/api/Dismissal/FileDismissal`,
      data: payload,
   });

   return response as AxiosResponse;
};

const nonSignFileWrits = async (payload: IWritsCase[]) => {
   const response: AxiosResponse = await axios({
      method: "POST",
      url: `/api/Writ/FileWrits`,
      data: payload,
   });

   return response as AxiosResponse;
};

const signDismissals = async (payload: IAllCasesSign) => {
   const response: AxiosResponse = await axios({
      method: "POST",
      url: `/api/Dismissal/SignDismissal`,
      data: payload,
   });

   return response as AxiosResponse;
};

const signWritsOfPossession = async (payload: IWritCasesSign) => {
   const response: AxiosResponse =
      await axios({
         method: "POST",
         url: "/api/Writ/SignWrits",
         data: payload
      });

   return response as AxiosResponse;
}

const signAmendments = async (payload: IAllCasesSign) => {
   const response: AxiosResponse = await axios({
      method: "POST",
      url: `/api/Amendments/SignAmendment`,
      data: payload,
   });

   return response as AxiosResponse;
};

/**
* export all cases from database
*/
// const exportAllCases = async (caseIDs: string[]) => {
//   const response: AxiosResponse<UnsignedDispoResource[]> =
//     await axios<UnsignedDispoResource[]>({
//       method: "POST",
//       url: "api/AllCase/ExportAllCases",
//       data: caseIDs,
//     });

//   return response as AxiosResponse<UnsignedDispoResource[]>;
// };
const exportAllCases = async (caseIDs: string[],
   searchParam?: string,
   status?: string,
   county?: string,
   filing?: boolean | null) => {

   // Construct the query parameters object
   const queryParams: Record<string, string> = {
      searchParam: searchParam ?? '',
      status: status ?? '',
      county: county ?? '',
   };

   // Add the filing parameter only if it is not null or undefined
   if (filing !== undefined && filing !== null) {
      queryParams.isAutomation = filing.toString();
   }
   // Create the URLSearchParams object
   const queryString = new URLSearchParams(queryParams).toString();

   const response: AxiosResponse<ExportAllCasesResource[]> =
      await axios<ExportAllCasesResource[]>({
         method: "POST",
         url: `api/AllCase/ExportAllCases?${queryString}`,
         data: caseIDs,
      });

   return response as AxiosResponse<ExportAllCasesResource[]>;
};

const getWritLabors = async () => {
   const response: AxiosResponse<IWritsLabor[]> =
      await axios<IWritsLabor[]>({
         method: "GET",
         url: "api/WritLabor/WritLabors",
      });

   return response as AxiosResponse<IWritsLabor[]>;
};

const uploadMilitaryStatusReport = async (payload: ITenantDocument) => {
   const response: AxiosResponse<IMSReportResponse[]> =
      await axios<IMSReportResponse[]>({
         method: "POST",
         url: "/api/Writ/UploadMSReport",
         data: payload
      });

   return response as AxiosResponse<IMSReportResponse[]>;
};

const removeMilitaryStatusReport = async (attachmentId: string) => {
   const response: AxiosResponse<any> =
      await axios<any>({
         method: "DELETE",
         url: `/api/Writ/DeleteMSReport/${attachmentId}`,
      });

   return response as AxiosResponse<any>;
};

const getAllCasesById = async (id: string) => {
   const response: AxiosResponse<IRootCaseInfo> = await axios<IRootCaseInfo>({
      method: "GET",
      url: `/api/AllCase/GetCaseById/${id}`,
   });

   return response as AxiosResponse<IRootCaseInfo>;
};
/**
 *
 * @param allCasesSelectedIDs selected all cases id
 * @returns response
 */

const getAllCasesDocuments = async (
   allCasesSelectedIDs: string[],
   type?: string
): Promise<AxiosResponse<IAllCasesDownloadDocument[]>> => {
   const requestData = {
      dispoIds: allCasesSelectedIDs,
      type: type || "" // Ensure type is always provided, defaulting to an empty string if not provided
   };

   const response: AxiosResponse<IAllCasesDownloadDocument[]> =
      await axios.post<IAllCasesDownloadDocument[]>('/api/AllCase/GetCasesDocuments', requestData);

   return response;
};

const updateCaseNo = async (data: UpdateCaseNumberResource) => {
   const response: AxiosResponse = await axios({
      method: "POST",
      url: `/api/AllCase/UpdateCaseWithCaseNumber`,
      data: data
   });

   return response as AxiosResponse;
};

const updateAllCasesCaseNo = async (data: UpdateCaseNumberResource) => {
   const response: AxiosResponse = await axios({
      method: "POST",
      url: `/api/AllCase/UpdateCaseNumber`,
      data: data
   });

   return response as AxiosResponse;
};

const importExistingCases = async (fileEviction: IImportExistingCaseCSV[]) => {
   const response: AxiosResponse =
      await axios({
         method: "POST",
         url: `api/AllCase/ImportExistingCases`,
         data: fileEviction,
      });

   return response as AxiosResponse;
};


const deleteCases = async (dispoIds: string[]) => {
   const response: AxiosResponse = await axios({
      method: "DELETE",
      url: `/api/AllCase/RemoveCases`,
      data: dispoIds,
   });
 
   return response as AxiosResponse;
};

const AllCasesService = {
   searchAllCases,
   getAllCases,
   dismissalSign,
   saveDataOnFinish,
   getDismissalsDocumentForSign,
   getWritsDocumentForSign,
   signDismissals,
   nonSignFileDismissal,
   exportAllCases,
   nonSignFileWrits,
   signAmendments,
   getAmendmentDocumentForSign,
   getWritLabors,
   uploadMilitaryStatusReport,
   signWritsOfPossession,
   getAllCasesById,
   updateCaseNo,
   updateAllCasesCaseNo,
   getCasesBySearchingCaseNumber,
   getCaseByCaseNumber,
   getAllCasesDocuments,
   importExistingCases,
   removeMilitaryStatusReport,
   deleteCases
};

export default AllCasesService;
