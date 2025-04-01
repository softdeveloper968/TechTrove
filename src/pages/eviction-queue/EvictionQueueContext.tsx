import React, {
   Dispatch,
   useContext,
   createContext,
   useState,
   SetStateAction
} from "react";
import { HttpStatusCode } from "axios";
import { IEvictionQueues, IEvictionQueueTaskItem, IEvictionQueueTasks } from "interfaces/eviction-queue.intreface";
import { ICountyItems } from "interfaces/county.interface";
import { ICompanyItems } from "interfaces/all-users.interface";
import EvictionQueueService from "services/eviction-queue.service";
import CountyService from "services/county.service";
import AllUsersService from "services/all-users.service";
import { SortingOption } from "interfaces/common.interface";

export type EvictionContextType = {
   showSpinner: boolean;
   setShowSpinner: Dispatch<SetStateAction<boolean>>;
   evictionQueuesData: IEvictionQueues;
   setEvictionQueuesData: Dispatch<SetStateAction<IEvictionQueues>>;
   getEvictionQueuesData: (currentPage: number, pageSize: number, search?: string) => void;
   updateStatus: (evictionQueueId: number, status: boolean) => void;
   evictionQueue1Tasks: IEvictionQueueTasks;
   setEvictionQueue1Tasks: Dispatch<SetStateAction<IEvictionQueueTasks>>;
   evictionQueue2Tasks: IEvictionQueueTasks;
   setEvictionQueue2Tasks: Dispatch<SetStateAction<IEvictionQueueTasks>>;
   evictionQueue3Tasks: IEvictionQueueTasks;
   setEvictionQueue3Tasks: Dispatch<SetStateAction<IEvictionQueueTasks>>;
   evictionQueue4Tasks: IEvictionQueueTasks;
   setEvictionQueue4Tasks: Dispatch<SetStateAction<IEvictionQueueTasks>>;
   evictionQueue5Tasks: IEvictionQueueTasks;
   setEvictionQueue5Tasks: Dispatch<SetStateAction<IEvictionQueueTasks>>;
   getEvictionQueueTasks: (currentPage: number, pageSize: number, id: number, action?: number, status?: number, search?: string, county?: string, company?: string,sortings?: SortingOption[]) => void;
   updateDisable: (evictionQueueTaskId: string, disable: boolean) => void;
   selectEvictionQueueId: number;
   setSelectedEvictionQueueId: Dispatch<SetStateAction<number>>;
   allCounties: ICountyItems[];
   getAllCounties: () => void;
   setAllCounties: Dispatch<SetStateAction<ICountyItems[]>>;
   setBulkRecords: Dispatch<SetStateAction<IEvictionQueueTaskItem[]>>;
   bulkRecords: IEvictionQueueTaskItem[];
   selectedEvictionId: string[];
   setSelectedEvictionId: Dispatch<SetStateAction<string[]>>;
   filteredRecords: IEvictionQueueTaskItem[],
   setFilteredRecords: Dispatch<SetStateAction<IEvictionQueueTaskItem[]>>;
   selectedFilteredEvictionId: string[];
   setSelectedFilteredEvictionId: Dispatch<SetStateAction<string[]>>;
   allCompanies: ICompanyItems[];
   getAllCompanies: () => void;
   setAllCompanies: Dispatch<SetStateAction<ICompanyItems[]>>;
}

const intialEvictionQueueContextValue: EvictionContextType = {
   showSpinner: false,
   setShowSpinner: () => { },
   evictionQueuesData: {
      items: [
         {
            id: 0,
            name: "",
            status: false,
         }
      ],
      currentPage: 1,
      pageSize: 1,
      totalCount: 0,
      totalPages: 1,
   },
   setEvictionQueuesData: () => { },
   getEvictionQueuesData: () => { },
   updateStatus: () => { },
   evictionQueue1Tasks: {
      items: [],
      currentPage: 1,
      pageSize: 1,
      totalCount: 0,
      totalPages: 1,
      actiontype: 0,
      status: 0,
      searchParam: "",
      sortings:[]
   },
   setEvictionQueue1Tasks: () => { },
   evictionQueue2Tasks: {
      items: [],
      currentPage: 1,
      pageSize: 1,
      totalCount: 0,
      totalPages: 1,
      actiontype: 0,
      status: 0,
      searchParam: "",
      sortings:[]
   },
   setEvictionQueue2Tasks: () => { },
   evictionQueue3Tasks: {
      items: [],
      currentPage: 1,
      pageSize: 1,
      totalCount: 0,
      totalPages: 1,
      actiontype: 0,
      status: 0,
      searchParam: "",
      sortings:[]
   },
   setEvictionQueue3Tasks: () => { },
   evictionQueue4Tasks: {
      items: [],
      currentPage: 1,
      pageSize: 1,
      totalCount: 0,
      totalPages: 1,
      actiontype: 0,
      status: 0,
      searchParam: "",
      sortings:[]
   },
   setEvictionQueue4Tasks: () => { },
   evictionQueue5Tasks: {
      items: [],
      currentPage: 1,
      pageSize: 1,
      totalCount: 0,
      totalPages: 1,
      actiontype: 0,
      status: 0,
      searchParam: "",
      sortings:[]
   },
   setEvictionQueue5Tasks: () => { },
   getEvictionQueueTasks: () => { },
   updateDisable: () => { },
   selectEvictionQueueId: 0,
   setSelectedEvictionQueueId: () => { },
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
   setBulkRecords: () => { },
   bulkRecords: [],
   selectedEvictionId: [],
   setSelectedEvictionId: () => { },
   filteredRecords: [],
   setFilteredRecords: () => { },
   selectedFilteredEvictionId: [],
   setSelectedFilteredEvictionId: () => { },
   allCompanies: [],
   getAllCompanies: () => { },
   setAllCompanies: () => { },
};

export const EvictionQueueContext = createContext<EvictionContextType>(intialEvictionQueueContextValue);
export const EvictionQueueProvider: React.FC<{ children: any }> = ({ children }) => {
   const [showSpinner, setShowSpinner] = useState<boolean>(false);
   const [evictionQueuesData, setEvictionQueuesData] = useState<IEvictionQueues>(intialEvictionQueueContextValue.evictionQueuesData);
   const [evictionQueue1Tasks, setEvictionQueue1Tasks] = useState<IEvictionQueueTasks>(intialEvictionQueueContextValue.evictionQueue1Tasks);
   const [evictionQueue2Tasks, setEvictionQueue2Tasks] = useState<IEvictionQueueTasks>(intialEvictionQueueContextValue.evictionQueue2Tasks);
   const [evictionQueue3Tasks, setEvictionQueue3Tasks] = useState<IEvictionQueueTasks>(intialEvictionQueueContextValue.evictionQueue3Tasks);
   const [evictionQueue4Tasks, setEvictionQueue4Tasks] = useState<IEvictionQueueTasks>(intialEvictionQueueContextValue.evictionQueue4Tasks);  
   const [evictionQueue5Tasks, setEvictionQueue5Tasks] = useState<IEvictionQueueTasks>(intialEvictionQueueContextValue.evictionQueue5Tasks);
   const [selectEvictionQueueId, setSelectedEvictionQueueId] = useState<number>(intialEvictionQueueContextValue.selectEvictionQueueId);
   const [allCounties, setAllCounties] = useState<ICountyItems[]>(
      intialEvictionQueueContextValue.allCounties
   );
   const [allCompanies, setAllCompanies] = useState<ICompanyItems[]>(
      intialEvictionQueueContextValue.allCompanies
   );
   const getEvictionQueuesData = async (
      currentPage: number,
      pageSize: number,
      search?: string,
   ) => {
      try {
         setShowSpinner(true);
         const apiResponse = await EvictionQueueService.getEvictionQueues(
            currentPage,
            pageSize,
            search,
         );
         if (apiResponse.status === HttpStatusCode.Ok) {
            setEvictionQueuesData((prevAllQueues) => ({
               ...prevAllQueues,
               items: apiResponse.data.items,
               currentPage: apiResponse.data.currentPage,
               totalCount: apiResponse.data.totalCount,
               totalPages: apiResponse.data.totalPages,
               pageSize: apiResponse.data.pageSize,
               ...(search ? { searchParam: search } : {}),
            }));
            // getEvictionQueueTasks(1, 100, apiResponse.data.items[0].id)
         }
      } finally {
         setShowSpinner(false);
      }
   };

   const updateStatus = async (evictionQueueTaskId: number, status: boolean) => {

      try {
         setShowSpinner(true);
         const apiResponse = await EvictionQueueService.updateStatus(
            evictionQueueTaskId,
            status
         );
         if (apiResponse.status === HttpStatusCode.Ok) {
            //toast.success("Status changed successfully");
         }
      } finally {
         setShowSpinner(false);
      }
   };
   const updateDisable = async (evictionQueueId: string, disabled: boolean) => {

      try {
         setShowSpinner(true);
         const apiResponse = await EvictionQueueService.updateDisable(
            evictionQueueId,
            disabled
         );
         if (apiResponse.status === HttpStatusCode.Ok) {
            //    toast.success("Successfully updated")
         }
      } finally {
         setShowSpinner(false);
      }
   };
   const getEvictionQueueTasks = async (
      currentPage: number,
      pageSize: number,
      id: number,
      action?: number,
      status?: number,
      search?: string,
      county?: string,
      company?: string,
      sortings?: SortingOption[]
   ) => {

      try {
         setShowSpinner(true);
         const apiResponse = await EvictionQueueService.getTasksByEvictionQueueId(
            currentPage,
            pageSize,
            id,
            action,
            status,
            search,
            county,
            company,
            sortings
         );
         if (apiResponse.status === HttpStatusCode.Ok) {
            switch(id){
               case 1:
                  setEvictionQueue1Tasks((prevAllQueues) => ({
                     ...prevAllQueues,
                     items: apiResponse.data.items,
                     currentPage: apiResponse.data.currentPage,
                     totalCount: apiResponse.data.totalCount,
                     totalPages: apiResponse.data.totalPages,
                     pageSize: apiResponse.data.pageSize
                     ,
                  }));
                  break;
                  case 2:
                     setEvictionQueue2Tasks((prevAllQueues) => ({
                        ...prevAllQueues,
                        items: apiResponse.data.items,
                        currentPage: apiResponse.data.currentPage,
                        totalCount: apiResponse.data.totalCount,
                        totalPages: apiResponse.data.totalPages,
                        pageSize: apiResponse.data.pageSize
                        ,
                     }));
                     break;
                     case 3:
                        setEvictionQueue3Tasks((prevAllQueues) => ({
                           ...prevAllQueues,
                           items: apiResponse.data.items,
                           currentPage: apiResponse.data.currentPage,
                           totalCount: apiResponse.data.totalCount,
                           totalPages: apiResponse.data.totalPages,
                           pageSize: apiResponse.data.pageSize
                           ,
                        }));
                        break;
                        case 4:
                           setEvictionQueue4Tasks((prevAllQueues) => ({
                              ...prevAllQueues,
                              items: apiResponse.data.items,
                              currentPage: apiResponse.data.currentPage,
                              totalCount: apiResponse.data.totalCount,
                              totalPages: apiResponse.data.totalPages,
                              pageSize: apiResponse.data.pageSize
                              ,
                           }));
                           break;
                           case 5:
                     setEvictionQueue5Tasks((prevAllQueues) => ({
                        ...prevAllQueues,
                        items: apiResponse.data.items,
                        currentPage: apiResponse.data.currentPage,
                        totalCount: apiResponse.data.totalCount,
                        totalPages: apiResponse.data.totalPages,
                        pageSize: apiResponse.data.pageSize
                        ,
                     }));
                     break;
            }
           
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
      } finally {
         // setShowSpinner(true);
      }
   };
   const getAllCompanies = async () => {
      try {
         const apiResponse = await AllUsersService.getAllCompaniesList();
         if (apiResponse.status === HttpStatusCode.Ok) {
            setAllCompanies(apiResponse.data);
         }
      } catch (error) {
         console.log(error);
      }
   };
   const [bulkRecords, setBulkRecords] = useState<IEvictionQueueTaskItem[]>([]);
   const [selectedEvictionId, setSelectedEvictionId] = useState<string[]>(
      intialEvictionQueueContextValue.selectedEvictionId
   );
   const [filteredRecords, setFilteredRecords] = useState<IEvictionQueueTaskItem[]>([]);
   const [selectedFilteredEvictionId, setSelectedFilteredEvictionId] = useState<string[]>(
      intialEvictionQueueContextValue.selectedFilteredEvictionId
   );
   return (
      <EvictionQueueContext.Provider
         value={{
            showSpinner,
            setShowSpinner,
            evictionQueuesData,
            setEvictionQueuesData,
            getEvictionQueuesData,
            updateStatus,
            evictionQueue1Tasks,
            setEvictionQueue1Tasks,
            evictionQueue2Tasks,
            setEvictionQueue2Tasks,
            evictionQueue3Tasks,
            setEvictionQueue3Tasks,
            evictionQueue4Tasks,
            setEvictionQueue4Tasks,
            evictionQueue5Tasks,
            setEvictionQueue5Tasks,
            getEvictionQueueTasks,
            updateDisable,
            selectEvictionQueueId,
            setSelectedEvictionQueueId,
            getAllCounties,
            setAllCounties,
            allCounties,
            bulkRecords,
            setBulkRecords,
            selectedEvictionId,
            setSelectedEvictionId,
            selectedFilteredEvictionId,
            setSelectedFilteredEvictionId,
            setFilteredRecords,
            filteredRecords,
            allCompanies,
            getAllCompanies,
            setAllCompanies,
         }}
      >
         {children}
      </EvictionQueueContext.Provider>
   );
}
export const useEvictionQueueContext = (): EvictionContextType => {
   // Get the context value using useContext
   const context = useContext(EvictionQueueContext);
   // If the context is not found, throw an error
   if (!context) {
      throw new Error(
         "useEvictionQueueContext must be used within a EvictionQueueProvider"
      );
   }

   return context;
};