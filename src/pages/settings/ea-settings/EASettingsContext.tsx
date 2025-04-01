import React, {
    Dispatch,
    useContext,
    createContext,
    useState,
    SetStateAction
} from "react";
import { HttpStatusCode } from "axios";
import { IEvictionAutomationQueue, IEvictionAutomationQueueItem } from "interfaces/eviction-automation.interface";
import EvictionAutomationService from "services/eviction-automation.service";
import { ICompanyItems } from "interfaces/writ-labor-interface";
import AllUsersService from "services/all-users.service";
import { ICountyItems } from "interfaces/county.interface";
import CountyService from "services/county.service";

export type EASettingsContextType = {
   showSpinner: boolean;
   setShowSpinner: Dispatch<SetStateAction<boolean>>;
   eaSettingsQueue: IEvictionAutomationQueue;
   setEASettingsQueue: Dispatch<SetStateAction<IEvictionAutomationQueue>>;
   getEASettingsQueue: (currentPage: number, pageSize: number, search?: string, companyId?: string, county?: string, isExpedited?: number, isStateCourt?: number) => void;
   allCompanies: ICompanyItems[];
   getAllCompanies: () => void;
   setAllCompanies: Dispatch<SetStateAction<ICompanyItems[]>>;
   allCounties: ICountyItems[];
   getAllCounties: () => void;
   setAllCounties: Dispatch<SetStateAction<ICountyItems[]>>;
   selectedEASettingsIds: string[];
   setSelectedEASettingsIds: Dispatch<SetStateAction<string[]>>;
   bulkEditRecords: IEvictionAutomationQueueItem[];
   setBulkEditRecords: Dispatch<SetStateAction<IEvictionAutomationQueueItem[]>>;
   filteredRecords: IEvictionAutomationQueueItem[];
   setFilteredRecords: Dispatch<SetStateAction<IEvictionAutomationQueueItem[]>>;
};

const initialEASettingsContextValue: EASettingsContextType = {
   showSpinner: false,
   setShowSpinner: () => { },
   eaSettingsQueue: {
    items: [],
    currentPage: 1,
    pageSize: 1,
    totalCount: 0,
    totalPages: 1,
 },
 setEASettingsQueue: () => { },
 getEASettingsQueue: () => { },
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
   selectedEASettingsIds: [],
   setSelectedEASettingsIds: () => { },
   bulkEditRecords: [],
   setBulkEditRecords: () => { },
   filteredRecords: [],
   setFilteredRecords: () => { },
};

export const EASettingsContext = createContext<EASettingsContextType>(initialEASettingsContextValue);

export const EASettingsProvider: React.FC<{ children: any }> = ({ children }) => {
   const [showSpinner, setShowSpinner] = useState<boolean>(false);
   const [eaSettingsQueue, setEASettingsQueue] = useState<IEvictionAutomationQueue>(initialEASettingsContextValue.eaSettingsQueue);
   const [allCompanies, setAllCompanies] = useState<ICompanyItems[]>(
    initialEASettingsContextValue.allCompanies
 );
 const [allCounties, setAllCounties] = useState<ICountyItems[]>(
    initialEASettingsContextValue.allCounties
 );
 const [selectedEASettingsIds, setSelectedEASettingsIds] = useState<
      string[]
   >(initialEASettingsContextValue.selectedEASettingsIds);
   const [bulkEditRecords, setBulkEditRecords] = useState<IEvictionAutomationQueueItem[]>([]);
   const [filteredRecords, setFilteredRecords] = useState<IEvictionAutomationQueueItem[]>([]);

   const getEASettingsQueue = async (
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
        setEASettingsQueue((prevAllCases) => ({
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

   return (
       <EASettingsContext.Provider
           value={{
               showSpinner,
               setShowSpinner,
               eaSettingsQueue,
               setEASettingsQueue,
               getEASettingsQueue,
               allCompanies,
            getAllCompanies,
            setAllCompanies,
            getAllCounties,
            setAllCounties,
            allCounties,
            selectedEASettingsIds,
            setSelectedEASettingsIds,
            bulkEditRecords,
            setBulkEditRecords,
            filteredRecords,
            setFilteredRecords,
           }}
       >
           {children}
       </EASettingsContext.Provider>
   );
}

export const useEASettingsContext = (): EASettingsContextType => {
   // Get the context value using useContext
   const context = useContext(EASettingsContext);
   // If the context is not found, throw an error
   if (!context) {
       throw new Error(
           "useEASettingsContext must be used within a EASettingsProvider"
       );
   }

   return context;
};