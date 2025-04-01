//FileEvictionsContext.tsx
import React, {
   Dispatch,
   ReactNode,
   SetStateAction,
   createContext,
   useContext,
   useState,
} from "react";
import {
   IFileEvictionImportCsv,
   IFileEvictions,
} from "interfaces/file-evictions.interface";
import { ICountyItems } from "interfaces/county.interface";
import { ICompanyItems } from "interfaces/all-users.interface";
import FileEvictionsService from "services/file-evictions.service";
import CountyService from "services/county.service";
import AllUsersService from "services/all-users.service";
import { HttpStatusCode } from "utils/enum";
import { IEvictionAutomationOtherQueue} from "interfaces/eviction-automation.interface";
import EvictionAutomationService from "services/eviction-automation.service";
import { useAuth } from "context/AuthContext";

// Define the shape of the context data
type FileEvictionsContextType = {
   showSpinner: boolean;
   setShowSpinner: Dispatch<SetStateAction<boolean>>;
   fileEvictions: IFileEvictions; // The type of file eviction data
   setFileEvictions: Dispatch<SetStateAction<IFileEvictions>>; // A function to update file evictions
   getFileEvictions: (currentPage: number, pageSize: number,isViewAll:boolean, search?: string, companyId?: string,) => void;
   selectedFileEvictionId: string[];
   setSelectedFileEvictionId: Dispatch<SetStateAction<string[]>>;
   filteredRecords: IFileEvictionImportCsv[];
   setFilteredRecords: Dispatch<SetStateAction<IFileEvictionImportCsv[]>>;
   selectedFilteredFileEvictionId: string[];
   setSelectedFilteredFileEvictionId: Dispatch<SetStateAction<string[]>>;
   bulkRecords: IFileEvictionImportCsv[];
   setBulkRecords: Dispatch<SetStateAction<IFileEvictionImportCsv[]>>;
   counties: ICountyItems[];
   setCounties: Dispatch<SetStateAction<ICountyItems[]>>;
   getCounties: () => void;
   allCompanies: ICompanyItems[];
   getAllCompanies: () => void;
   setAllCompanies: Dispatch<SetStateAction<ICompanyItems[]>>;
   evictionAutomationApprovalsQueue: IEvictionAutomationOtherQueue;
   setEvictionAutomationApprovalsQueue: Dispatch<SetStateAction<IEvictionAutomationOtherQueue>>;
   getEvictionAutomationApprovalsQueue: (currentPage: number, pageSize: number, isApproved: boolean, isViewAll: boolean, search?: string,companyId?:string) => void;
   selectedEvictionApprovalId: string[];
   setSelectedEvictionApprovalId: Dispatch<SetStateAction<string[]>>;
};

// Create a context with an initial value
const initialFileEvictionsContextValue: FileEvictionsContextType = {
   fileEvictions: {
      items: [
         {
            isChecked: false,
            id: "",
            county: "",
            tenantNames: [],
            andAllOtherTenants: "",
            tenantAddress: "",
            tenantUnit: "",
            tenantCity: "",
            tenantState: "",
            tenantZip: "",
            reason: "",
            evictionTotalRentDue: "",
            monthlyRent: 0,
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
      pageSize: 100,
      totalCount: 0,
      totalPages: 1,
      searchParam: "",
      evictionPdfLink: "",
   },
   allCompanies: [],
   getAllCompanies: () => { },
   setAllCompanies: () => { },
   setFileEvictions: () => { },
   getFileEvictions: () => { },
   showSpinner: false,
   setShowSpinner: () => { },
   selectedFileEvictionId: [],
   setSelectedFileEvictionId: () => { },
   filteredRecords: [],
   setFilteredRecords: () => { },
   selectedFilteredFileEvictionId: [],
   setSelectedFilteredFileEvictionId: () => { },
   bulkRecords: [],
   setBulkRecords: () => { },
   counties: [],
   setCounties: () => { },
   getCounties: () => { },
   evictionAutomationApprovalsQueue: {
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
   setEvictionAutomationApprovalsQueue: () => { },
   getEvictionAutomationApprovalsQueue: () => { },
   selectedEvictionApprovalId: [],
   setSelectedEvictionApprovalId: () => { },
};

// Create a context with an initial value
const FileEvictionsContext = createContext<FileEvictionsContextType>(
   initialFileEvictionsContextValue
);

// Provide a component to wrap the application and make the context available
export const FileEvictionsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
   const [showSpinner, setShowSpinner] = useState<boolean>(false);
   const [fileEvictions, setFileEvictions] = useState<IFileEvictions>(
      initialFileEvictionsContextValue.fileEvictions
   );
   const [filteredRecords, setFilteredRecords] = useState<IFileEvictionImportCsv[]>([]);
   const [bulkRecords, setBulkRecords] = useState<IFileEvictionImportCsv[]>([]);
   const [selectedFilteredFileEvictionId, setSelectedFilteredFileEvictionId] = useState<string[]>(
      initialFileEvictionsContextValue.selectedFilteredFileEvictionId
   );
   const [selectedFileEvictionId, setSelectedFileEvictionId] = useState<string[]>(
      initialFileEvictionsContextValue.selectedFileEvictionId
   );
   const [allCompanies, setAllCompanies] = useState<ICompanyItems[]>(
      initialFileEvictionsContextValue.allCompanies
   );
   const [counties, setCounties] = useState<ICountyItems[]>([]);
   const [selectedEvictionApprovalId, setSelectedEvictionApprovalId] = useState<string[]>(
      initialFileEvictionsContextValue.selectedEvictionApprovalId
   );
   const { 
      selectedStateValue
    } = useAuth();
   const [evictionAutomationApprovalsQueue, setEvictionAutomationApprovalsQueue] = useState<IEvictionAutomationOtherQueue>(initialFileEvictionsContextValue.evictionAutomationApprovalsQueue);
   const getFileEvictions = async (currentPage: number, pageSize: number,isViewAll:boolean, search?: string, companyId?: string) => {
      try {
         setShowSpinner(true);
         var casesIds = localStorage.getItem("casesList")?.split(",");
         const apiResponse = await FileEvictionsService.getAllFileEvictions(
            currentPage,
            pageSize,
            isViewAll,
            casesIds??[],
            search,
            companyId ?? "",
            selectedStateValue ?? ""
         );
         if (apiResponse.status === HttpStatusCode.OK) {
            setFileEvictions((prev) => ({
               ...prev,
               items: apiResponse.data.items,
               currentPage: apiResponse.data.currentPage,
               totalCount: apiResponse.data.totalCount,
               totalPages: apiResponse.data.totalPages,
               pageSize: apiResponse.data.pageSize,
               isViewAll:isViewAll,
               clientId:companyId,
               ...(search ? { searchParam: search } : {}),
            }));
         }

      } catch (error) {
         console.log(error);
      } finally {
         setShowSpinner(false);
      }
   };

   const getCounties = async () => {
      try {
         // setShowSpinner(true);
         const response = await CountyService.getCounties();
         if (response.status === HttpStatusCode.OK) {
            var stateCounties=response.data.filter(
               (x:any) => x.stateName?.toLowerCase() === selectedStateValue?.toLowerCase()
             );
            setCounties(stateCounties);
         }
      } catch (error) {
         console.log(error);
      } finally {
         // setShowSpinner(true);
      }
   };
   const getAllCompanies = async () => {
      try {
         // setShowSpinner(true);
         // get late notices
         const apiResponse = await AllUsersService.getAllCompaniesList();
         if (apiResponse.status === HttpStatusCode.OK) {
            setAllCompanies(apiResponse.data);
         }
      } finally {
         // setShowSpinner(false);
      }
   };
   const getEvictionAutomationApprovalsQueue = async (
      currentPage: number,
      pageSize: number,
      isApproved: boolean,
      isViewAll: boolean,
      searchParam?: string,
      companyId?:string
   ) => {
      try {

         setShowSpinner(true);
         var casesIds = localStorage.getItem("casesList")?.split(",").filter(id => id.trim() !== "");
         var ownerId = localStorage.getItem("ownerId");
         var propertyEmail = localStorage.getItem("propertyEmail");
         var propertyId = localStorage.getItem("propertyId");
         const apiResponse = await EvictionAutomationService.getEvictionAutomationApprovalsQueue(
            currentPage,
            pageSize,
            false,
            false,
            searchParam,
            casesIds ?? [],
            companyId ?? "",
            ownerId ?? "",
            propertyEmail ?? "",
            propertyId ?? "",
            selectedStateValue
         );
         if (apiResponse.status === HttpStatusCode.OK) {
               setEvictionAutomationApprovalsQueue((prevAllCases) => ({
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

      } finally {

         localStorage.removeItem("ownerId");
         localStorage.removeItem("propertyId");
         localStorage.removeItem("propertyEmail");

         setShowSpinner(false);
      }
   };
   return (
      <FileEvictionsContext.Provider
         value={{
            showSpinner,
            fileEvictions,
            allCompanies,
            getAllCompanies,
            setAllCompanies,
            getFileEvictions,
            setFileEvictions,
            setShowSpinner,
            selectedFileEvictionId,
            setSelectedFileEvictionId,
            filteredRecords,
            setFilteredRecords,
            selectedFilteredFileEvictionId,
            setSelectedFilteredFileEvictionId,
            bulkRecords,
            setBulkRecords,
            counties,
            setCounties,
            getCounties,
            evictionAutomationApprovalsQueue,
            setEvictionAutomationApprovalsQueue,
            getEvictionAutomationApprovalsQueue,
            selectedEvictionApprovalId,
            setSelectedEvictionApprovalId,
         }}
      >
         {children}
      </FileEvictionsContext.Provider>
   );
};

export const useFileEvictionsContext = (): FileEvictionsContextType => {
   const context = useContext(FileEvictionsContext);

   if (!context) {
      throw new Error(
         "useFileEvictionsContext must be used within a FileEvictionsProvider"
      );
   }

   return context;
};
