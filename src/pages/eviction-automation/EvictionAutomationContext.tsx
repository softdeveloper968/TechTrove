import React, {
   Dispatch,
   useContext,
   createContext,
   useState,
   SetStateAction
} from "react";
import { HttpStatusCode } from "axios";
import { ICRMTransactionCode, ICRMTransactionCodesResult, IEvictionAutomationIntegrationsQueue, IEvictionAutomationOtherQueue, IEvictionAutomationPropexoGridItem, IEvictionAutomationPropexoQueue, IEvictionAutomationQueue, IEvictionAutomationQueueItem, IEvictionAutomationStatusQueue, IIntegrationList, IPMSList, ITransactionCodes, IUnitsForProperty } from "interfaces/eviction-automation.interface";
import { ICompanyItems } from "interfaces/writ-labor-interface";
import { IAllCasesReason } from "interfaces/all-cases.interface";
import { ICountyItems } from "interfaces/county.interface";
import EvictionAutomationService from "services/eviction-automation.service";
import AllUsersService from "services/all-users.service";
import CountyService from "services/county.service";
import { ILateNotices, ILateNoticesItems } from "interfaces/late-notices.interface";
import { useAuth } from "context/AuthContext";
import { toast } from "react-toastify";

export type EvictionAutomationContextType = {
   showSpinner: boolean;
   setShowSpinner: Dispatch<SetStateAction<boolean>>;
   evictionAutomationQueue: IEvictionAutomationQueue;
   evictionAutomationApprovalsQueue: IEvictionAutomationOtherQueue;
   evictionAutomationDismissalApprovalsQueue: IEvictionAutomationOtherQueue;
   evictionAutomationApprovedQueue: IEvictionAutomationOtherQueue;
   evictionAutomationSignedQueue: IEvictionAutomationOtherQueue;
   evictionAutomationDismissalApprovedQueue: IEvictionAutomationOtherQueue;
   evictionAutomationStatusQueue: IEvictionAutomationStatusQueue;
   evictionAutomationStatusAllQueueData: IEvictionAutomationStatusQueue;
   transactionCodes: ITransactionCodes;
   crmTransactionCodes: ICRMTransactionCodesResult;
   setEvictionAutomationQueue: Dispatch<SetStateAction<IEvictionAutomationQueue>>;
   setEvictionAutomationApprovalsQueue: Dispatch<SetStateAction<IEvictionAutomationOtherQueue>>;
   setEvictionAutomationDismissalApprovalsQueue: Dispatch<SetStateAction<IEvictionAutomationOtherQueue>>;
   setEvictionAutomationApprovedQueue: Dispatch<SetStateAction<IEvictionAutomationOtherQueue>>;
   setEvictionAutomationSignedQueue: Dispatch<SetStateAction<IEvictionAutomationOtherQueue>>;
   setEvictionAutomationDismissalApprovedQueue: Dispatch<SetStateAction<IEvictionAutomationOtherQueue>>;
   setEvictionAutomationStatusQueue: Dispatch<SetStateAction<IEvictionAutomationStatusQueue>>;
   setEvictionAutomationStatusAllQueueData: Dispatch<SetStateAction<IEvictionAutomationStatusQueue>>;
   setTransactionCodes: Dispatch<SetStateAction<ITransactionCodes>>;
   setCRMTransactionCodes: Dispatch<SetStateAction<ICRMTransactionCodesResult>>;
   getEvictionAutomationStatusQueue: (currentPage: number, pageSize: number, search?: string) => void;
   getEvictionAutomationApprovalsQueue: (currentPage: number, pageSize: number, isApproved: boolean, isViewAll: boolean, search?: string,companyId?:string) => void;
   getEvictionAutomationSignedQueue: (currentPage: number, pageSize: number, search?: string) => void;
   getEvictionAutomationDismissalApprovalsQueue: (currentPage: number, pageSize: number, isDismissed: boolean, isViewAll: boolean, search?: string) => void;
   getEvictionAutomationQueue: (currentPage: number, pageSize: number, search?: string, companyId?: string, county?: string, isExpedited?: number, isStateCourt?: number) => void;
   getTransactionCodes: (currentPage: number, pageSize: number, search?: string, companyId?: string,integrationId?:string,ownerId?:string, propertyId?: string) => void;
   getCRMTransactionCodes: (currentPage: number, pageSize: number, search?: string, companyId?: string,integrationId?:string,ownerId?:string, propertyId?: string) => void;
   selectedEvictionAutomationQueueIds: string[];
   selectedEvictionAutomationStatusIds: string[];
   setSelectedEvictionStatusId: Dispatch<SetStateAction<string[]>>;
   setSelectedEvictionAutomationQueueIds: Dispatch<SetStateAction<string[]>>;
   filteredRecords: IEvictionAutomationQueueItem[];
   setFilteredRecords: Dispatch<SetStateAction<IEvictionAutomationQueueItem[]>>;
   bulkEditRecords: IEvictionAutomationQueueItem[];
   setBulkEditRecords: Dispatch<SetStateAction<IEvictionAutomationQueueItem[]>>;
   bulkRecordsNotices: ILateNoticesItems[];
  setBulkRecordsNotices: Dispatch<SetStateAction<ILateNoticesItems[]>>;
   selectedEvictionApprovalId: string[];
   setSelectedEvictionApprovalId: Dispatch<SetStateAction<string[]>>;
   selectedEvictionApprovedId: string[];
   setSelectedEvictionApprovedId: Dispatch<SetStateAction<string[]>>;
   selectedEvictionAutomationNoticeId: string[];
  setselectedEvictionAutomationNoticeId: Dispatch<SetStateAction<string[]>>;
   allCompanies: ICompanyItems[];
   propertyUnits: IUnitsForProperty[];
   getAllCompanies: () => void;
   setAllCompanies: Dispatch<SetStateAction<ICompanyItems[]>>;
   allProperties: IEvictionAutomationPropexoGridItem[];
   getAllProperties: () => void;
   setAllProperties: Dispatch<SetStateAction<IEvictionAutomationPropexoGridItem[]>>;
   selectedEvictionDismissalApprovalId: string[];
   setSelectedEvictionDismissalApprovalId: Dispatch<SetStateAction<string[]>>;
   selectedEvictionDismissalApprovedId: string[];
   setSelectedEvictionDismissalApprovedId: Dispatch<SetStateAction<string[]>>;
   selectedReason: IAllCasesReason[];
   setSelectedReason: Dispatch<SetStateAction<IAllCasesReason[]>>;
   allCounties: ICountyItems[];
   getAllCounties: () => void;
   setAllCounties: Dispatch<SetStateAction<ICountyItems[]>>;
   selectedEvictionNoticeId: string[];
   setSelectedEvictionNoticeId: Dispatch<SetStateAction<string[]>>;
   evictionAutomationNoticesConfirmQueue: IEvictionAutomationOtherQueue;
   setEvictionAutomationNoticesConfirmQueue: Dispatch<SetStateAction<IEvictionAutomationOtherQueue>>;
   evictionAutomationNoticesConfirmedQueue: IEvictionAutomationOtherQueue;
   setEvictionAutomationNoticesConfirmedQueue: Dispatch<SetStateAction<IEvictionAutomationOtherQueue>>;
   getEvictionAutomationNoticeQueue: (currentPage: number, pageSize: number, isConfirmed: boolean, isViewAll: boolean, search?: string) => void;
   selectedEvictionNoticeConfirmedId: string[];
   setSelectedEvictionNoticeConfirmedId: Dispatch<SetStateAction<string[]>>;

   evictionAutomationPropexoQueue: IEvictionAutomationPropexoQueue;
   setEvictionAutomationPropexoQueue: Dispatch<SetStateAction<IEvictionAutomationPropexoQueue>>;
   getEvictionAutomationPropexoQueue: (currentPage: number, pageSize: number) => void;

   evictionAutomationIntegrationsQueue: IEvictionAutomationIntegrationsQueue;
   getEvictionAutomationIntegrationsQueue: (currentPage: number, pageSize: number, pmsName: string, serach?: string) => void;
   getUnitsForProperty: (pmsId: string, propertyId: string) => void;
   updateUnits:(pmsId: string, propertyId: string, unitsToUpdate: IUnitsForProperty []) => void;

   evictionAutomationNotices: ILateNotices; // The type of late notices data
   setEvictionAutomationNotices: Dispatch<SetStateAction<ILateNotices>>; // A function to update late notices
  getEvictionAutomationNotices: (
    currentPage: number,
    pageSize: number,
    search?: string,
    filingType?:boolean|null,     
    status?:number,
  ) => void;
  allIntegrations: IIntegrationList[];
  allPMS: IPMSList[];
  getAllIntegrations: () => void;
  getAllPMS: () => void;
  setAllIntegrations: Dispatch<SetStateAction<IIntegrationList[]>>;
};

const initialEvictionAutomationQueueContextValue: EvictionAutomationContextType = {
   showSpinner: false,
   setShowSpinner: () => { },
   evictionAutomationQueue: {
      items: [],
      currentPage: 1,
      pageSize: 1,
      totalCount: 0,
      totalPages: 1,
   },
   evictionAutomationPropexoQueue: {
      items: [
         {

            pmsName: "",
   county: "",
   country: "",
   zip: "",
   state: "",
   city: "",
   streetAddress2: "",
   streetAddress1: "",
   propertyName: "",
   propertyId: "",
   isActive:false
         },
      ],
      currentPage: 1,
      pageSize: 1,
      totalCount: 0,
      totalPages: 1,
   },
   evictionAutomationIntegrationsQueue: {
      items: [
         {

            pmsName: "",
   county: "",
   country: "",
   zip: "",
   state: "",
   city: "",
   streetAddress2: "",
   streetAddress1: "",
   propertyName: "",
   propertyId: "",
   isActive:false
         },
      ],
      currentPage: 1,
      pageSize: 1,
      totalCount: 0,
      totalPages: 1,
   },
   evictionAutomationApprovalsQueue: {
      items: [],

      currentPage: 1,
      pageSize: 1,
      totalCount: 0,
      totalPages: 1,
      isViewAll: true,
   },
   evictionAutomationDismissalApprovalsQueue: {
      items: [
         {
            isChecked: false,
            id: "",
            county: "",
            tenantNames: [
               { firstName: "", lastName: "", middleName: "" },
            ],
            andAllOtherTenants: "",
            tenantAddress: "",
            tenantUnit: "",
            tenantCity: "",
            tenantState: "",
            tenantZip: "",
            reason: "",
            evictionTotalRentDue: "",
            monthlyRent: 0, // Example monthly rent
            allMonths: "",
            evictionOtherFees: "",
            ownerName: "",
            propertyName: "",
            propertyPhone: "",
            propertyEmail: "",
            propertyAddress: "",
            propertyCity: "",
            propertyState: "",
            propertyZip: "",
            attorneyName: "",
            attorneyBarNo: "",
            attorneyEmail: "",
            filerBusinessName: "",
            evictionAffiantIs: "",
            filerPhone: "",
            filerEmail: "",
            processServer: "",
            processServerEmail: "",
            expedited: "",
            stateCourt: "",
            clientReferenceId: "",
            processServerCompany: "",
            clientId:""

         },
      ],

      currentPage: 1,
      pageSize: 1,
      totalCount: 0,
      totalPages: 1,
      isViewAll: true,
   },
   evictionAutomationApprovedQueue: {
      items: [],
      currentPage: 1,
      pageSize: 1,
      totalCount: 0,
      totalPages: 1,
      isViewAll: true,
   },

   evictionAutomationSignedQueue: {
      items: [
         {
            isChecked: false,
            id: "",
            county: "",
            tenantNames: [
               { firstName: "", lastName: "", middleName: "" },
            ],
            andAllOtherTenants: "",
            tenantAddress: "",
            tenantUnit: "",
            tenantCity: "",
            tenantState: "",
            tenantZip: "",
            reason: "",
            evictionTotalRentDue: "",
            monthlyRent: 0, // Example monthly rent
            allMonths: "",
            evictionOtherFees: "",
            ownerName: "",
            propertyName: "",
            propertyPhone: "",
            propertyEmail: "",
            propertyAddress: "",
            propertyCity: "",
            propertyState: "",
            propertyZip: "",
            attorneyName: "",
            attorneyBarNo: "",
            attorneyEmail: "",
            filerBusinessName: "",
            evictionAffiantIs: "",
            filerPhone: "",
            filerEmail: "",
            processServer: "",
            processServerEmail: "",
            expedited: "",
            stateCourt: "",
            clientReferenceId: "",
            processServerCompany: "",
            clientId:""

         },
      ],
      currentPage: 1,
      pageSize: 1,
      totalCount: 1,
      totalPages: 1,
      isViewAll: true,
   },

   evictionAutomationDismissalApprovedQueue: {
      items: [
         {
            isChecked: false,
            id: "",
            county: "",
            tenantNames: [
               { firstName: "", lastName: "", middleName: "" },
            ],
            andAllOtherTenants: "",
            tenantAddress: "",
            tenantUnit: "",
            tenantCity: "",
            tenantState: "",
            tenantZip: "",
            reason: "",
            evictionTotalRentDue: "",
            monthlyRent: 0, // Example monthly rent
            allMonths: "",
            evictionOtherFees: "",
            ownerName: "",
            propertyName: "",
            propertyPhone: "",
            propertyEmail: "",
            propertyAddress: "",
            propertyCity: "",
            propertyState: "",
            propertyZip: "",
            attorneyName: "",
            attorneyBarNo: "",
            attorneyEmail: "",
            filerBusinessName: "",
            evictionAffiantIs: "",
            filerPhone: "",
            filerEmail: "",
            processServer: "",
            processServerEmail: "",
            expedited: "",
            stateCourt: "",
            clientReferenceId: "",
            processServerCompany: "",
            clientId:""

         },
      ],
      currentPage: 1,
      pageSize: 1,
      totalCount: 1,
      totalPages: 1,
      isViewAll: true
   },

   evictionAutomationStatusQueue: {
      items: [{
         name: "",
         ownerId: "",
         propertyId: "",
         pullDate: "",
         status: "",
         batchId: "",
         docUrl: "",
         logUrl:""
      }],
      currentPage: 1,
      pageSize: 1,
      totalCount: 1,
      totalPages: 1,
   }
   ,
   evictionAutomationStatusAllQueueData: {
      items: [{
         name: "",
         ownerId: "",
         propertyId: "",
         pullDate: "",
         status: "",
         batchId: "",
         docUrl: "",
         logUrl:""
      }],
      currentPage: 1,
      pageSize: 1,
      totalCount: 1,
      totalPages: 1,
   }
   ,
   evictionAutomationNotices: {
      items: [
        {
          isChecked: false,
          id: "",
          noticeAffiant: "",
          noticeDate: new Date(),
          noticeDeliveredToName: "",
          deliveryDate: new Date(),
          lateFeesDate: new Date(),
          lateFees: 0,
          otherFees: "",
          noticePeriod: 0,
          deliveredBy: "",
          serviceMethod: "",
          totalDue: 0,
          property: "",
          address: "",
          city: "",
          state: "",
          unit: "",
          // firstName: "",
          // lastName: "",
          zip: "",
          rentDue: 0,
        },
      ],
      currentPage: 1,
      pageSize: 100,
      isConfirmed:true,
      totalCount: 1,
      totalPages: 1,
      searchParam: "",
    },
    transactionCodes: {
      items: [
         {
   companyName: "",
   clientId: "",
   integrationId: "",
   propertyId: "",
   propertyName: "",
   transactionCodes: "",
   ownerId:"",
   ownerName:"",
   propexoTransactionCodes: [
      {
   transactionCodeId: "",
   transactionCodeName: "",
   transactionCodeDescription: "",
   isRent: false,
   CompanyPropertyTransactionCodeId: "",
   isSubsidy:false,
   transactionCodeShortDescription:""
      }
   ],
         },
      ],
      currentPage: 1,
      pageSize: 1,
      totalCount: 0,
      totalPages: 1,
   },
   crmTransactionCodes: {
      items: [
         {
   companyName: "",
   clientId: "",
   integrationId: "",
   propertyId: "",
   propertyName: "",
   transactionCodes: "",
   ownerId:"",
   ownerName:"",
   crmTransactionCodes: [
      {
   id: "",
   transactionCodeId: "",
   transactionCodeName: "",
   transactionCodeDescription: "",
   isRent: false,
   CompanyPropertyTransactionCodeId: "",
   isSubsidy:false,
   transactionCodeShortDescription:""
      }
   ],
         },
      ],
      currentPage: 1,
      pageSize: 1,
      totalCount: 0,
      totalPages: 1,
   },
   propertyUnits: [
      {
         propertyId : "",
         unitId: "",
         unitNumber: "",
         address1: "",
         address2: "",
         city: "",
         state: "",
         zip: "",
         county: ""
      }
   ],
   setEvictionAutomationQueue: () => { },
   setEvictionAutomationApprovalsQueue: () => { },
   setEvictionAutomationDismissalApprovalsQueue: () => { },
   setEvictionAutomationApprovedQueue: () => { },
   setEvictionAutomationSignedQueue: () => { },
   setEvictionAutomationDismissalApprovedQueue: () => { },
   setEvictionAutomationStatusQueue: () => { },
   setEvictionAutomationStatusAllQueueData: () => { },
   setEvictionAutomationNotices: () => { },
   setTransactionCodes: () => { },
   setCRMTransactionCodes: () => {},
   getEvictionAutomationStatusQueue: () => { },
   getEvictionAutomationApprovalsQueue: () => { },
   getEvictionAutomationSignedQueue: () => { },
   getEvictionAutomationDismissalApprovalsQueue: () => { },
   getEvictionAutomationQueue: () => { },
   getEvictionAutomationNotices: () => { },
   getTransactionCodes: () => { },
   getCRMTransactionCodes: () => { },
   selectedEvictionAutomationQueueIds: [],
   selectedEvictionAutomationStatusIds: [],
   setSelectedEvictionStatusId: () => { },
   setSelectedEvictionAutomationQueueIds: () => { },
   filteredRecords: [],
   setFilteredRecords: () => { },
   bulkEditRecords: [],
   setBulkEditRecords: () => { },
   bulkRecordsNotices: [],
   setBulkRecordsNotices: () => { },
   selectedEvictionApprovalId: [],
   setSelectedEvictionApprovalId: () => { },
   selectedEvictionApprovedId: [],
   setSelectedEvictionApprovedId: () => { },
   selectedEvictionDismissalApprovalId: [],
   setSelectedEvictionDismissalApprovalId: () => { },
   selectedEvictionDismissalApprovedId: [],
   setSelectedEvictionDismissalApprovedId: () => { },
   selectedEvictionAutomationNoticeId: [],
   setselectedEvictionAutomationNoticeId: () => { },
   allCompanies: [
      {
         id: "",
         companyName: "",
         phone: "",
         clientType: "",
         addressLine1: "",
         addressLine2: "",
         city: "",
         state: "",
         postalCode: "",
         email: "",
         notes: "",
         isProcessServer: false,
      },
   ],
   getAllCompanies: () => { },
   setAllCompanies: () => { },
   allProperties: [
      {
 pmsName: "",
county: "",
country: "",
zip: "",
state: "",
city: "",
streetAddress2: "",
streetAddress1: "",
propertyName: "",
propertyId: "",
isActive:false
      },
   ],
   getAllProperties: () => { },
   setAllProperties: () => { },
   selectedReason: [],
   setSelectedReason: () => { },
   getAllCounties: () => { },
   setAllCounties: () => { },
   allCounties: [
      {
         stateName: "",
         countyName: "",
         method: "",
         endPoint: "",
         isMultipleAOSPdf: false
      },
   ],
   selectedEvictionNoticeId: [],
   setSelectedEvictionNoticeId: () => { },
   evictionAutomationNoticesConfirmQueue:
   {
      items: [{
         isChecked: false,
         id: "",
         county: "",
         tenantNames: [
            { firstName: "", lastName: "", middleName: "" },
         ],
         andAllOtherTenants: "",
         tenantAddress: "",
         tenantUnit: "",
         tenantCity: "",
         tenantState: "",
         tenantZip: "",
         reason: "",
         evictionTotalRentDue: "",
         monthlyRent: 0, // Example monthly rent
         allMonths: "",
         evictionOtherFees: "",
         ownerName: "",
         propertyName: "",
         propertyPhone: "",
         propertyEmail: "",
         propertyAddress: "",
         propertyCity: "",
         propertyState: "",
         propertyZip: "",
         attorneyName: "",
         attorneyBarNo: "",
         attorneyEmail: "",
         filerBusinessName: "",
         evictionAffiantIs: "",
         filerPhone: "",
         filerEmail: "",
         processServer: "",
         processServerEmail: "",
         expedited: "",
         stateCourt: "",
         clientReferenceId: "",
         processServerCompany: "",
         clientId:""
      },],
      currentPage: 1,
      pageSize: 1,
      totalCount: 1,
      totalPages: 1,
      isViewAll: true,
   },
   setEvictionAutomationNoticesConfirmQueue: () => { },
   evictionAutomationNoticesConfirmedQueue:
   {
      items: [{
         isChecked: false,
         id: "",
         county: "",
         tenantNames: [
            { firstName: "", lastName: "", middleName: "" },
         ],
         andAllOtherTenants: "",
         tenantAddress: "",
         tenantUnit: "",
         tenantCity: "",
         tenantState: "",
         tenantZip: "",
         reason: "",
         evictionTotalRentDue: "",
         monthlyRent: 0, // Example monthly rent
         allMonths: "",
         evictionOtherFees: "",
         ownerName: "",
         propertyName: "",
         propertyPhone: "",
         propertyEmail: "",
         propertyAddress: "",
         propertyCity: "",
         propertyState: "",
         propertyZip: "",
         attorneyName: "",
         attorneyBarNo: "",
         attorneyEmail: "",
         filerBusinessName: "",
         evictionAffiantIs: "",
         filerPhone: "",
         filerEmail: "",
         processServer: "",
         processServerEmail: "",
         expedited: "",
         stateCourt: "",
         clientReferenceId: "",
         processServerCompany: "", 
         clientId:""       
      },],
      currentPage: 1,
      pageSize: 1,
      totalCount: 1,
      totalPages: 1,
      isViewAll: true,
   },
   setEvictionAutomationNoticesConfirmedQueue: () => { },
   getEvictionAutomationNoticeQueue: () => { },
   setEvictionAutomationPropexoQueue: () => { },
   getEvictionAutomationPropexoQueue: () => { },
   getEvictionAutomationIntegrationsQueue: () => { },
   getUnitsForProperty: () => {},
   updateUnits: () => {},
   selectedEvictionNoticeConfirmedId: [],
   setSelectedEvictionNoticeConfirmedId: () => { },
   allIntegrations:[
      {
         integrationId:"",
         integrationName:"",
         integrationVendorName:""
      }
   ],
   allPMS:[
      {
      pmsName: "",
      id:""
      }
    
   ],
   getAllPMS: () => {},
   getAllIntegrations:()=>{},
   setAllIntegrations:()=>{}
};

export const EvictionAutomationQueueContext = createContext<EvictionAutomationContextType>(initialEvictionAutomationQueueContextValue);

export const EvictionAutomationQueueProvider: React.FC<{ children: any }> = ({ children }) => {
   const [showSpinner, setShowSpinner] = useState<boolean>(false);
   const [evictionAutomationQueue, setEvictionAutomationQueue] = useState<IEvictionAutomationQueue>(initialEvictionAutomationQueueContextValue.evictionAutomationQueue);
   const [evictionAutomationPropexoQueue, setEvictionAutomationPropexoQueue] = useState<IEvictionAutomationPropexoQueue>(initialEvictionAutomationQueueContextValue.evictionAutomationPropexoQueue);
   const [evictionAutomationApprovalsQueue, setEvictionAutomationApprovalsQueue] = useState<IEvictionAutomationOtherQueue>(initialEvictionAutomationQueueContextValue.evictionAutomationApprovalsQueue);
   const [evictionAutomationDismissalApprovalsQueue, setEvictionAutomationDismissalApprovalsQueue] = useState<IEvictionAutomationOtherQueue>(initialEvictionAutomationQueueContextValue.evictionAutomationDismissalApprovalsQueue);
   const [evictionAutomationApprovedQueue, setEvictionAutomationApprovedQueue] = useState<IEvictionAutomationOtherQueue>(initialEvictionAutomationQueueContextValue.evictionAutomationApprovedQueue);
   const [evictionAutomationSignedQueue, setEvictionAutomationSignedQueue] = useState<IEvictionAutomationOtherQueue>(initialEvictionAutomationQueueContextValue.evictionAutomationSignedQueue);
   const [evictionAutomationDismissalApprovedQueue, setEvictionAutomationDismissalApprovedQueue] = useState<IEvictionAutomationOtherQueue>(initialEvictionAutomationQueueContextValue.evictionAutomationDismissalApprovedQueue);
   const [evictionAutomationStatusQueue, setEvictionAutomationStatusQueue] = useState<IEvictionAutomationStatusQueue>(initialEvictionAutomationQueueContextValue.evictionAutomationStatusQueue);
   const [evictionAutomationStatusAllQueueData, setEvictionAutomationStatusAllQueueData] = useState<IEvictionAutomationStatusQueue>(initialEvictionAutomationQueueContextValue.evictionAutomationStatusAllQueueData);
   const [transactionCodes, setTransactionCodes] = useState<ITransactionCodes>(initialEvictionAutomationQueueContextValue.transactionCodes);
   const [crmTransactionCodes, setCRMTransactionCodes] = useState<ICRMTransactionCodesResult>(initialEvictionAutomationQueueContextValue.crmTransactionCodes);
   const [selectedEvictionAutomationQueueIds, setSelectedEvictionAutomationQueueIds] = useState<
      string[]
   >(initialEvictionAutomationQueueContextValue.selectedEvictionAutomationQueueIds);
   const [selectedEvictionAutomationStatusIds, setSelectedEvictionStatusId] = useState<string[]>
   (initialEvictionAutomationQueueContextValue.selectedEvictionAutomationStatusIds);
   const [filteredRecords, setFilteredRecords] = useState<IEvictionAutomationQueueItem[]>([]);
   const [bulkEditRecords, setBulkEditRecords] = useState<IEvictionAutomationQueueItem[]>([]);
   const [selectedEvictionApprovalId, setSelectedEvictionApprovalId] = useState<string[]>(
      initialEvictionAutomationQueueContextValue.selectedEvictionApprovalId
   );
   const [selectedEvictionApprovedId, setSelectedEvictionApprovedId] = useState<string[]>(
      initialEvictionAutomationQueueContextValue.selectedEvictionApprovedId
   );
   const [selectedEvictionNoticeConfirmedId, setSelectedEvictionNoticeConfirmedId] = useState<string[]>(
      initialEvictionAutomationQueueContextValue.selectedEvictionApprovedId
   );
   const [selectedEvictionNoticeId, setSelectedEvictionNoticeId] = useState<string[]>(
      initialEvictionAutomationQueueContextValue.selectedEvictionNoticeId
   );
   const [selectedEvictionDismissalApprovalId, setSelectedEvictionDismissalApprovalId] = useState<string[]>(
      initialEvictionAutomationQueueContextValue.selectedEvictionDismissalApprovalId
   );
   const [selectedEvictionDismissalApprovedId, setSelectedEvictionDismissalApprovedId] = useState<string[]>(
      initialEvictionAutomationQueueContextValue.selectedEvictionApprovedId
   );
   // state to hold data for selected grids
  const [selectedEvictionAutomationNoticeId, setselectedEvictionAutomationNoticeId] = useState<string[]>(
   initialEvictionAutomationQueueContextValue.selectedEvictionAutomationNoticeId
 );
   // State to hold the eviction automation notices data
  const [evictionAutomationNotices, setEvictionAutomationNotices] = useState<ILateNotices>(
   initialEvictionAutomationQueueContextValue.evictionAutomationNotices
 );
 const {selectedStateValue}=useAuth();
 const [bulkRecordsNotices, setBulkRecordsNotices] = useState<
    ILateNoticesItems[]
  >([]);
   const [allCompanies, setAllCompanies] = useState<ICompanyItems[]>(
      initialEvictionAutomationQueueContextValue.allCompanies
   );
   const [propertyUnits, setPropertyUnits] = useState<IUnitsForProperty[]>(
      initialEvictionAutomationQueueContextValue.propertyUnits
   );
   const [allProperties, setAllProperties] = useState<IEvictionAutomationPropexoGridItem[]>(
      initialEvictionAutomationQueueContextValue.allProperties
   );
   const [allIntegrations, setAllIntegrations] = useState<IIntegrationList[]>(
      initialEvictionAutomationQueueContextValue.allIntegrations
   );
   const [allPMS, setAllPMS] = useState<IPMSList[]>(
      initialEvictionAutomationQueueContextValue.allPMS
   );
   const [selectedReason, setSelectedReason] = useState<IAllCasesReason[]>(
      initialEvictionAutomationQueueContextValue.selectedReason
   );
   const [allCounties, setAllCounties] = useState<ICountyItems[]>(
      initialEvictionAutomationQueueContextValue.allCounties
   );
   const [evictionAutomationNoticesConfirmQueue, setEvictionAutomationNoticesConfirmQueue] = useState<IEvictionAutomationOtherQueue>(initialEvictionAutomationQueueContextValue.evictionAutomationNoticesConfirmQueue);
   const [evictionAutomationNoticesConfirmedQueue, setEvictionAutomationNoticesConfirmedQueue] = useState<IEvictionAutomationOtherQueue>(initialEvictionAutomationQueueContextValue.evictionAutomationNoticesConfirmedQueue);   
   const [evictionAutomationIntegrationsQueue, setEvictionAutomationIntegrationsQueue] = useState<IEvictionAutomationIntegrationsQueue>(initialEvictionAutomationQueueContextValue.evictionAutomationIntegrationsQueue);
   const getEvictionAutomationApprovalsQueue = async (
      currentPage: number,
      pageSize: number,
      isApproved: boolean,
      isViewAll: boolean,
      searchParam?: string,
      companyId?:string,
   ) => {
      try {

         setShowSpinner(true);
         var casesIds = localStorage.getItem("casesList")?.split(",").filter(id => id.trim() !== "");
         var ownerId = localStorage.getItem("ownerId");
         var propertyId = localStorage.getItem("propertyId");
         var propertyEmail = localStorage.getItem("propertyEmail");
         
         const apiResponse = await EvictionAutomationService.getEvictionAutomationApprovalsQueue(
            currentPage,
            pageSize,
            isApproved,
            isViewAll,
            searchParam,
            casesIds ?? [],
            companyId ?? "",
            ownerId ?? "",
            propertyEmail ?? "",
            propertyId ?? "" ,
            selectedStateValue    
         );
         if (apiResponse.status === HttpStatusCode.Ok) {

            if (isApproved) {
               setEvictionAutomationApprovedQueue((prevAllCases) => ({
                  ...prevAllCases,
                  items: apiResponse.data.items,
                  currentPage: apiResponse.data.currentPage,
                  totalCount: apiResponse.data.totalCount,
                  totalPages: apiResponse.data.totalPages,
                  pageSize: apiResponse.data.pageSize,
                  isViewAll: isViewAll,
                  companyId:companyId,
                  ...(searchParam ? { searchParam: searchParam } : {}),
               }));
            }

            else {
               setEvictionAutomationApprovalsQueue((prevAllCases) => ({
                  ...prevAllCases,
                  items: apiResponse.data.items,
                  currentPage: apiResponse.data.currentPage,
                  totalCount: apiResponse.data.totalCount,
                  totalPages: apiResponse.data.totalPages,
                  pageSize: apiResponse.data.pageSize,
                  isViewAll: isViewAll,
                  ...(searchParam ? { searchParam: searchParam } : {}),
               }));
            }

         }
      } finally {

         localStorage.removeItem("ownerId");
         localStorage.removeItem("propertyId");
         localStorage.removeItem("propertyEmail");

         setShowSpinner(false);
      }
   };
   const getEvictionAutomationNoticeQueue = async (
      currentPage: number,
      pageSize: number,
      isConfirmed: boolean,
      isViewAll: boolean,
      searchParam?: string,
   ) => {
      try {

         setShowSpinner(true);
         var casesIds = localStorage.getItem("casesList")?.split(",");
         const apiResponse = await EvictionAutomationService.getEvictionAutomationNoticeQueue(
            currentPage,
            pageSize,
            isConfirmed,
            isViewAll,
            searchParam,
            casesIds ?? []
         );
         if (apiResponse.status === HttpStatusCode.Ok) {
;
            if (isConfirmed) {
               setEvictionAutomationNoticesConfirmedQueue((prevAllCases) => ({
                  ...prevAllCases,
                  items: apiResponse.data.items,
                  currentPage: apiResponse.data.currentPage,
                  totalCount: apiResponse.data.totalCount,
                  totalPages: apiResponse.data.totalPages,
                  pageSize: apiResponse.data.pageSize,
                  isViewAll: isViewAll,
                  ...(searchParam ? { searchParam: searchParam } : {}),
               }));
            }

            else {
               setEvictionAutomationNoticesConfirmQueue((prevAllCases) => ({
                  ...prevAllCases,
                  items: apiResponse.data.items,
                  currentPage: apiResponse.data.currentPage,
                  totalCount: apiResponse.data.totalCount,
                  totalPages: apiResponse.data.totalPages,
                  pageSize: apiResponse.data.pageSize,
                  isViewAll: isViewAll,
                  ...(searchParam ? { searchParam: searchParam } : {}),
               }));
            }

         }
      } finally {
         setShowSpinner(false);
      }
   };
   const getEvictionAutomationDismissalApprovalsQueue = async (
      currentPage: number,
      pageSize: number,
      isDismissed: boolean,
      isViewAll: boolean,
      searchParam?: string,
   ) => {
      try {

         setShowSpinner(true);
         var casesIds = localStorage.getItem("casesList")?.split(",");
         const apiResponse = await EvictionAutomationService.getEvictionAutomationDismissalApprovalsQueue(
            currentPage,
            pageSize,
            isDismissed,
            isViewAll,
            searchParam,
            casesIds ?? []
         );
         if (apiResponse.status === HttpStatusCode.Ok) {
            if (isDismissed) {
               setEvictionAutomationDismissalApprovedQueue((prevAllCases) => ({
                  ...prevAllCases,
                  items: apiResponse.data.items,
                  currentPage: apiResponse.data.currentPage,
                  totalCount: apiResponse.data.totalCount,
                  totalPages: apiResponse.data.totalPages,
                  pageSize: apiResponse.data.pageSize,
                  isViewAll: isViewAll,
                  ...(searchParam ? { searchParam: searchParam } : {}),
               }));
            }
            else {
               setEvictionAutomationDismissalApprovalsQueue((prevAllCases) => ({
                  ...prevAllCases,
                  items: apiResponse.data.items,
                  currentPage: apiResponse.data.currentPage,
                  totalCount: apiResponse.data.totalCount,
                  totalPages: apiResponse.data.totalPages,
                  pageSize: apiResponse.data.pageSize,
                  isViewAll: isViewAll,
                  ...(searchParam ? { searchParam: searchParam } : {}),
               }));
            }

         }
      } finally {
         setShowSpinner(false);
      }
   };

   const getEvictionAutomationSignedQueue = async (
      currentPage: number,
      pageSize: number,
      searchParam?: string,
   ) => {
      try {

         setShowSpinner(true);
         // const apiResponse = await EvictionAutomationService.getEvictionAutomationApprovalsQueue(
         //    currentPage,
         //    pageSize,            
         //    isApproved,
         //    isSigned,
         //    searchParam,
         // );
         // if (apiResponse.status === HttpStatusCode.Ok) {

         //    if(isApproved){
         //       setEvictionAutomationDismissalApprovedQueue((prevAllCases) => ({
         //          ...prevAllCases,
         //          items: apiResponse.data.items,
         //          currentPage: apiResponse.data.currentPage,
         //          totalCount: apiResponse.data.totalCount,
         //          totalPages: apiResponse.data.totalPages,
         //          pageSize: apiResponse.data.pageSize,
         //          ...(searchParam ? { searchParam: searchParam } : {}),
         //       }));
         //    }
         //    else{
         //       setEvictionAutomationDismissalApprovalsQueue((prevAllCases) => ({
         //          ...prevAllCases,
         //          items: apiResponse.data.items,
         //          currentPage: apiResponse.data.currentPage,
         //          totalCount: apiResponse.data.totalCount,
         //          totalPages: apiResponse.data.totalPages,
         //          pageSize: apiResponse.data.pageSize,
         //          ...(searchParam ? { searchParam: searchParam } : {}),
         //       }));s
         //    }

         // }
      } finally {
         setShowSpinner(false);
      }
   };

   const getEvictionAutomationQueue = async (
      currentPage: number,
      pageSize: number,
      searchParam?: string,
      companyId?: string,
      county?: string,
      isExpedited?: number,
      isStateCourt?: number
   ) => {
      try {

         setShowSpinner(true);
         const apiResponse = await EvictionAutomationService.getEvictionAutomationSettings(
            currentPage,
            pageSize,
            searchParam,
            companyId,
            county,
            isExpedited,
            isStateCourt
         );
         if (apiResponse.status === HttpStatusCode.Ok) {
            setEvictionAutomationQueue((prevAllCases) => ({
               ...prevAllCases,
               items: apiResponse.data.items,
               currentPage: apiResponse.data.currentPage,
               totalCount: apiResponse.data.totalCount,
               totalPages: apiResponse.data.totalPages,
               pageSize: apiResponse.data.pageSize,
               ...(searchParam ? { searchParam: searchParam } : {}),
            }));
         }
      } finally {
         setShowSpinner(false);
      }
   };

   const getEvictionAutomationPropexoQueue = async (
      currentPage: number,
      pageSize: number
   ) => {
      try {
         setShowSpinner(true);
         const apiResponse = await EvictionAutomationService.getEvictionAutomationPropexo(
            currentPage,
            pageSize
         );
         if (apiResponse.status === HttpStatusCode.Ok) {
            setEvictionAutomationPropexoQueue((prevAllCases) => ({
               ...prevAllCases,
               items: apiResponse.data.items,
               currentPage: apiResponse.data.currentPage,
               totalCount: apiResponse.data.totalCount,
               totalPages: apiResponse.data.totalPages,
               pageSize: apiResponse.data.pageSize
            }));
         }
      } finally {
         setShowSpinner(false);
      }
   };

  const updateUnits = async (
   pmsId: string,
   propertyId: string,
   unitToUpdate: IUnitsForProperty []
  ) => {
   try{
      setShowSpinner(true);
      const apiResponse = await EvictionAutomationService.updateUnits(
         pmsId,
         propertyId,
         unitToUpdate
      );
      if(apiResponse.status === HttpStatusCode.Ok){
         toast.success('Unit(s) Updated Succesfully.')
      }
      else{
         toast.error('Some error occured.')
      }
   }
   finally {
      setShowSpinner(false);
   }
  };
  


   const getUnitsForProperty = async (
      pmsId: string,
      propertyId: string
   ) => {
      try{
         setShowSpinner(true);
         const apiResponse = await EvictionAutomationService.getUnitsForProperty(
            pmsId,
            propertyId
         );
         if(apiResponse.status === HttpStatusCode.Ok)
            {
   setPropertyUnits(apiResponse.data);
         }
      }
      finally {
         setShowSpinner(false);
      }
   };

   const getEvictionAutomationIntegrationsQueue = async (
      currentPage: number,
      pageSize: number,
      pmsName: string,
      search?: string
   ) => {
      try {
         setShowSpinner(true);
         const apiResponse = await EvictionAutomationService.getEvictionAutomationIntegrations(
            currentPage,
            pageSize,
            pmsName,
            search
         );
         if (apiResponse.status === HttpStatusCode.Ok) {
            setEvictionAutomationIntegrationsQueue((prevAllCases) => ({
               ...prevAllCases,
               items: apiResponse.data.items,
               currentPage: apiResponse.data.currentPage,
               totalCount: apiResponse.data.totalCount,
               totalPages: apiResponse.data.totalPages,
               pageSize: apiResponse.data.pageSize
            }));
         }
      } finally {
         setShowSpinner(false);
      }
   };

   const getTransactionCodes = async (
      currentPage: number,
      pageSize: number,
      searchParam?: string,
      companyId?: string,
      integrationId?:string,
      ownerId?:string,
      propertyId?: string,
   ) => {
      try {

         setShowSpinner(true);
         const apiResponse = await EvictionAutomationService.getTransactionCodes(
            currentPage,
            pageSize,
            searchParam,
            companyId,
            integrationId,
            ownerId,
            propertyId,

         );
         if (apiResponse.status === HttpStatusCode.Ok) {
            setTransactionCodes((prevAllCases) => ({
               ...prevAllCases,
               items: apiResponse.data.items,
               currentPage: apiResponse.data.currentPage,
               totalCount: apiResponse.data.totalCount,
               totalPages: apiResponse.data.totalPages,
               pageSize: apiResponse.data.pageSize,
               ...(searchParam ? { searchParam: searchParam } : {}),
            }));
         }
      } finally {
         setShowSpinner(false);
      }
   };

   const getCRMTransactionCodes = async (
      currentPage: number,
      pageSize: number,
      searchParam?: string,
      companyId?: string,
      integrationId?:string,
      ownerId?:string,
      propertyId?: string,
   ) => {
      try {

         setShowSpinner(true);
         const apiResponse = await EvictionAutomationService.getCRMTransactionCodes(
            currentPage,
            pageSize,
            searchParam,
            companyId,
            integrationId,
            ownerId,
            propertyId,

         );
         if (apiResponse.status === HttpStatusCode.Ok) {
            setCRMTransactionCodes((prevAllCases) => ({
               ...prevAllCases,
               items: apiResponse.data.items,
               currentPage: apiResponse.data.currentPage,
               totalCount: apiResponse.data.totalCount,
               totalPages: apiResponse.data.totalPages,
               pageSize: apiResponse.data.pageSize,
               ...(searchParam ? { searchParam: searchParam } : {}),
            }));
         }
      } finally {
         setShowSpinner(false);
      }
   };

   /**
   * Get list of eviction automation notices from api and bind that with the eviction automation notice screen
   *
   */
  const getEvictionAutomationNotices = async (
   currentPage: number,
   pageSize: number,
   search?: string,
   filingType?:boolean|null,
   status?:number,
 ) => {
   try {
     
     setShowSpinner(true);
     // get late notices
     const apiResponse = await EvictionAutomationService.getAllEvictionAutomationNotice(
       currentPage,
       pageSize,
       search,
       "",
       filingType,
       status
     );
     if (apiResponse.status === HttpStatusCode.Ok) {
      setEvictionAutomationNotices((prevLateNotices) => ({
         ...prevLateNotices,
         items: apiResponse.data.items,
         currentPage: apiResponse.data.currentPage,
         totalCount: apiResponse.data.totalCount,
         totalPages: apiResponse.data.totalPages,
         pageSize: apiResponse.data.pageSize,
         filingType:filingType,
         status:status,
         ...(search ? { searchParam: search } : {}),
       }));
     }
   } finally {
     setShowSpinner(false);
   }
 };





   const getAllCompanies = async () => {
      try {
         setShowSpinner(true);
         // get late notices
         const apiResponse = await AllUsersService.getAllCompaniesList();
         if (apiResponse.status === HttpStatusCode.Ok) {
            setAllCompanies(apiResponse.data);
         }
      } finally {
         setShowSpinner(false);
      }
   };

   const getAllProperties = async () => {
      try {
         setShowSpinner(true);
         // get late notices
         const apiResponse = await AllUsersService.getAllPropertiesList();
         if (apiResponse.status === HttpStatusCode.Ok) {
            setAllProperties(apiResponse.data);
         }
      } finally {
         setShowSpinner(false);
      }
   };

   const getEvictionAutomationStatusQueue = async (currentPage: number, pageSize: number, search?: string) => {
      try {
         ;
         setShowSpinner(true);
         const apiResponse = await EvictionAutomationService.getEvictionAutomationSatus(currentPage, pageSize, search);
         if (apiResponse.status === HttpStatusCode.Ok) {
            setEvictionAutomationStatusQueue((prevAllCases) => ({
               ...prevAllCases,
               items: apiResponse.data.items,
               currentPage: apiResponse.data.currentPage,
               totalCount: apiResponse.data.totalCount,
               totalPages: apiResponse.data.totalPages,
               pageSize: apiResponse.data.pageSize,
               ...(search ? { searchParam: search } : {}),
            }));
            setEvictionAutomationStatusAllQueueData((prevAllCases) => ({
               ...prevAllCases,
               items: apiResponse.data.items,
               currentPage: apiResponse.data.currentPage,
               totalCount: apiResponse.data.totalCount,
               totalPages: apiResponse.data.totalPages,
               pageSize: apiResponse.data.pageSize,
               ...(search ? { searchParam: search } : {}),
            }));
         }
      } finally {
         setShowSpinner(false);
      }
   };
   const getAllCounties = async () => {
      try {
         // setShowSpinner(true);
         const response = await CountyService.getCounties();
         if (response.status === HttpStatusCode.Ok) {
            setAllCounties(response.data);
         }
      } catch (error) {
         console.log(error);
      }
   };
   const getAllIntegrations = async () => {
      try {
         setShowSpinner(true);
         // get late notices
         const apiResponse = await EvictionAutomationService.getallIntegrations();
         if (apiResponse.status === HttpStatusCode.Ok) {
            setAllIntegrations(apiResponse.data);
         }
      }catch (error) {
         setShowSpinner(false);
         console.log(error);
      } 
      finally {
         setShowSpinner(false);
      }
   };

   const getAllPMS = async () => {
      try {
         setShowSpinner(true);
         // get late notices
         const apiResponse = await EvictionAutomationService.getAllPMS();
         if (apiResponse.status === HttpStatusCode.Ok) {
            setAllPMS(apiResponse.data);
         }
      }catch (error) {
         setShowSpinner(false);
         console.log(error);
      } 
      finally {
         setShowSpinner(false);
      }
   };

   return (
      <EvictionAutomationQueueContext.Provider
         value={{
            showSpinner,
            setShowSpinner,
            evictionAutomationQueue,
            evictionAutomationPropexoQueue,
            evictionAutomationIntegrationsQueue,
            evictionAutomationApprovalsQueue,
            evictionAutomationDismissalApprovalsQueue,
            evictionAutomationApprovedQueue,
            evictionAutomationSignedQueue,
            evictionAutomationDismissalApprovedQueue,
            evictionAutomationStatusQueue,
            evictionAutomationStatusAllQueueData,
            evictionAutomationNotices,
            transactionCodes,
            setEvictionAutomationQueue,
            setEvictionAutomationApprovalsQueue,
            setEvictionAutomationDismissalApprovalsQueue,
            setEvictionAutomationSignedQueue,
            setEvictionAutomationDismissalApprovedQueue,
            setEvictionAutomationStatusQueue,
            setEvictionAutomationStatusAllQueueData,
            setTransactionCodes,
            setEvictionAutomationNotices,
            getEvictionAutomationStatusQueue,
            getEvictionAutomationQueue,
            getEvictionAutomationApprovalsQueue,
            getEvictionAutomationSignedQueue,
            getEvictionAutomationPropexoQueue,
            getEvictionAutomationIntegrationsQueue,
            getEvictionAutomationDismissalApprovalsQueue,
            getEvictionAutomationNotices,
            getTransactionCodes,
            getCRMTransactionCodes,
            selectedEvictionAutomationQueueIds,
            selectedEvictionAutomationStatusIds,
            setSelectedEvictionStatusId,
            setSelectedEvictionAutomationQueueIds,
            filteredRecords,
            setFilteredRecords,
            bulkEditRecords,
            setBulkEditRecords,
            bulkRecordsNotices,
            setBulkRecordsNotices,
            selectedEvictionApprovalId,
            setSelectedEvictionApprovalId,
            selectedEvictionApprovedId,
            setSelectedEvictionApprovedId,
            selectedEvictionDismissalApprovalId,
            setSelectedEvictionDismissalApprovalId,
            selectedEvictionDismissalApprovedId,
            setSelectedEvictionDismissalApprovedId,
            selectedEvictionAutomationNoticeId,
            setselectedEvictionAutomationNoticeId,
            allCompanies,
            getAllCompanies,
            setAllCompanies,
            allProperties,
            getAllProperties,
            setAllProperties,
            setEvictionAutomationApprovedQueue,
            selectedReason,
            setSelectedReason,
            getAllCounties,
            setAllCounties,
            allCounties,
            setSelectedEvictionNoticeId,
            selectedEvictionNoticeId,
            getEvictionAutomationNoticeQueue,
            setEvictionAutomationNoticesConfirmedQueue,
            setEvictionAutomationNoticesConfirmQueue,
            evictionAutomationNoticesConfirmedQueue,
            evictionAutomationNoticesConfirmQueue,
            selectedEvictionNoticeConfirmedId,
            setSelectedEvictionNoticeConfirmedId,
            setEvictionAutomationPropexoQueue,
            allIntegrations,
            getAllIntegrations,
            setAllIntegrations,
            allPMS,
            getAllPMS,  
            crmTransactionCodes,       
            setCRMTransactionCodes,
            propertyUnits,
            updateUnits,
            getUnitsForProperty
         }}
      >
         {children}
      </EvictionAutomationQueueContext.Provider>
   );
}

export const useEvictionAutomationContext = (): EvictionAutomationContextType => {
   // Get the context value using useContext
   const context = useContext(EvictionAutomationQueueContext);
   // If the context is not found, throw an error
   if (!context) {
      throw new Error(
         "useEvictionAutomationContext must be used within a EvictionAutomationProvider"
      );
   }

   return context;
};

