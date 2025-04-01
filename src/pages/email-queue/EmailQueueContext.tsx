import React, {
   Dispatch,
   useContext,
   createContext,
   useState,
   SetStateAction
} from "react";
import { HttpStatusCode } from "axios";
import { IEmailQueue, IEmailQueueItem, IServerIinfo, IServerEmailLogItem, IServerEmailLog, IMailManagementQueue, IMailManagementItem } from "interfaces/email-queue.interface";
import { ICompanyItems } from "interfaces/all-users.interface";
import { ICountyItems } from "interfaces/county.interface";
import EmailQueueService from "services/email-queue.service";
import AllUsersService from "services/all-users.service";
import CountyService from "services/county.service";
import { useAuth } from "context/AuthContext";

export type EmailQueueContextType = {
   showSpinner: boolean;
   setShowSpinner: Dispatch<SetStateAction<boolean>>;
   getEmailQueues: (currentPage: number, pageSize: number, searchParam?: string, companyId?: string, county?: string, serverId?: string, isExpedited?: number, isStateCourt?: number,status?:string,taskStatus?:number,court?:string) => void;
   emailQueues: IEmailQueue;
   setEmailQueues: Dispatch<SetStateAction<IEmailQueue>>;
   selectedEmailQueueIds: string[];
   selectedEmailTaskIds: string [];
   setSelectedEmailQueueIds: Dispatch<SetStateAction<string[]>>;
   setSelectedEmailTaskIds: Dispatch<SetStateAction<string[]>>;
   selectedTaskIds: string[];
   setSelectedTaskIds: Dispatch<SetStateAction<string[]>>;
   allCompanies: ICompanyItems[];
   getAllCompanies: () => void;
   setAllCompanies: Dispatch<SetStateAction<ICompanyItems[]>>;
   servers: IServerIinfo[];
   getServers: () => void;
   setServers: Dispatch<SetStateAction<IServerIinfo[]>>;
   allCounties: ICountyItems[];
   getAllCounties: () => void;
   setAllCounties: Dispatch<SetStateAction<ICountyItems[]>>;
   bulkRecords: IEmailQueueItem[];
   setBulkRecords: Dispatch<SetStateAction<IEmailQueueItem[]>>;
   filteredRecords: IEmailQueueItem[],
   setFilteredRecords: Dispatch<SetStateAction<IEmailQueueItem[]>>;
   selectedFilteredEmailQueueId: string[];
   setSelectedFilteredEmailQueueId: Dispatch<SetStateAction<string[]>>;
   getServerEmailLogs: (currentPage: number, pageSize: number, searchParam?: string) => void;
   serverEmailLogs: IServerEmailLog;
   setServerEmailLogs: Dispatch<SetStateAction<IServerEmailLog>>;
   selectedServerLogIds: string[];
   setselectedServerLogIdsIds: Dispatch<SetStateAction<string[]>>;
   filteredServerLogRecords: IServerEmailLogItem[],
   setFilteredServerLogRecords: Dispatch<SetStateAction<IServerEmailLogItem[]>>;
   bulkServerLogRecords: IServerEmailLogItem[];
   setBulkServerLogRecords: Dispatch<SetStateAction<IServerEmailLogItem[]>>;
   selectedFilteredServerEmailQueueId: string[];
   setSelectedFilteredServerEmailQueueId: Dispatch<SetStateAction<string[]>>;
   getMailManagementQueue: (currentPage: number, pageSize: number, searchParam?: string) => void;
   mailManagementQueue: IMailManagementQueue;
   setMailManagementQueue: Dispatch<SetStateAction<IMailManagementQueue>>;
   bulkMailManagementQueue: IMailManagementItem[];
   setBulkMailManagementQueue: Dispatch<SetStateAction<IMailManagementItem[]>>;
   filteredMailManagementQueue: IMailManagementItem[],
   setFilteredMailManagementQueue: Dispatch<SetStateAction<IMailManagementItem[]>>;
};

const initialEmailQueueContextValue: EmailQueueContextType = {
   showSpinner: false,
   setShowSpinner: () => { },
   emailQueues: {
      items: [],
      currentPage: 1,
      pageSize: 1,
      totalCount: 0,
      totalPages: 1,
      searchParam: ""
   },
   setEmailQueues: () => { },
   getEmailQueues: () => { },
   selectedEmailQueueIds: [],
   selectedEmailTaskIds: [],
   setSelectedEmailQueueIds: () => { },
   setSelectedEmailTaskIds: () =>  { },
   selectedTaskIds: [],
   setSelectedTaskIds: () => { },
   selectedServerLogIds: [],
   setselectedServerLogIdsIds: () => { },
   allCompanies: [],
   getAllCompanies: () => { },
   setAllCompanies: () => { },
   servers: [{
      id: "",
      email: ""
   }],
   getServers: () => { },
   setServers: () => { },
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
   bulkRecords: [],
   setBulkRecords: () => { },
   bulkServerLogRecords: [],
   setBulkServerLogRecords: () => { },
   filteredRecords: [],
   setFilteredRecords: () => { },
   selectedFilteredEmailQueueId: [],
   setSelectedFilteredEmailQueueId: () => { },
   serverEmailLogs: {
      items: [
         {
            id: "",
            serverEmail: "",
            documentUrl: "",
            county: "",
            mailDate: null,
            mailTotal: 0,
            mailWeight: "",
            mailTracking: 0,
            mailManager: "",
            notes: "",
            c2CCheck: "",
            c2CCheckTotal: "",
            serviceTotal: "",
         }
      ],
      currentPage: 1,
      pageSize: 1,
      totalCount: 0,
      totalPages: 1,
      searchParam: ""
   },
   setServerEmailLogs: () => { },
   getServerEmailLogs: () => { },
   filteredServerLogRecords: [],
   setFilteredServerLogRecords: () => { },
   selectedFilteredServerEmailQueueId: [],
   setSelectedFilteredServerEmailQueueId: () => { },
   mailManagementQueue: {
      items: [
         {
            id: "",
            county: "",
            documentUrl: "",
            batchSignDate: "",
            mailDate: "",
            mailTotal: null,
            mailWeight: "",
            mailTracking: 0,
            mailNotes:"",
            mailManager:"",
            filingType: null
         }
      ],
      currentPage: 1,
      pageSize: 1,
      totalCount: 0,
      totalPages: 1,
      searchParam: ""
   },
   setMailManagementQueue: () => { },
   getMailManagementQueue: () => { },
   bulkMailManagementQueue: [],
   setBulkMailManagementQueue: () => { },
   filteredMailManagementQueue: [],
   setFilteredMailManagementQueue: () => { },
};

export const EmailQueueContext = createContext<EmailQueueContextType>(initialEmailQueueContextValue);

export const EmailQueueProvider: React.FC<{ children: any }> = ({ children }) => {
   const {selectedStateValue}=useAuth();
   const [showSpinner, setShowSpinner] = useState<boolean>(false);
   const [emailQueues, setEmailQueues] = useState<IEmailQueue>(
      initialEmailQueueContextValue.emailQueues
   );
   const [selectedEmailQueueIds, setSelectedEmailQueueIds] = useState<string[]>(
      initialEmailQueueContextValue.selectedEmailQueueIds
   );
   const [selectedEmailTaskIds, setSelectedEmailTaskIds] = useState<string[]>(
      initialEmailQueueContextValue.selectedEmailTaskIds
   );
   const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>(
      initialEmailQueueContextValue.selectedTaskIds
   );
   const [selectedServerLogIds, setselectedServerLogIdsIds] = useState<string[]>(
      initialEmailQueueContextValue.selectedServerLogIds
   );
   const [allCompanies, setAllCompanies] = useState<ICompanyItems[]>(
      initialEmailQueueContextValue.allCompanies
   );
   const [servers, setServers] = useState<IServerIinfo[]>(
      initialEmailQueueContextValue.servers
   );
   const [allCounties, setAllCounties] = useState<ICountyItems[]>(
      initialEmailQueueContextValue.allCounties
   );
   const [bulkRecords, setBulkRecords] = useState<IEmailQueueItem[]>([]);
   const [filteredRecords, setFilteredRecords] = useState<IEmailQueueItem[]>([]);
   const [filteredServerLogRecords, setFilteredServerLogRecords] = useState<IServerEmailLogItem[]>([]);
   const [bulkServerLogRecords, setBulkServerLogRecords] = useState<IServerEmailLogItem[]>([]);
   const [selectedFilteredEmailQueueId, setSelectedFilteredEmailQueueId] = useState<string[]>(
      initialEmailQueueContextValue.selectedFilteredEmailQueueId
   );
   const [selectedFilteredServerEmailQueueId, setSelectedFilteredServerEmailQueueId] = useState<string[]>(
      initialEmailQueueContextValue.selectedFilteredServerEmailQueueId
   );
   const [serverEmailLogs, setServerEmailLogs] = useState<IServerEmailLog>(
      initialEmailQueueContextValue.serverEmailLogs
   );
   const [mailManagementQueue, setMailManagementQueue] = useState<IMailManagementQueue>(
      initialEmailQueueContextValue.mailManagementQueue
   );
   const [bulkMailManagementQueue, setBulkMailManagementQueue] = useState<IMailManagementItem[]>([]);
   const [filteredMailManagementQueue, setFilteredMailManagementQueue] = useState<IMailManagementItem[]>([]);

   const getEmailQueues = async (currentPage: number, pageSize: number, searchParams?: string, companyId?: string, county?: string, serverId?: string, isExpedited?: number, isStateCourt?: number,status?:string,taskStatus?:number,court?:string) => {
      try {
         setShowSpinner(true);

         const response = await EmailQueueService.getEmailQueues(currentPage, pageSize, searchParams, companyId, county, serverId, isExpedited, isStateCourt,status,taskStatus,selectedStateValue,court??"");
         if (response.status === HttpStatusCode.Ok) {
            setEmailQueues((prev) => ({
               ...prev,
               items: response.data.items,
               currentPage: response.data.currentPage,
               totalCount: response.data.totalCount,
               totalPages: response.data.totalPages,
               pageSize: response.data.pageSize,
               companyId:companyId,
               county:county,
               serverId:serverId,
               isExpedited:isExpedited,
               isStateCourt:isStateCourt,
               status:status,
               court:court,
            }));
         }
      } catch (error) {
         console.log("🚀 ~ getEmailQueues ~ error:", error);
      } finally {
         setShowSpinner(false);
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

   const getServers = async () => {
      try {
         setShowSpinner(true);
         // get late notices
         const response = await EmailQueueService.GetProcessServer();
         if (response.status === HttpStatusCode.Ok) {
            setServers(response.data);
         }
      } catch (error) {
         console.log(error);
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

   const getServerEmailLogs = async (currentPage: number, pageSize: number, searchParams?: string) => {
      try {
         setShowSpinner(true);         
         const response = await EmailQueueService.getServerEmailLogs(currentPage, pageSize, searchParams,selectedStateValue);
         if (response.status === HttpStatusCode.Ok) {
            setServerEmailLogs((prev) => ({
               ...prev,
               items: response.data.items,
               currentPage: response.data.currentPage,
               totalCount: response.data.totalCount,
               totalPages: response.data.totalPages,
               pageSize: response.data.pageSize,
            }));
         }
      } catch (error) {
         console.log("🚀 ~ getServerEmailLogs ~ error:", error);
      } finally {
         setShowSpinner(false);
      }
   };
   
   const getMailManagementQueue = async (currentPage: number, pageSize: number, searchParams?: string) => {
      try {
         setShowSpinner(true);
         const response = await EmailQueueService.getMailManagementQueue(currentPage, pageSize, searchParams);
         if (response.status === HttpStatusCode.Ok) {
            setMailManagementQueue((prev) => ({
               ...prev,
               items: response.data.items,
               currentPage: response.data.currentPage,
               totalCount: response.data.totalCount,
               totalPages: response.data.totalPages,
               pageSize: response.data.pageSize,
            }));
         }
      } catch (error) {
         console.log("🚀 ~ getMailManagementQueue ~ error:", error);
      } finally {
         setShowSpinner(false);
      }
   };
   
   return (
      <EmailQueueContext.Provider
         value={{
            showSpinner,
            setShowSpinner,
            getEmailQueues,
            emailQueues,
            setEmailQueues,
            selectedEmailQueueIds,
            setSelectedEmailQueueIds,
            selectedEmailTaskIds,
            setSelectedEmailTaskIds,
            selectedTaskIds,
            setSelectedTaskIds,
            allCompanies,
            getAllCompanies,
            setAllCompanies,
            servers,
            getServers,
            setServers,
            getAllCounties,
            setAllCounties,
            allCounties,
            bulkRecords,
            setBulkRecords,
            filteredRecords,
            setFilteredRecords,
            selectedFilteredEmailQueueId,
            setSelectedFilteredEmailQueueId,
            serverEmailLogs,
            getServerEmailLogs,
            setServerEmailLogs,
            selectedServerLogIds,
            setselectedServerLogIdsIds,
            filteredServerLogRecords,
            setFilteredServerLogRecords,
            bulkServerLogRecords,
            setBulkServerLogRecords,
            selectedFilteredServerEmailQueueId,
            setSelectedFilteredServerEmailQueueId,
            mailManagementQueue,
            getMailManagementQueue,
            setMailManagementQueue,
            bulkMailManagementQueue,
            setBulkMailManagementQueue,
            filteredMailManagementQueue,
            setFilteredMailManagementQueue
         }}
      >
         {children}
      </EmailQueueContext.Provider>
   );
}

export const useEmailQueueContext = (): EmailQueueContextType => {
   // Get the context value using useContext
   const context = useContext(EmailQueueContext);
   // If the context is not found, throw an error
   if (!context) {
      throw new Error(
         "useEmailQueueContext must be used within a EmailQueueProvider"
      );
   }

   return context;
};