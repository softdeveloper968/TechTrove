//FileEvictionsContext.tsx
import React, {
    Dispatch,
    ReactNode,
    SetStateAction,
    createContext,
    useContext,
    useState,
 } from "react";
 import { ICountyItems } from "interfaces/county.interface";
 import { ICompanyItems } from "interfaces/all-users.interface";
 import FileEvictionsService from "services/file-evictions.service";
 import CountyService from "services/county.service";
 import CourtService from "services/court.service";
 import AllUsersService from "services/all-users.service";
 import { HttpStatusCode } from "utils/enum";
import { IFileEvictionsTX, IFileEvictionsTXItems, IFileEvictionTXImportCsv } from "interfaces/file-evictions-tx.interface";
import { useAuth } from "context/AuthContext";
import { ICourtItems } from "interfaces/court.interface";
import { IEvictionAutomationOtherQueue} from "interfaces/eviction-automation.interface";
import EvictionAutomationService from "services/eviction-automation.service";
import { IFileEvictionImportCsv } from "interfaces/file-evictions.interface";
 
 // Define the shape of the context data
 type FileEvictionsTXContextType = {
    showSpinner: boolean;
    setShowSpinner: Dispatch<SetStateAction<boolean>>;
    fileEvictions: IFileEvictionsTX; 
    setFileEvictions: Dispatch<SetStateAction<IFileEvictionsTX>>; 
    getFileEvictions: (currentPage: number, pageSize: number,isViewAll:boolean, search?: string, companyId?: string,) => void;
    selectedFileEvictionId: string[];
    setSelectedFileEvictionId: Dispatch<SetStateAction<string[]>>;
    filteredRecords: IFileEvictionsTXItems[];
    setFilteredRecords: Dispatch<SetStateAction<IFileEvictionsTXItems[]>>;
    selectedFilteredFileEvictionId: string[];
    setSelectedFilteredFileEvictionId: Dispatch<SetStateAction<string[]>>;
    bulkRecords: IFileEvictionsTXItems[];
    setBulkRecords: Dispatch<SetStateAction<IFileEvictionsTXItems[]>>;
    counties: ICountyItems[];
    setCounties: Dispatch<SetStateAction<ICountyItems[]>>;
    getCounties: () => void;
    allCompanies: ICompanyItems[];
    courts:ICourtItems[];
    setCourts:Dispatch<SetStateAction<ICourtItems[]>>;
    getCourts:()=>void;
    getAllCompanies: () => void;
    setAllCompanies: Dispatch<SetStateAction<ICompanyItems[]>>;
    evictionAutomationApprovalsQueue: IEvictionAutomationOtherQueue;
   setEvictionAutomationApprovalsQueue: Dispatch<SetStateAction<IEvictionAutomationOtherQueue>>;
   getEvictionAutomationApprovalsQueue: (currentPage: number, pageSize: number, isApproved: boolean, isViewAll: boolean, search?: string,companyId?:string) => void;
   selectedEvictionApprovalId: string[];
   setSelectedEvictionApprovalId: Dispatch<SetStateAction<string[]>>;
   bulkEARecords: IFileEvictionImportCsv[];
   setBulkEARecords: Dispatch<SetStateAction<IFileEvictionImportCsv[]>>;
   filteredEARecords: IFileEvictionImportCsv[];
   setFilteredEARecords: Dispatch<SetStateAction<IFileEvictionImportCsv[]>>;
};
 
 // Create a context with an initial value
 const initialFileEvictionsContextValue: FileEvictionsTXContextType = {
    fileEvictions: {
       items: [],
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
    courts:[],
    setCourts:() => { },
    getCourts:() => { },
    evictionAutomationApprovalsQueue: {
      items: [],
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
   bulkEARecords: [],
    setBulkEARecords: () => { },
    filteredEARecords: [],
    setFilteredEARecords: () => { },
 };
 
 // Create a context with an initial value
 const FileEvictionsTXContext = createContext<FileEvictionsTXContextType>(
    initialFileEvictionsContextValue
 );
 
 // Provide a component to wrap the application and make the context available
 export const FileEvictionsTXProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
   const { 
      selectedStateValue
    } = useAuth();
    const [showSpinner, setShowSpinner] = useState<boolean>(false);
    const [fileEvictions, setFileEvictions] = useState<IFileEvictionsTX>(
       initialFileEvictionsContextValue.fileEvictions
    );
    const [filteredRecords, setFilteredRecords] = useState<IFileEvictionsTXItems[]>([]);
    const [bulkRecords, setBulkRecords] = useState<IFileEvictionsTXItems[]>([]);
    const [bulkEARecords, setBulkEARecords] = useState<IFileEvictionImportCsv[]>([]);
    const [filteredEARecords, setFilteredEARecords] = useState<IFileEvictionImportCsv[]>([]);
    const [selectedFilteredFileEvictionId, setSelectedFilteredFileEvictionId] = useState<string[]>(
       initialFileEvictionsContextValue.selectedFilteredFileEvictionId
    );
    const [selectedFileEvictionId, setSelectedFileEvictionId] = useState<string[]>(
       initialFileEvictionsContextValue.selectedFileEvictionId
    );
    const [allCompanies, setAllCompanies] = useState<ICompanyItems[]>(
       initialFileEvictionsContextValue.allCompanies
    );
    const [evictionAutomationApprovalsQueue, setEvictionAutomationApprovalsQueue] = useState<IEvictionAutomationOtherQueue>
    (initialFileEvictionsContextValue.evictionAutomationApprovalsQueue);

    const [selectedEvictionApprovalId, setSelectedEvictionApprovalId] = useState<string[]>(
      initialFileEvictionsContextValue.selectedEvictionApprovalId
   );

    const [counties, setCounties] = useState<ICountyItems[]>([]);
    const [courts, setCourts] = useState<ICourtItems[]>([]);
    
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
             selectedStateValue ?? "TX"
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
            setCounties(
               stateCounties
             );
          }
       } catch (error) {
          console.log(error);
       } finally {
          // setShowSpinner(true);
       }
    };
    const getCourts = async () => {
      try {
         // setShowSpinner(true);
         const response = await CourtService.getAllCourtList();
         if (response.status === HttpStatusCode.OK) {
           setCourts(
               response.data
            );
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
       <FileEvictionsTXContext.Provider
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
             courts,
             setCourts,
             getCourts,
             evictionAutomationApprovalsQueue,
            setEvictionAutomationApprovalsQueue,
            getEvictionAutomationApprovalsQueue,
            selectedEvictionApprovalId,
            setSelectedEvictionApprovalId,
            bulkEARecords,
            setBulkEARecords,
            filteredEARecords,
            setFilteredEARecords,
          }}
       >
          {children}
       </FileEvictionsTXContext.Provider>
    );
 };
 
 export const useFileEvictionsTXContext = (): FileEvictionsTXContextType => {
    const context = useContext(FileEvictionsTXContext);
 
    if (!context) {
       throw new Error(
          "useFileEvictionsTXContext must be used within a FileEvictionsTXProvider"
       );
    }
 
    return context;
 };
 