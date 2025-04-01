import React, {
   Dispatch,
   useContext,
   createContext,
   useState,
   SetStateAction
} from "react";
import { HttpStatusCode } from "axios";
import { IAllProcessServerUser, IProcessServerCaseInfo, IProcessServerCaseInfoItem } from "interfaces/process-server.interface";
import ProcessServerService from "services/process-server.service";
import { AOSStatusEnum } from "utils/enum";
import { SortingOption } from "interfaces/common.interface";


export type ProcessServerContextType = {
   showSpinner: boolean;
   setShowSpinner: Dispatch<SetStateAction<boolean>>;
   processServerCases: IProcessServerCaseInfo;
   setProcessServerCases: Dispatch<SetStateAction<IProcessServerCaseInfo>>;
   getProcessServerCases: (currentPage: number, pageSize: number, searchParam?: string, serverName?: string, serviceMethod?: string, dateRange?: string, sortings?: SortingOption[]) => void;
   selectedProcessServerId: string[];
   setSelectedProcessServerId: Dispatch<SetStateAction<string[]>>;
   filteredRecords: IProcessServerCaseInfoItem[],
   setFilteredRecords: Dispatch<SetStateAction<IProcessServerCaseInfoItem[]>>;
   selectedFilteredProcessServerId: string[];
   setSelectedFilteredProcessServerId: Dispatch<SetStateAction<string[]>>;
   bulkRecords: IProcessServerCaseInfoItem[];
   setBulkRecords: Dispatch<SetStateAction<IProcessServerCaseInfoItem[]>>;
   allProcessServerUsers: IAllProcessServerUser[];
   setAllProcessServerUsers: Dispatch<SetStateAction<IAllProcessServerUser[]>>;
   isBackClick: boolean;
   setIsBackClick: Dispatch<SetStateAction<boolean>>;
   serviceDateRange: [Date | null, Date | null];
   setServiceDateRange: Dispatch<SetStateAction<[Date | null, Date | null]>>;
   getAllProcessServerUsers: () => void;
};

const initialProcessServerContextValue: ProcessServerContextType = {
   showSpinner: false,
   setShowSpinner: () => { },
   processServerCases: {
      items: [],
      currentPage: 1,
      pageSize: 100,
      totalCount: 0,
      totalPages: 1,
      searchParam: "",
      serverName: "",
      serviceMethod: "",
      dateRange: "",
      sortings: []
   },
   setProcessServerCases: () => { },
   getProcessServerCases: () => { },
   selectedProcessServerId: [],
   setSelectedProcessServerId: () => { },
   filteredRecords: [],
   setFilteredRecords: () => { },
   selectedFilteredProcessServerId: [],
   setSelectedFilteredProcessServerId: () => { },
   isBackClick: false,
   setIsBackClick: () => { },
   serviceDateRange: [null,null],
   setServiceDateRange: () => { },
   bulkRecords: [],
   setBulkRecords: () => { },
   allProcessServerUsers: [],
   setAllProcessServerUsers: () => { },
   getAllProcessServerUsers: () => { },
};

export const ProcessServerContext = createContext<ProcessServerContextType>(initialProcessServerContextValue);

export const ProcessServerProvider: React.FC<{ children: any }> = ({ children }) => {
   const [showSpinner, setShowSpinner] = useState<boolean>(false);
   const [processServerCases, setProcessServerCases] = useState<IProcessServerCaseInfo>(
      initialProcessServerContextValue.processServerCases
   );
   const [bulkRecords, setBulkRecords] = useState<IProcessServerCaseInfoItem[]>([]);
   const [selectedProcessServerId, setSelectedProcessServerId] = useState<string[]>(
      initialProcessServerContextValue.selectedProcessServerId
   );
   const [serviceDateRange, setServiceDateRange] = useState<[Date | null, Date | null]>(
      initialProcessServerContextValue.serviceDateRange
   );
   const [filteredRecords, setFilteredRecords] = useState<IProcessServerCaseInfoItem[]>([]);
   const [selectedFilteredProcessServerId, setSelectedFilteredProcessServerId] = useState<string[]>(
      initialProcessServerContextValue.selectedFilteredProcessServerId
   );
   const [isBackClick, setIsBackClick] = useState<boolean>(
      initialProcessServerContextValue.isBackClick
   );
   const [allProcessServerUsers, setAllProcessServerUsers] = useState<IAllProcessServerUser[]>(
      initialProcessServerContextValue.allProcessServerUsers
   );

   const getProcessServerCases = async (
      currentPage: number,
      pageSize: number,
      searchParam?: string,
      serverName?: string,
      serviceMethod?: string,
      dateRange?: string,
      sortings?: SortingOption[]
   ) => {
      try {

         setShowSpinner(true);
         // get All cases
         const apiResponse = await ProcessServerService.getProcessServerCases(
            currentPage,
            pageSize,
            searchParam,
            serverName,
            serviceMethod,
            dateRange,
            sortings
         );
         if (apiResponse.status === HttpStatusCode.Ok) {
            setProcessServerCases((prevAllCases) => ({
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

   const getAllProcessServerUsers = async () => {
      try {
         const response = await ProcessServerService.getAllProcessServerUsers();
         if (response.status === HttpStatusCode.Ok) {
            setAllProcessServerUsers(response.data);
         }

      } catch (error) {
         console.log("🚀 ~ getProcessServerUsers ~ error:", error);
      } finally {

      }
   };

   return (
      <ProcessServerContext.Provider
         value={{
            showSpinner,
            setShowSpinner,
            processServerCases,
            setProcessServerCases,
            getProcessServerCases,
            selectedProcessServerId,
            setSelectedProcessServerId,
            filteredRecords,
            setFilteredRecords,
            selectedFilteredProcessServerId,
            setSelectedFilteredProcessServerId,
            bulkRecords,
            setBulkRecords,
            allProcessServerUsers,
            setAllProcessServerUsers,
            isBackClick,
            setIsBackClick,
            serviceDateRange,
            setServiceDateRange,
            getAllProcessServerUsers
         }}
      >
         {children}
      </ProcessServerContext.Provider>
   );
}

export const useProcessServerContext = (): ProcessServerContextType => {
   // Get the context value using useContext
   const context = useContext(ProcessServerContext);
   // If the context is not found, throw an error
   if (!context) {
      throw new Error(
         "useProcessServerContext must be used within a ProcessServerProvider"
      );
   }

   return context;
};