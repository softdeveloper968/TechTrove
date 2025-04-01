import { AOSStatusEnum } from "utils/enum";
import { IAttachment, SortingOption } from "./common.interface";

export type ProcessServerFormMode = "create" | "edit";

export interface IRadioOption {
   id: string;
   value: string;
};

export interface ISelectOptions {
   id: number | string;
   value: string;
};

export interface IProcessServerRequest {
   userId: string;
   county: string;
   state: string;
   zip: string;
   city: string;
   alternateCity: string;
   email: string;
};

export interface IProcessServerUpdateRequest extends IProcessServerRequest {
   id: string;
};

export interface IProcessServerResponse {
   id: string;
   email: string;
   county: string;
   state: string;
   city: string;
   alternateCity: string;
};

export interface IProcessServerUserItem {
   isChecked?: boolean;
   id: string;
   userId: string;
   email: string;
   county: string;
   state: string;
   zip: string;
   city: string;
   alternateCity: string;
   companyName: string;
};

export interface IProcessServerUser {
   items: IProcessServerUserItem[];
   currentPage: number;
   pageSize: number;
   totalCount: number;
   totalPages: number;
   searchParam?: string;
   sortings: SortingOption[];
};

export interface IServerUserInfo {
   id: string;
   email: string;
};

export interface IProcessServerButton {
   title: string;
   icon: string;
   classes: string;
};

interface IProcessServerCaseInfoBase {
   DateScanned: Date | string;
   CaseNumber: string;
   PersonServed: string;
   Height: string;
   Weight: string;
   Age: string;
   //ServiceType: string;
   ServiceNotes: string;
   LocationCoord: string;
   ServiceComments: string;
};

export interface IProcessServerImportCsvBase extends IProcessServerCaseInfoBase {
   Remove?: string;
};

export interface IProcessServerImportCsv extends IProcessServerImportCsvBase {
   //ServiceType: string;
   EvictionServiceMethod :string;
   // ServiceDate: Date | string;
   EvictionServiceDate: Date | string;
   ServerName: string;
   ProcessServerEmail: string;
   FilingType: string;
  filingTypeOptions?:ISelectOptions[]|null
};

export interface IProcessServerCaseInfoRequest {
   CaseNumber: string;
   PersonServed: string;
   ServerName: string;
   Height: string;
   Weight: string;
   Age: string;
   ServiceMethod: string;
   ServiceDate: Date | string;
   ServiceNotes: string;
   // DefendantName: string;
   House: string;
   DateScanned: Date | string;
   Longitude: string;
   Latitude: string;
   Comments: string;
   // UnitNumber: string;
   // StreetNumber: string;
   // StreetName: string;
   // Tenantnames: string;
   // PropertyName: string;
   // Tack: boolean;
   // Personal: boolean;
   // Notorious: boolean;
   // NonEst: boolean;
   // InformationOnly: boolean;
};

export interface IProcessServerCaseInfoItem {
   id: string;
   dispoId: string;
   caseNumber: string;
   personServed: string;
   height: string;
   weight: string;
   age: string;
   serviceNotes: string;
   // defendantName: string;
   // house: string;
   dateScanned: Date | string;
   // longitude: string;
   // latitude: string;
   locationCoord: string;
   comments: string;
   serviceDate: Date | string;
   unitNumber: string;
   streetNumber: string;
   streetName: string;
   tenantnames: string;
   propertyName: string;
   // tack: boolean;
   // personal: boolean;
   // notorious: boolean;
   // nonEst: boolean;
   // informationOnly: boolean;
   companyName: string;
   serviceMethod: string;
   serverName: string;
   status: AOSStatusEnum;
   serverEmail: string;
   serverExists: boolean;
   filingType: string | null;
   filingTypeOptions:ISelectOptions[]|null;
   selectedFilingOption:ISelectOptions|null;
};

export interface ProcessServerExportItem {
   Status: string;
   CaseNo: string;
   ProcessServerEmail: string;
   EvictionServiceMethod: string;
   PersonServed: string;
   Height: string;
   Weight: string;
   Age: string;
   ServerName: string;
   ServiceNotes: string;
   evictionServiceDate: Date | string;
   dateScanned: Date | string;
   LocationCoord: string;
   ServiceComments: string;
   CompanyName: string;
   FilingType: string;
};

export interface IProcessServerCaseInfoView extends IProcessServerCaseInfoItem {
   dispoId: string;
   attachments: IAttachment[];
   serverSignDate: string;
   evictionFiledDate: string;
   dismissalFiledDate: string;
   writFiledDate: string;
   amendmentFiledDate: string;
};

export interface IProcessServerCaseInfoEditRequest extends IProcessServerCaseInfoImportRequest {
   id: string;
};

export interface IProcessServerCaseInfoImportRequest {
   dateScanned: Date | string;
   caseNumber: string;
   personServed: string;
   serverName: string;
   height: string;
   weight: string;
   age: string;
   serviceMethod: string;
   serviceDate: Date | string;
   serviceNotes: string;
   locationCoord: string;
   comments: string;
   serverEmail: string;
   filingType: string
};

export interface IServerCaseInfoResource {
   caseInfoList: IProcessServerCaseInfoImportRequest[];
   importSignedCases: boolean;
};

export interface ITypeValidateResource {
   caseNumber: string,
   filingType: string,
   serviceMethod :string;
   serviceDate: Date | string;
   serverName: string;
};

export interface TypeValidateResponse {
   caseNumber: string;    
   serviceMethod :string;
   serviceDate: Date | string;
   serverName: string;           
   taskStatus: string[];                
   filingType: string[]; 
   unsignedFilingType: string[]; 
   selectedFilingType: string;               
   operationSuccess: boolean;        
   message?: string | null;          
   data?: object | null;             
   errors?: object | null;           
   statusCode: number;               
}

export interface IProcessServerCaseInfoFormValue extends IProcessServerCaseInfoItem {
   serviceMethod: string;
}

export interface IProcessServerCaseInfo {
   items: IProcessServerCaseInfoItem[];
   currentPage: number;
   pageSize: number;
   totalCount: number;
   totalPages: number;
   searchParam?: string;
   serverName?: string;
   serviceMethod?: string;
   dateRange?: string;
   sortings: SortingOption[]
};

export interface IProcessServerCaseInfoResponse {
   isSuccess: boolean;
   message: string;
}
export interface IProcessServerDocumentInfoItems {
   name: string;
   email: string;
   documents: IServerDocument[];
}

export interface IServerDocument {
   id: string;
   name: string;
   court: string;
   url: string;
   uploadedDate: Date;
};

export interface IProcessServerDocumentInfo {
   items: IProcessServerDocumentInfoItems[];
   currentPage: number;
   pageSize: number;
   totalCount: number;
   totalPages: number;
}

export interface IAllProcessServerUser {
   id: string;
   lastName: string;
   firstName: string;
   email: string;
};

export interface DocumentReviewResponse {
   combinedPdfUrl: string;
   pdfCount: number;
   isSuccess: boolean;
   message?:string
};

export interface ISignAOSResource {
   sign: string;
   dispoIds: string[];
};

export interface IReviewSignAOSResource {
   sign: string;
   casesRecords: IReviewSignAOS[];
   casesIds: string[];
};
export interface ISignedAOSResource {
   sign: string;
   serverCasesIds: string[];
};

export interface IReviewSignAOS {
   dispoId: string;
   filingType: string;
   serviceMethod: string;
   serviceDate: Date | string;
   serverName: string;
};

export interface ISendAOSForSign {
   caseNumber: string;
   filingType: string;
   serviceMethod: string;
   serviceDate: Date | string;
   serverName: string;
};

export interface IGetAOS {
   resource : IReviewSignAOS[];
   casesIds: string[];
};
